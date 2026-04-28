"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SpinWheel from "@/components/SpinWheel";
import ResultModal from "@/components/ResultModal";
import BackgroundEffects from "@/components/BackgroundEffects";
import { LOCALSTORAGE_KEY, type SegmentResult } from "@/lib/wheel";

export default function Page() {
  const [spinCount, setSpinCount] = useState(0);
  const [modalResult, setModalResult] = useState<SegmentResult | null>(null);

  useEffect(() => {
    const count = parseInt(localStorage.getItem(LOCALSTORAGE_KEY) || "0", 10);
    if (!isNaN(count)) {
      setSpinCount(count);
    }
  }, []);

  function handleSpinComplete(result: SegmentResult) {
    setSpinCount((prev) => prev + 1);
    setModalResult(result);
  }

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col relative bg-background">
      <BackgroundEffects />
      <Loader />
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-16 md:pt-20 lg:pt-24 px-4 relative z-10">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-16">
          <div className="flex-1 flex justify-center lg:justify-end w-full max-w-xl shrink-0">
            <Hero />
          </div>

          <div className="flex-1 flex justify-center lg:justify-start w-full">
            <SpinWheel spinCount={spinCount} onSpinComplete={handleSpinComplete} />
          </div>
        </div>
      </main>

      <footer className="absolute bottom-4 left-0 w-full z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 flex justify-between gap-3 text-[10px] sm:text-xs text-subtle/50">
          <span>Powered by GDG Noida</span>
          <span>Data & GenAI Nexus 7.0</span>
        </div>
      </footer>

      <ResultModal result={modalResult} spinCount={spinCount} onClose={() => setModalResult(null)} />
    </div>
  );
}
