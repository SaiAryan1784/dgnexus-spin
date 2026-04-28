"use client";

import { motion } from "framer-motion";

export default function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1E3A8A 1px, transparent 1px), linear-gradient(to bottom, #1E3A8A 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Gradient Blobs */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#4285F4]/20 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -50, 20, 0],
          y: [0, 40, -30, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] -right-[10%] w-[45%] h-[45%] rounded-full bg-[#EA4335]/20 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -50, 30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#FBBC04]/20 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -30, 40, 0],
          y: [0, 50, -20, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#34A853]/20 blur-[120px]"
      />
    </div>
  );
}
