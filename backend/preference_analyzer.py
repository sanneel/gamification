"""
Deterministic preference analyzer.

Takes a decision_memory summary dict and produces structured findings about
filter drift, score calibration, category waste, and keyword waste.

Rules:
- No AI calls.
- No mutations to any data.
- Every finding carries confidence, a proposed_change, supporting product IDs, and risk level.
- Minimum sample sizes are enforced before drawing conclusions.
"""
import logging
from dataclasses import asdict, dataclass, field
from typing import Any

log = logging.getLogger(__name__)

# Minimum number of products before we draw a conclusion
_MIN_TOTAL = 15
_MIN_CATEGORY_SAMPLE = 5
_MIN_KEYWORD_SAMPLE = 10
_MIN_PIPELINE_SAMPLE = 10


@dataclass
class Finding:
    type: str
    confidence: float          # 0.0 – 1.0
    headline: str
    detail: str
    proposed_change: dict
    supporting_ids: list[int] = field(default_factory=list)
    risk: str = "low"          # 'low' | 'medium' | 'high'

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# ── Public entry point ────────────────────────────────────────────────────────

def analyze(summary: dict, settings: dict) -> tuple[list[dict], dict]:
    """
    Run all deterministic checks.

    Returns (findings, status) where:
      findings — list of Finding dicts sorted by confidence descending.
                 Empty list when there is not enough data yet.
      status   — dict always present with keys:
                   ready       bool   True when the minimum sample was met
                   accepted    int    number of accepted decisions seen
                   rejected    int    number of rejected decisions seen
                   total       int    accepted + rejected
                   min_required int   minimum total needed to produce findings
                   reason      str    human-readable explanation when ready=False
    """
    totals = summary.get("totals", {})
    accepted_total = int(totals.get("accepted", 0))
    rejected_total = int(totals.get("rejected", 0))
    decision_total = accepted_total + rejected_total

    status: dict = {
        "ready": False,
        "accepted": accepted_total,
        "rejected": rejected_total,
        "total": decision_total,
        "min_required": _MIN_TOTAL,
        "reason": "",
    }

    if decision_total < _MIN_TOTAL:
        needed = _MIN_TOTAL - decision_total
        status["reason"] = (
            f"Not enough decisions yet — need {needed} more accepted or rejected products "
            f"(have {decision_total}, minimum is {_MIN_TOTAL}). "
            f"Run a scan, review some products, and call this endpoint again."
        )
        log.info("preference_analyzer: %s", status["reason"])
        return [], status

    status["ready"] = True
    status["reason"] = f"Analysis ran over {decision_total} decisions ({accepted_total} accepted, {rejected_total} rejected)."

    outcome_map = {r["outcome"]: r for r in summary.get("outcome_stats", [])}
    findings: list[Finding] = []

    _check_score_threshold(findings, outcome_map, accepted_total, rejected_total)
    _check_margin_threshold(findings, summary, settings)
    _check_high_score_rejections(findings, summary)
    _check_low_score_accepted(findings, summary)
    _check_category_waste(findings, summary)
    _check_keyword_waste(findings, summary)
    _check_pipeline_dominance(findings, summary)

    findings.sort(key=lambda f: f.confidence, reverse=True)
    return [f.to_dict() for f in findings], status


# ── Confidence helper ─────────────────────────────────────────────────────────

def _conf(sample_size: int, effect: float) -> float:
    """
    Composite confidence.
    sample_factor saturates at 40 examples; effect is 0–1 signal strength.
    """
    sample_factor = min(1.0, sample_size / 40)
    return round(min(0.99, sample_factor * max(0.0, effect)), 2)


# ── Individual checks ─────────────────────────────────────────────────────────

def _check_score_threshold(
    findings: list[Finding],
    outcome_map: dict,
    accepted_total: int,
    rejected_total: int,
) -> None:
    acc = outcome_map.get("ACCEPTED")
    rej = outcome_map.get("REJECTED")

    if not acc or not rej:
        return
    if acc["avg_score"] is None or rej["avg_score"] is None:
        return

    gap = acc["avg_score"] - rej["avg_score"]

    # Finding A: Score distributions overlap significantly.
    # A healthy system should show clear separation; gap < 1.0 is a warning sign.
    if gap < 1.0 and accepted_total >= _MIN_TOTAL and rejected_total >= _MIN_TOTAL:
        effect = max(0.0, 1.0 - gap)
        findings.append(Finding(
            type="score_distribution_overlap",
            confidence=_conf(min(accepted_total, rejected_total), effect),
            headline=(
                f"Accepted and rejected products have similar AI scores "
                f"(accepted avg {acc['avg_score']:.1f} vs rejected avg {rej['avg_score']:.1f}, gap {gap:.1f})"
            ),
            detail=(
                f"A gap of only {gap:.1f} between accepted and rejected mean scores suggests "
                f"the AI score is not cleanly separating products you want from those you don't. "
                f"Possible causes: the store_match threshold is too blunt; niche_fit or visual_appeal "
                f"may be better predictors than the composite score; or the AI prompt weights "
                f"the wrong dimensions for this store."
            ),
            proposed_change={
                "area": "enrichment_prompt",
                "finding": "score_overlap",
                "note": (
                    "Investigate whether niche_fit alone is a stronger predictor. "
                    "If accepted avg niche_fit >> rejected avg niche_fit, raise its weight in the formula."
                ),
            },
            risk="medium",
        ))

    # Finding B: You have accepted products with scores below the current
    # store_match floor (8.5), meaning the AI is rejecting viable products.
    min_accepted = acc.get("min_score")
    if min_accepted is not None and min_accepted < 7.5 and accepted_total >= _MIN_TOTAL:
        delta = 8.5 - min_accepted
        findings.append(Finding(
            type="store_match_threshold_too_high",
            confidence=_conf(accepted_total, min(1.0, delta / 3.0)),
            headline=(
                f"Accepted products go as low as score {min_accepted:.1f}, "
                f"below the store_match floor of 8.5"
            ),
            detail=(
                f"The Gemini enrichment prompt requires score >= 8.5 AND niche_fit >= 8.0 for "
                f"store_match=true, but your accepted products include items scoring as low as "
                f"{min_accepted:.1f}. Products between {min_accepted:.1f} and 8.5 are being "
                f"auto-rejected by the AI but you have shown you will accept some of them."
            ),
            proposed_change={
                "area": "enrichment_prompt",
                "field": "store_match rule",
                "current": "score >= 8.5 AND niche_fit >= 8.0",
                "proposed": f"score >= {max(6.5, round(min_accepted - 0.5, 1))} AND niche_fit >= 7.5",
                "note": "Lower threshold by ~1 point and re-evaluate acceptance rate.",
            },
            risk="medium",
        ))

    # Finding C: Niche-fit gap — stronger or weaker predictor than composite score?
    if acc.get("avg_niche_fit") is not None and rej.get("avg_niche_fit") is not None:
        nf_gap = acc["avg_niche_fit"] - rej["avg_niche_fit"]
        if nf_gap > gap + 0.5:
            findings.append(Finding(
                type="niche_fit_better_predictor",
                confidence=_conf(min(accepted_total, rejected_total), min(1.0, nf_gap / 3.0)),
                headline=(
                    f"niche_fit separates decisions better than composite score "
                    f"(niche_fit gap {nf_gap:.1f} vs score gap {gap:.1f})"
                ),
                detail=(
                    f"Accepted products average niche_fit {acc['avg_niche_fit']:.1f} "
                    f"vs rejected {rej['avg_niche_fit']:.1f} (gap {nf_gap:.1f}). "
                    f"This is larger than the composite score gap ({gap:.1f}), "
                    f"suggesting niche_fit is a stronger signal of what you actually want. "
                    f"The current scoring formula weights niche_fit at 50% — increasing it "
                    f"or using it as a standalone gate could improve precision."
                ),
                proposed_change={
                    "area": "enrichment_prompt",
                    "field": "store_match rule",
                    "note": "Consider 'niche_fit >= 8.0' as a necessary condition regardless of composite score.",
                },
                risk="low",
            ))


def _check_margin_threshold(
    findings: list[Finding],
    summary: dict,
    settings: dict,
) -> None:
    min_margin = float(settings.get("min_margin", 60.0))
    buckets = {b["bucket"]: b for b in summary.get("margin_buckets", [])}

    # Products rejected with margins in the 50-60% band are potential false negatives
    near_threshold = buckets.get("50-60", {})
    rejected_near = int(near_threshold.get("rejected", 0))
    accepted_near = int(near_threshold.get("accepted", 0))

    if rejected_near < 5:
        return

    # How many accepted products already live near or below threshold?
    accepted_ratio = accepted_near / (accepted_near + rejected_near) if (accepted_near + rejected_near) else 0

    findings.append(Finding(
        type="margin_threshold_calibration",
        confidence=_conf(rejected_near, min(1.0, rejected_near / 30)),
        headline=(
            f"{rejected_near} rejected products had 50–60% margin "
            f"(current min_margin: {min_margin:.0f}%)"
        ),
        detail=(
            f"{rejected_near} products were rejected with margins in the 50–60% band. "
            f"{'Meanwhile ' + str(accepted_near) + ' accepted products also sit in this range, ' if accepted_near else ''}"
            f"suggesting the {min_margin:.0f}% threshold may be excluding viable products. "
            f"Accepted products in this band show you tolerate these margins in practice."
        ),
        proposed_change={
            "area": "settings",
            "field": "min_margin",
            "current": min_margin,
            "proposed": 55.0,
            "note": (
                "Lowering to 55% recovers products in the 55–60% band. "
                "Verify margin impact on total profit before applying."
            ),
        },
        risk="low",
    ))


def _check_high_score_rejections(findings: list[Finding], summary: dict) -> None:
    items = summary.get("high_score_rejected", [])
    if len(items) < 3:
        return

    # Group by dominant rejection reason
    reason_groups: dict[str, list] = {}
    for p in items:
        reason = (p.get("rejection_reason") or "unknown").strip()
        reason_groups.setdefault(reason, []).append(p)

    dominant_reason, dominant_group = max(reason_groups.items(), key=lambda kv: len(kv[1]))
    n = len(dominant_group)
    avg_score = sum(p["score"] for p in dominant_group if p.get("score")) / max(n, 1)
    supporting_ids = [p["id"] for p in dominant_group[:10]]

    findings.append(Finding(
        type="high_score_rejections",
        confidence=_conf(n, min(1.0, avg_score / 10.0)),
        headline=(
            f"{len(items)} products with score >= 7.5 were rejected "
            f"(top reason: '{dominant_reason}', {n} products, avg score {avg_score:.1f})"
        ),
        detail=(
            f"The AI scored {len(items)} products >= 7.5 but they were rejected. "
            f"The most common rejection reason was '{dominant_reason}' ({n} products, avg score {avg_score:.1f}). "
            f"Two interpretations: (1) The AI is over-confident — these products look good on paper "
            f"but have visual or taste issues the current prompt misses. "
            f"(2) The rejection reason is a mislabelled proxy for another problem "
            f"(e.g. 'has_chinese_text' rejecting otherwise good products). "
            f"Review the supporting product IDs to determine which."
        ),
        proposed_change={
            "area": "enrichment_prompt",
            "finding": "ai_overconfident",
            "dominant_rejection_reason": dominant_reason,
            "sample_size": n,
            "note": (
                f"If visual quality is the real issue, add explicit visual rejection criteria to "
                f"the Gemini prompt that match '{dominant_reason}' products."
            ),
        },
        supporting_ids=supporting_ids,
        risk="medium",
    ))


def _check_low_score_accepted(findings: list[Finding], summary: dict) -> None:
    items = summary.get("low_score_accepted", [])
    if len(items) < 3:
        return

    valid = [p for p in items if p.get("score") is not None]
    if not valid:
        return

    avg_score = sum(p["score"] for p in valid) / len(valid)
    supporting_ids = [p["id"] for p in valid[:10]]

    # Group by category to see if there's a pattern
    cat_counts: dict[str, int] = {}
    for p in valid:
        cat = p.get("category") or "unknown"
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
    top_cat = max(cat_counts, key=cat_counts.__getitem__) if cat_counts else "unknown"

    findings.append(Finding(
        type="low_score_accepted",
        confidence=_conf(len(valid), min(1.0, (7.0 - avg_score) / 2.0)),
        headline=(
            f"{len(valid)} products with score < 7.0 were accepted "
            f"(avg score {avg_score:.1f}, most common category: '{top_cat}')"
        ),
        detail=(
            f"You accepted {len(valid)} products that the AI scored below 7.0 (avg {avg_score:.1f}). "
            f"This reveals the AI is systematically undervaluing something you find acceptable. "
            f"Likely causes: visual quality the AI cannot fully judge from a single image; "
            f"emotional or gifting potential the current prompt doesn't weight enough; "
            f"or category-specific standards the prompt treats uniformly. "
            f"The '{top_cat}' category appears {cat_counts.get(top_cat, 0)} times in this set."
        ),
        proposed_change={
            "area": "enrichment_prompt",
            "finding": "ai_undervaluing",
            "top_category": top_cat,
            "note": (
                f"Review the {len(valid)} accepted low-score products. "
                f"If they share a visual or category pattern, add explicit positive scoring "
                f"criteria to the Gemini prompt for that pattern."
            ),
        },
        supporting_ids=supporting_ids,
        risk="medium",
    ))


def _check_category_waste(findings: list[Finding], summary: dict) -> None:
    for cat in summary.get("categories", []):
        total = cat["total"]
        accepted = cat["accepted"]
        category = cat["category"]
        rate = cat["acceptance_rate"]

        if total < _MIN_CATEGORY_SAMPLE:
            continue

        if rate == 0.0 and total >= 10:
            findings.append(Finding(
                type="category_zero_acceptance",
                confidence=_conf(total, 1.0),
                headline=f"Category '{category}': 0% acceptance rate ({total} products processed, 0 accepted)",
                detail=(
                    f"Every one of the {total} products in '{category}' was rejected "
                    f"(avg score: {cat['avg_score']}). "
                    f"These products are consuming pipeline resources — scraping, basic filters, "
                    f"profit calculation, and potentially AI scoring — for zero return. "
                    f"Adding '{category}' to the bad-category list drops it before AI scoring."
                ),
                proposed_change={
                    "area": "scorer.py",
                    "field": "_BAD_CATEGORIES",
                    "action": "add",
                    "value": category,
                    "note": f"Add '{category}' to _BAD_CATEGORIES to pre-filter it before AI.",
                },
                risk="low",
            ))

        elif rate < 5.0 and total >= 20:
            findings.append(Finding(
                type="category_low_acceptance",
                confidence=_conf(total, min(1.0, (5.0 - rate) / 5.0)),
                headline=f"Category '{category}': {rate:.1f}% acceptance rate ({accepted}/{total} accepted)",
                detail=(
                    f"Only {accepted} of {total} products in '{category}' were accepted "
                    f"(avg score: {cat['avg_score']}, avg niche_fit: {cat['avg_niche_fit']}). "
                    f"The category is consistently underperforming. "
                    f"Options: raise the category penalty in scorer.py, add it to _BAD_CATEGORIES, "
                    f"or audit whether the keyword generating these products is misaligned."
                ),
                proposed_change={
                    "area": "scorer.py",
                    "field": "_BAD_CATEGORIES",
                    "action": "add",
                    "value": category,
                    "note": (
                        f"Alternatively, raise the penalty for '{category}' "
                        f"in the category bonus/penalty block without fully blocking it."
                    ),
                },
                risk="low",
            ))


def _check_keyword_waste(findings: list[Finding], summary: dict) -> None:
    for kw in summary.get("keywords", []):
        total = kw["total"]
        accepted = kw["accepted"]
        rate = kw["acceptance_rate"]

        if total < _MIN_KEYWORD_SAMPLE:
            continue

        if rate == 0.0 and total >= 15:
            findings.append(Finding(
                type="keyword_zero_acceptance",
                confidence=_conf(total, 1.0),
                headline=f"Keyword '{kw['keyword']}': 0 accepted products from {total} processed",
                detail=(
                    f"The search keyword '{kw['keyword']}' has produced {total} products, "
                    f"all rejected (avg score: {kw['avg_score']}). "
                    f"This keyword is not aligned with the store's taste. "
                    f"Consider removing it or replacing it with a more specific variant."
                ),
                proposed_change={
                    "area": "settings",
                    "field": "scan_keywords",
                    "action": "remove",
                    "value": kw["keyword"],
                    "note": f"Remove '{kw['keyword']}' from scan_keywords — no accepted products after {total} processed.",
                },
                risk="low",
            ))

        elif rate < 3.0 and total >= 25:
            findings.append(Finding(
                type="keyword_low_acceptance",
                confidence=_conf(total, min(1.0, (3.0 - rate) / 3.0)),
                headline=f"Keyword '{kw['keyword']}': {rate:.1f}% acceptance rate ({accepted}/{total})",
                detail=(
                    f"Only {accepted} of {total} products from '{kw['keyword']}' were accepted. "
                    f"Average score: {kw['avg_score']}. The keyword may be too generic or "
                    f"pulling products from the wrong market segment."
                ),
                proposed_change={
                    "area": "settings",
                    "field": "scan_keywords",
                    "action": "review",
                    "value": kw["keyword"],
                    "note": "Refine to a more specific variant or reduce its scan frequency.",
                },
                risk="low",
            ))


def _check_pipeline_dominance(findings: list[Finding], summary: dict) -> None:
    pipeline = summary.get("pipeline_breakdown", [])
    if not pipeline:
        return

    total_pipeline = sum(r["cnt"] for r in pipeline)
    if total_pipeline < _MIN_PIPELINE_SAMPLE:
        return

    # Flag the single filter rule responsible for > 50% of pipeline rejections
    for row in pipeline:
        cnt = row["cnt"]
        pct = cnt / total_pipeline * 100
        stage = row.get("filter_stage", "")
        reason = row.get("filter_reason", "")

        if pct > 50 and cnt >= 20:
            findings.append(Finding(
                type="pipeline_filter_dominance",
                confidence=_conf(cnt, min(1.0, pct / 100)),
                headline=(
                    f"Filter '{stage}' → '{reason}' is responsible for "
                    f"{pct:.0f}% of pipeline rejections ({cnt}/{total_pipeline})"
                ),
                detail=(
                    f"One rule dominates: '{stage}' rejecting with reason '{reason}' "
                    f"accounts for {cnt} of {total_pipeline} pipeline-level rejections ({pct:.0f}%). "
                    f"This concentration could indicate: the rule threshold is too aggressive; "
                    f"the incoming product mix changed and this rule no longer matches reality; "
                    f"or the rule is correct and the scan keywords need adjustment to avoid feeding it."
                ),
                proposed_change={
                    "area": "filter_engine.py",
                    "filter_stage": stage,
                    "filter_reason": reason,
                    "note": (
                        "Audit a random sample of products caught by this rule. "
                        "If >20% look like they could have been accepted, relax the threshold."
                    ),
                },
                risk="medium",
            ))
            break  # Only surface the single most dominant rule
