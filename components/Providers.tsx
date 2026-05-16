"use client";

import MiniCart from "@/components/MiniCart";
import RewardPopup from "@/components/RewardPopup";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MiniCart />
      <RewardPopup />
    </>
  );
}
