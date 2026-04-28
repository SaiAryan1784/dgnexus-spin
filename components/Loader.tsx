"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

// ─── Layout ────────────────────────────────────────────────────────────────
const SIZE = 360;
const IMG  = 220;
const PAD  = 18;
const RW   = IMG + PAD * 2;      // 256
const RH   = IMG + PAD * 2;      // 256
const PX   = (SIZE - RW) / 2;   // 52
const PY   = (SIZE - RH) / 2;   // 52
const RR   = 32;

// ─── Squarish path (rounded rect, clockwise) ───────────────────────────────
const RRPATH = [
  `M ${PX + RR} ${PY}`,
  `H ${PX + RW - RR}`,
  `Q ${PX + RW} ${PY} ${PX + RW} ${PY + RR}`,
  `V ${PY + RH - RR}`,
  `Q ${PX + RW} ${PY + RH} ${PX + RW - RR} ${PY + RH}`,
  `H ${PX + RR}`,
  `Q ${PX} ${PY + RH} ${PX} ${PY + RH - RR}`,
  `V ${PY + RR}`,
  `Q ${PX} ${PY} ${PX + RR} ${PY}`,
  `Z`,
].join(" ");

// ─── Path metrics ──────────────────────────────────────────────────────────
const PERI    = Math.round(4 * (RW - 2 * RR) + 2 * Math.PI * RR); // perimeter
const SEG     = Math.round(PERI / 7);   // snake length = 1/7 of path
const SPACING = Math.round(PERI / 4);   // 4 snakes evenly spaced = 1/4 apart
const GAP     = PERI - SEG;             // dasharray gap

const COLORS   = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];
const LOOP_DUR = 1.6; // seconds per full loop

// ─── Component ─────────────────────────────────────────────────────────────
export default function Loader() {
  // "running"  → snakes travel around the path
  // "stopping" → snakes slow and become the static connected border
  // "done"     → fade out
  const [phase, setPhase] = useState<"running" | "stopping" | "done">("running");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("stopping"), 1500);
    const t2 = setTimeout(() => setPhase("done"),     2500);
    const t3 = setTimeout(() => setVisible(false),    2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: "#F8F9FB" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
        >
          <div style={{ position: "relative", width: SIZE, height: SIZE }}>

            {/* ── og-image centred ──────────────────────────────────────── */}
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 18 }}
              style={{
                position: "absolute",
                left: (SIZE - IMG) / 2,
                top:  (SIZE - IMG) / 2,
                width:  IMG,
                height: IMG,
                borderRadius: RR,
                overflow: "hidden",
                boxShadow: "0 16px 48px rgba(30,58,138,0.18)",
              }}
            >
              <Image
                src="/og-image.png"
                fill
                alt="Data & GenAI Nexus"
                priority
                className="object-cover select-none"
              />
            </motion.div>

            {/* ── SVG animation layer ───────────────────────────────────── */}
            <svg
              width={SIZE}
              height={SIZE}
              style={{ position: "absolute", inset: 0, overflow: "visible" }}
            >
              <defs>
                <linearGradient id="ld-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#4285F4" />
                  <stop offset="33%"  stopColor="#EA4335" />
                  <stop offset="66%"  stopColor="#FBBC05" />
                  <stop offset="100%" stopColor="#34A853" />
                </linearGradient>
              </defs>

              {/* ── Phase "running": 4 snake-lines travelling the squarish path */}
              {COLORS.map((color, i) => {
                const baseOffset = -(i * SPACING);

                return (
                  <motion.path
                    key={`snake-${i}`}
                    d={RRPATH}
                    fill="none"
                    stroke={color}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={`${SEG} ${GAP}`}
                    initial={{ strokeDashoffset: baseOffset, opacity: 1 }}
                    animate={
                      phase === "running"
                        ? {
                            // continuously move along path
                            strokeDashoffset: [baseOffset, baseOffset - PERI],
                            opacity: 1,
                          }
                        : phase === "stopping"
                        ? {
                            // slow to a stop at an evenly-spaced resting position
                            strokeDashoffset: baseOffset - PERI * 1.25,
                            opacity: 0,
                          }
                        : { opacity: 0 }
                    }
                    transition={
                      phase === "running"
                        ? {
                            strokeDashoffset: {
                              duration: LOOP_DUR,
                              repeat: Infinity,
                              ease: "linear",
                              repeatType: "loop",
                            },
                            opacity: { duration: 0 },
                          }
                        : phase === "stopping"
                        ? {
                            strokeDashoffset: {
                              duration: 0.9,
                              ease: [0.45, 0, 0.55, 1], // ease-in-out — decelerates to stop
                            },
                            opacity: { duration: 0.4, delay: 0.5 },
                          }
                        : { opacity: { duration: 0.2 } }
                    }
                  />
                );
              })}

              {/* ── Phase "stopping": rainbow border draws in (the "connect") */}
              {phase !== "running" && (
                <motion.path
                  d={RRPATH}
                  fill="none"
                  stroke="url(#ld-grad)"
                  strokeWidth={7}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: phase === "done" ? 0 : 1,
                  }}
                  transition={{
                    pathLength: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
                    opacity:
                      phase === "done"
                        ? { duration: 0.35, delay: 0 }
                        : { duration: 0.15 },
                  }}
                />
              )}
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
