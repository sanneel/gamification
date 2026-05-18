"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SplitHeading } from "@/components/primitives/SplitHeading";

const ease = [0.16, 1, 0.3, 1] as const;

interface Option { id: string; label: string; description: string; vibes?: string[]; audience?: string }
interface Question { id: string; chapter: string; question: string; subtext?: string; options: Option[] }

const QUESTIONS: Question[] = [
  {
    id: "who",
    chapter: "Chapter I",
    question: "Who is the gift addressed to?",
    subtext: "Audience shapes everything that follows.",
    options: [
      { id: "for_her", label: "Her",            description: "A woman who deserves the room paused around her.",   audience: "for_her" },
      { id: "for_him", label: "Him",            description: "A man who will notice every detail.",                audience: "for_him" },
      { id: "couple",  label: "A couple",       description: "Two people. A story to share.",                       audience: "couple" },
      { id: "neutral", label: "Someone special",description: "Gender is irrelevant — they are simply everything.",  audience: "neutral" },
    ],
  },
  {
    id: "relationship",
    chapter: "Chapter II",
    question: "What is the relationship?",
    subtext: "Context lets the gift land where you intend.",
    options: [
      { id: "romantic", label: "Romantic",       description: "Partner, lover, the one I see first in the morning." },
      { id: "bestie",   label: "Best friend",    description: "The person who knows the unedited version of me." },
      { id: "family",   label: "Family",         description: "Mother, sibling, someone close to home." },
      { id: "new",      label: "New connection", description: "We are just beginning something." },
    ],
  },
  {
    id: "vibe",
    chapter: "Chapter III",
    question: "What is their tone?",
    subtext: "Pick the room they would feel most at ease in.",
    options: [
      { id: "luxury",    label: "Luxury",       description: "Appreciates the finer materials — brass, silk, lead crystal.", vibes: ["luxury","aesthetic"] },
      { id: "cozy",      label: "Cozy",         description: "Linen sheets, warm lamps, slow Sundays.",                       vibes: ["cozy","soft"] },
      { id: "aesthetic", label: "Aesthetic",    description: "Everything in their space has been carefully placed.",          vibes: ["aesthetic","cute"] },
      { id: "romantic",  label: "Romantic",     description: "Lives for love letters, candlelight, hand-written notes.",      vibes: ["romantic"] },
    ],
  },
  {
    id: "occasion",
    chapter: "Chapter IV",
    question: "What is the occasion?",
    options: [
      { id: "birthday",    label: "Birthday",       description: "Make the day feel cinematic." },
      { id: "anniversary", label: "Anniversary",    description: "Mark the chapter you have built together." },
      { id: "justbecause", label: "Just because",   description: "The best of all reasons." },
      { id: "apology",     label: "Reparation",     description: "Let the box say what is harder to say." },
    ],
  },
  {
    id: "budget",
    chapter: "Chapter V",
    question: "What is the budget?",
    subtext: "Box prices are always more generous than retail.",
    options: [
      { id: "small",  label: "Under 80 ₾", description: "Quietly thoughtful." },
      { id: "medium", label: "80 – 150 ₾", description: "The most-loved range." },
      { id: "large",  label: "150 – 250 ₾",description: "Cinematic." },
      { id: "xlarge", label: "250 ₾ +",     description: "No limits." },
    ],
  },
];

interface QuizResult {
  headline: string;
  intro: string;
  vibes: string[];
  audience: string;
  closing: string;
}

function computeResult(answers: Record<string, string>): QuizResult {
  const audience = answers.who ?? "neutral";
  const vibe     = answers.vibe ?? "luxury";

  const vibeMap: Record<string, string[]> = {
    luxury:    ["luxury", "aesthetic"],
    cozy:      ["cozy", "soft"],
    aesthetic: ["aesthetic", "cute"],
    romantic:  ["romantic", "luxury"],
  };

  const headlines: Record<string, { headline: string; intro: string }> = {
    luxury:    { headline: "The Luxury Lover",       intro: "Heavier objects. Quieter materials. The kind of gift that arrives in two layers of paper and a ribbon." },
    cozy:      { headline: "The Cozy Dreamer",       intro: "Linen, candles, the warmth of an evening in. A box for a slow opening." },
    aesthetic: { headline: "The Aesthetic Soul",     intro: "A curator's box — every object placed with the same care they bring to their own shelves." },
    romantic:  { headline: "The Hopeless Romantic",  intro: "Roses, perfume, a handwritten letter sealed with wax. The box opens like a chapter." },
  };

  const closings: Record<string, string> = {
    romantic: "A box they will talk about for months.",
    bestie:   "The exact gift your closest friend deserves.",
    family:   "Show them you know them better than they suspect.",
    new:      "The first impression you cannot take back.",
  };

  const chosen = headlines[vibe] ?? headlines.romantic;

  return {
    headline: chosen.headline,
    intro:    chosen.intro,
    closing:  closings[answers.relationship ?? "romantic"] ?? "A small ceremony, posted to their door.",
    vibes:    vibeMap[vibe] ?? ["romantic"],
    audience,
  };
}

const HERO_IMAGE = "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=2400&q=85";

export default function QuizPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [selected, setSelected]   = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [result, setResult]       = useState<QuizResult | null>(null);

  const question = QUESTIONS[stepIndex];
  const isLast = stepIndex === QUESTIONS.length - 1;
  const progress = ((stepIndex + 1) / QUESTIONS.length) * 100;

  function handleSelect(optionId: string) {
    setSelected(optionId);
    const newAnswers = { ...answers, [question.id]: optionId };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (isLast) {
        setResult(computeResult(newAnswers));
      } else {
        setDirection(1);
        setStepIndex((i) => i + 1);
        setSelected(null);
      }
    }, 460);
  }

  function handleBack() {
    if (stepIndex === 0) return;
    setDirection(-1);
    setStepIndex((i) => i - 1);
    setSelected(null);
  }

  function shopWithResult(r: QuizResult) {
    const params = new URLSearchParams();
    if (r.vibes.length) params.set("vibe", r.vibes[0]);
    if (r.audience !== "neutral") params.set("audience", r.audience);
    router.push(`/shop?${params.toString()}`);
  }

  if (result) {
    return (
      <main className="surface-bone min-h-dvh">
        <Navbar />
        <section className="relative h-[70vh] min-h-[480px] overflow-clip">
          <Image src={HERO_IMAGE} alt="" fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-[var(--ink)]/55" />
          <div className="grain-overlay absolute inset-0 opacity-25" />
          <div className="container-edge container-wide absolute inset-0 flex flex-col justify-end pb-16 text-[var(--bone)]">
            <p className="eyebrow opacity-70">Your match</p>
            <SplitHeading
              as="h1"
              className="font-display mt-6 text-display-xl leading-[0.88]"
            >
              {result.headline}.
            </SplitHeading>
          </div>
        </section>

        <section className="section container-edge container-wide">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="eyebrow text-[var(--storm-55)]">A short brief</p>
              <p className="mt-6 font-display text-quote text-[var(--ink)]">{result.intro}</p>
              <p className="mt-6 max-w-md text-body-lg text-[var(--storm-55)]">{result.closing}</p>
            </div>
            <div className="md:col-span-5 space-y-6">
              <div className="border border-[var(--hair-warm)] p-8">
                <p className="eyebrow text-[var(--storm-55)]">Recommended chapters</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {result.vibes.map((v) => (
                    <span key={v} className="box-badge box-badge--outline">{v}</span>
                  ))}
                </div>
                <button
                  onClick={() => shopWithResult(result)}
                  className="btn-cinematic btn-cinematic--primary mt-8 w-full justify-center"
                >
                  <span className="btn-cinematic__label flex items-center gap-3">
                    Shop curated picks <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              </div>

              <Link
                href="/build-a-box"
                className="btn-cinematic btn-cinematic--outline block text-center"
              >
                <span className="btn-cinematic__label">Compose a box directly</span>
              </Link>

              <button
                onClick={() => { setResult(null); setStepIndex(0); setAnswers({}); setSelected(null); }}
                className="link-reveal block w-full text-center text-[11px] uppercase tracking-[0.32em] text-[var(--storm-55)]"
              >
                Restart the quiz
              </button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="surface-bone min-h-dvh">
      <Navbar />

      {/* Header */}
      <section className="container-edge container-wide pt-40 pb-12">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={stepIndex === 0}
            className={clsx("eyebrow flex items-center gap-2 transition-opacity", stepIndex === 0 && "opacity-30 pointer-events-none")}
          >
            <ArrowLeft className="h-3 w-3" /> Previous chapter
          </button>
          <p className="eyebrow tabular text-[var(--storm-55)]">
            {String(stepIndex + 1).padStart(2,"0")} · {String(QUESTIONS.length).padStart(2,"0")}
          </p>
        </div>

        <div className="mt-6 h-px w-full bg-[var(--hair-warm)] overflow-clip">
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.8, ease }}
            style={{ transformOrigin: "left" }}
            className="block h-px bg-[var(--ink)]"
          />
        </div>
      </section>

      <section className="container-edge container-wide pb-44">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -direction * 60, filter: "blur(8px)" }}
            transition={{ duration: 0.7, ease }}
            className="grid grid-cols-1 gap-16 md:grid-cols-12"
          >
            <div className="md:col-span-5 md:sticky md:top-32 self-start">
              <p className="eyebrow text-[var(--storm-55)]">{question.chapter}</p>
              <SplitHeading
                as="h2"
                className="font-display mt-6 text-display-md leading-[0.95] text-[var(--ink)]"
              >
                {question.question}
              </SplitHeading>
              {question.subtext && (
                <p className="mt-6 max-w-sm text-body text-[var(--storm-55)]">{question.subtext}</p>
              )}
            </div>

            <div className="md:col-span-7 space-y-1">
              {question.options.map((opt, i) => {
                const isSelected = selected === opt.id || answers[question.id] === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease, delay: i * 0.05 }}
                    className={clsx(
                      "group flex w-full items-center justify-between border-b border-[var(--hair-warm)] py-7 text-left transition-colors",
                      isSelected ? "text-[var(--ink)]" : "text-[var(--storm-55)]",
                    )}
                  >
                    <div className="flex items-center gap-8">
                      <span className="font-display text-2xl tabular text-[var(--storm-35)]">
                        {String(i+1).padStart(2,"0")}
                      </span>
                      <div>
                        <p className={clsx(
                          "font-display text-2xl transition-colors group-hover:text-[var(--ink)]",
                          isSelected && "text-[var(--ink)]",
                        )}>
                          {opt.label}
                        </p>
                        <p className="mt-1 text-body-sm text-[var(--storm-55)]">{opt.description}</p>
                      </div>
                    </div>
                    <motion.span
                      animate={{ x: isSelected ? 6 : 0, opacity: isSelected ? 1 : 0.6 }}
                      className="flex items-center text-[var(--ink)]"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  </motion.button>
                );
              })}

              {isLast && selected && (
                <motion.button
                  onClick={() => setResult(computeResult(answers))}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="btn-cinematic btn-cinematic--primary mt-12 w-full justify-center"
                >
                  <span className="btn-cinematic__label flex items-center gap-3">
                    Reveal the match <ArrowRight className="h-3 w-3" />
                  </span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      <Footer />
    </main>
  );
}
