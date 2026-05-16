"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/motion";

interface ActivityEvent {
  id: string;
  type: "box_created" | "spin_win" | "purchase" | "quiz";
  name: string;
  location: string;
  detail: string;
  emoji: string;
  time: number; // ms ago
}

// Simulated events that rotate
const EVENT_POOL: Omit<ActivityEvent, "id" | "time">[] = [
  { type: "purchase", name: "Ana", location: "Tbilisi", detail: "just gifted a Romantic Box 🌹", emoji: "🎁" },
  { type: "spin_win", name: "Mariam", location: "Kutaisi", detail: "won Free Shipping on the wheel! 🎡", emoji: "🚚" },
  { type: "box_created", name: "Giorgi", location: "Batumi", detail: "is building a box for her 💗", emoji: "✨" },
  { type: "purchase", name: "Nino", location: "Tbilisi", detail: "just bought the Cozy Night Box 🕯️", emoji: "🎁" },
  { type: "quiz", name: "Sopo", location: "Rustavi", detail: "discovered they're a Luxury Lover 💎", emoji: "💎" },
  { type: "spin_win", name: "Irakli", location: "Tbilisi", detail: "scored 10% off with the lucky spin!", emoji: "💸" },
  { type: "box_created", name: "Tamta", location: "Gori", detail: "added Preserved Roses to their box 🌸", emoji: "🌸" },
  { type: "purchase", name: "Keti", location: "Zugdidi", detail: "sent a surprise box to her partner 💌", emoji: "💌" },
  { type: "spin_win", name: "Luka", location: "Tbilisi", detail: "unlocked a Secret Item! 🎁", emoji: "🎁" },
  { type: "quiz", name: "Nata", location: "Poti", detail: "is now building their first box ✨", emoji: "✨" },
  { type: "purchase", name: "Dito", location: "Tbilisi", detail: "gifted the Anniversary Box 🥂", emoji: "🥂" },
  { type: "box_created", name: "Elene", location: "Kutaisi", detail: "picked Crystal Perfume as main gift 💎", emoji: "💜" },
];

function timeLabel(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

let idCounter = 0;
function makeEvent(poolIndex: number, time: number): ActivityEvent {
  const base = EVENT_POOL[poolIndex % EVENT_POOL.length];
  return { ...base, id: String(++idCounter), time };
}

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const poolIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Push a new event
  function pushEvent() {
    const newEvent = makeEvent(poolIndexRef.current++, Math.floor(Math.random() * 90) * 1000);
    setEvents((prev) => [newEvent, ...prev].slice(0, 5));
    // Schedule next
    const next = 4000 + Math.random() * 5000;
    timerRef.current = setTimeout(pushEvent, next);
  }

  useEffect(() => {
    // Seed 2 events immediately
    for (let i = 0; i < 2; i++) {
      const event = makeEvent(i, (30 + i * 45) * 1000);
      setEvents((prev) => [...prev, event]);
      poolIndexRef.current++;
    }
    // Start stream
    timerRef.current = setTimeout(pushEvent, 3500);
    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-2 pointer-events-none select-none">
      <AnimatePresence mode="popLayout">
        {events.slice(0, 4).map((event) => (
          <motion.div
            key={event.id}
            layout
            initial={{ opacity: 0, x: -32, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24, scale: 0.88 }}
            transition={springs.gentle}
            className="flex items-center gap-3 glass border border-white/8 rounded-2xl px-4 py-3 w-full max-w-xs"
          >
            <motion.span
              className="text-xl shrink-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springs.bouncy}
            >
              {event.emoji}
            </motion.span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold leading-tight truncate">
                <span className="text-accent">{event.name}</span>
                {" "}<span className="text-white/40 font-normal">{event.location}</span>
              </p>
              <p className="text-white/50 text-xs truncate">{event.detail}</p>
            </div>
            <span className="text-white/20 text-[10px] shrink-0 font-bold">{timeLabel(event.time)}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
