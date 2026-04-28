"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 lg:gap-8 w-full px-4 lg:px-0">
      {/* Event logo */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[160px] sm:max-w-[240px] lg:max-w-md mx-auto lg:mx-0"
        style={{ filter: "drop-shadow(0 8px 32px rgba(30,58,138,0.18))" }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/event-logo.png"
            width={520}
            height={150}
            alt="Data & GenAI Nexus 7.0"
            priority
            className="w-full h-auto"
          />
        </motion.div>
      </motion.div>

      {/* Subtitle — hidden on mobile to save vertical space */}
      <motion.p
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden sm:inline-block text-sm sm:text-base md:text-lg max-w-sm lg:max-w-md leading-relaxed mx-auto lg:mx-0 py-2 px-4 rounded-xl"
        style={{
          color: "#0F172A",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontWeight: 500,
          letterSpacing: "0.01em",
          background: "rgba(255,255,255,0.72)",
          boxShadow: "0 2px 16px rgba(30,58,138,0.08)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(30,58,138,0.12)",
        }}
      >
        Where Data Meets Generative Intelligence
      </motion.p>
    </div>
  );
}
