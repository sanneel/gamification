"use client";

import MiniCart from "@/components/MiniCart";
import RewardPopup from "@/components/RewardPopup";
import { LenisProvider } from "@/lib/animation/lenis-provider";
import { PageTransition } from "@/lib/animation/page-transition";
import { GrainOverlay } from "@/components/primitives/GrainOverlay";
import { ScrollProgress } from "@/components/primitives/ScrollProgress";
import { Preloader } from "@/components/Preloader";
import { useEffect, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <LenisProvider>
      {mounted && <Preloader />}
      <PageTransition>{children}</PageTransition>
      <MiniCart />
      <RewardPopup />
      {mounted && (
        <>
          <ScrollProgress />
          <GrainOverlay />
        </>
      )}
    </LenisProvider>
  );
}
