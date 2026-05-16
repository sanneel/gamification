"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { springs, ease } from "@/lib/motion";
import AmbientBg from "@/components/AmbientBg";

// ─── Quiz Data ────────────────────────────────────────────────────────────────

interface Option {
  id: string;
  label: string;
  emoji: string;
  description: string;
  vibes?: string[];
  audience?: string;
}

interface Question {
  id: string;
  question: string;
  subtext?: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: "who",
    question: "Who is this gift for?",
    subtext: "Let's make sure this feels perfectly right",
    options: [
      { id: "for_her", label: "Her", emoji: "💗", description: "A woman who deserves the world", audience: "for_her" },
      { id: "for_him", label: "Him", emoji: "💙", description: "A man who'll love every detail", audience: "for_him" },
      { id: "couple", label: "A couple", emoji: "💑", description: "Two people, one perfect box", audience: "couple" },
      { id: "neutral", label: "Just someone special", emoji: "✨", description: "Gender is irrelevant — they're everything", audience: "neutral" },
    ],
  },
  {
    id: "relationship",
    question: "What's the relationship?",
    subtext: "Context makes the gift land differently",
    options: [
      { id: "romantic", label: "Romantic", emoji: "🌹", description: "Partner, lover, someone I adore" },
      { id: "bestie", label: "Best friend", emoji: "🫂", description: "The one who gets me completely" },
      { id: "family", label: "Family", emoji: "🏡", description: "Mom, sibling, someone close to home" },
      { id: "new", label: "New connection", emoji: "🦋", description: "We're just starting something" },
    ],
  },
  {
    id: "vibe",
    question: "Pick their vibe",
    subtext: "This shapes everything we recommend",
    options: [
      { id: "luxury", label: "Luxury lover", emoji: "💎", description: "Appreciates the finer things", vibes: ["luxury", "aesthetic"] },
      { id: "cozy", label: "Cozy homebody", emoji: "🕯️", description: "Coffee, blankets, soft evenings", vibes: ["cozy", "soft"] },
      { id: "aesthetic", label: "Aesthetic girlie", emoji: "🌸", description: "Everything in their space is curated", vibes: ["aesthetic", "cute"] },
      { id: "romantic", label: "Hopeless romantic", emoji: "🌙", description: "Lives for love letters and roses", vibes: ["romantic"] },
    ],
  },
  {
    id: "occasion",
    question: "What's the occasion?",
    options: [
      { id: "birthday", label: "Birthday", emoji: "🎂", description: "Make it unforgettable" },
      { id: "anniversary", label: "Anniversary", emoji: "🥂", description: "Celebrate what you've built" },
      { id: "justbecause", label: "Just because", emoji: "💛", description: "The best reason of all" },
      { id: "apology", label: "I messed up", emoji: "😅", description: "Let this do the talking" },
    ],
  },
  {
    id: "budget",
    question: "How much do you want to spend?",
    subtext: "Box prices — always better than buying separately",
    options: [
      { id: "small", label: "Under 80 ₾", emoji: "🌱", description: "Thoughtful and sweet" },
      { id: "medium", label: "80–150 ₾", emoji: "🌟", description: "The sweet spot" },
      { id: "large", label: "150–250 ₾", emoji: "🔥", description: "Go all in" },
      { id: "xlarge", label: "250 ₾+", emoji: "👑", description: "No limits, just love" },
    ],
  },
];

// ─── Results mapping ──────────────────────────────────────────────────────────

interface QuizResult {
  headline: string;
  subline: string;
  emoji: string;
  color: string;
  vibes: string[];
  audience: string;
  message: string;
}

function computeResult(answers: Record<string, string>): QuizResult {
  const audience = answers.who ?? "neutral";
  const vibe = answers.vibe ?? "luxury";

  const vibeMap: Record<string, string[]> = {
    luxury: ["luxury", "aesthetic"],
    cozy: ["cozy", "soft"],
    aesthetic: ["aesthetic", "cute"],
    romantic: ["romantic", "luxury"],
  };

  const headlines: Record<string, { headline: string; emoji: string; color: string; message: string }> = {
    luxury: { headline: "The Luxury Lover", emoji: "💎", color: "#FFD700", message: "Premium picks, elevated unboxing, maximum wow." },
    cozy: { headline: "The Cozy Dreamer", emoji: "🕯️", color: "#C084FC", message: "Warm, soft, and impossibly comforting choices." },
    aesthetic: { headline: "The Aesthetic Soul", emoji: "🌸", color: "#FF2D78", message: "Curated details, visual harmony, pure delight." },
    romantic: { headline: "The Hopeless Romantic", emoji: "🌹", color: "#FF6B9D", message: "Every item chosen to make their heart skip." },
  };

  const chosen = headlines[vibe] ?? headlines.romantic;
  const sublines: Record<string, string> = {
    romantic: "A box they'll talk about for months.",
    bestie: "The exact gift your best friend deserves.",
    family: "Show them how well you know them.",
    new: "Make the best first impression of your life.",
  };

  return {
    headline: chosen.headline,
    emoji: chosen.emoji,
    color: chosen.color,
    message: chosen.message,
    subline: sublines[answers.relationship ?? "romantic"] ?? "A box that speaks before you do.",
    vibes: vibeMap[vibe] ?? ["romantic"],
    audience,
  };
}

// ─── Components ───────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg, #FF2D78, #7C3AED)" }}
        initial={{ width: 0 }}
        animate={{ width: `${((current + 1) / total) * 100}%` }}
        transition={{ duration: 0.4, ease: ease.expo }}
      />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [result, setResult] = useState<QuizResult | null>(null);

  const question = QUESTIONS[stepIndex];
  const isLast = stepIndex === QUESTIONS.length - 1;

  function handleSelect(optionId: string) {
    setSelected(optionId);
    const newAnswers = { ...answers, [question.id]: optionId };
    setAnswers(newAnswers);

    // Auto-advance after a short delight pause
    setTimeout(() => {
      if (isLast) {
        setResult(computeResult(newAnswers));
      } else {
        setDirection(1);
        setStepIndex((i) => i + 1);
        setSelected(null);
      }
    }, 380);
  }

  function handleBack() {
    if (stepIndex === 0) return;
    setDirection(-1);
    setStepIndex((i) => i - 1);
    setSelected(null);
  }

  function handleShopWithResult(r: QuizResult) {
    const params = new URLSearchParams();
    if (r.vibes.length) params.set("vibe", r.vibes[0]);
    if (r.audience !== "neutral") params.set("audience", r.audience);
    router.push(`/shop?${params.toString()}`);
  }

  if (result) {
    return (
      <div className="relative min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
        <AmbientBg variant="rose" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
            style={{ background: result.color }} />
        </div>

        <motion.div
          className="relative z-10 max-w-sm w-full text-center"
          initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: ease.expo }}
        >
          {/* Result emoji */}
          <motion.div
            className="text-7xl mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ delay: 0.3, duration: 1.2, ease: ease.back }}
          >
            {result.emoji}
          </motion.div>

          <motion.p
            className="text-xs uppercase tracking-[0.3em] font-black mb-3"
            style={{ color: result.color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Your match
          </motion.p>

          <motion.h1
            className="font-display text-4xl font-bold text-white mb-3 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: ease.expo }}
          >
            {result.headline}
          </motion.h1>

          <motion.p
            className="text-white/60 text-lg mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
          >
            {result.message}
          </motion.p>

          <motion.p
            className="text-white/35 text-sm mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
          >
            {result.subline}
          </motion.p>

          {/* Vibe tags */}
          <motion.div
            className="flex justify-center gap-2 mb-10 flex-wrap"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
          >
            {result.vibes.map((v) => (
              <span key={v} className="text-xs px-3 py-1.5 rounded-full bg-white/8 text-white/50 border border-white/10 font-bold uppercase tracking-wider">
                {v}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05 }}
          >
            <motion.button
              className="btn-dopamine w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
              onClick={() => handleShopWithResult(result)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Sparkles className="w-4 h-4" />
              Shop Curated Picks
            </motion.button>
            <Link
              href="/build-a-box"
              className="block w-full py-4 rounded-2xl text-sm font-bold text-white/50 border border-white/10 text-center hover:text-white hover:border-white/25 transition-all"
            >
              Build My Box Directly →
            </Link>
            <button
              onClick={() => { setResult(null); setStepIndex(0); setAnswers({}); setSelected(null); }}
              className="text-white/25 text-xs hover:text-white/50 transition-colors w-full py-2"
            >
              Start over
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-ink flex flex-col overflow-hidden">
      <AmbientBg variant="violet" />
      {/* Nav */}
      <nav className="px-5 py-5 flex items-center justify-between">
        <button
          onClick={handleBack}
          className={`flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm ${stepIndex === 0 ? "opacity-0 pointer-events-none" : ""}`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Link href="/" className="font-display text-xl font-bold text-white">gamif<span className="text-accent">.</span></Link>
        <span className="text-white/25 text-xs font-bold">{stepIndex + 1}/{QUESTIONS.length}</span>
      </nav>

      <div className="px-5 mb-8">
        <ProgressBar current={stepIndex} total={QUESTIONS.length} />
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 max-w-lg mx-auto w-full pb-16">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -direction * 50, filter: "blur(8px)" }}
            transition={{ duration: 0.45, ease: ease.expo }}
          >
            {/* Question */}
            <div className="mb-8">
              <motion.p
                className="text-accent text-xs font-black uppercase tracking-[0.25em] mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08 }}
              >
                Question {stepIndex + 1}
              </motion.p>
              <motion.h2
                className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight mb-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.5, ease: ease.expo }}
              >
                {question.question}
              </motion.h2>
              {question.subtext && (
                <motion.p
                  className="text-white/40 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {question.subtext}
                </motion.p>
              )}
            </div>

            {/* Options */}
            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {question.options.map((opt) => {
                const isSelected = selected === opt.id || answers[question.id] === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: ease.expo } },
                    }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-accent/60 bg-accent/12 shadow-[0_0_24px_rgba(255,45,120,0.2)]"
                        : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6"
                    }`}
                  >
                    <motion.span
                      className="text-3xl shrink-0"
                      animate={isSelected ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      {opt.emoji}
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${isSelected ? "text-white" : "text-white/80"}`}>{opt.label}</p>
                      <p className="text-white/35 text-xs">{opt.description}</p>
                    </div>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={springs.bouncy}
                        >
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Manual next on last step */}
            {isLast && selected && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={() => setResult(computeResult(answers))}
                  className="btn-dopamine w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Reveal My Box
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
