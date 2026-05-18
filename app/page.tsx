"use client";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  HeroCinema,
  VelocityMarquee,
  MaskedManifesto,
  HorizontalActs,
  AudiencesScene,
  DepthGallery,
  TestimonialReel,
  FinalInvite,
} from "@/components/sections";

export default function HomePage() {
  return (
    <main className="surface-bone relative overflow-clip">
      <Navbar />
      <HeroCinema />
      <VelocityMarquee />
      <MaskedManifesto />
      <HorizontalActs />
      <AudiencesScene />
      <DepthGallery />
      <TestimonialReel />
      <FinalInvite />
      <Footer />
    </main>
  );
}
