"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BASE_REGISTRATION_URL, type SegmentResult } from "@/lib/wheel";

// ── Confetti ──────────────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  vr: number;
  shape: "rect" | "circle";
  size: number;
  opacity: number;
}

const CONFETTI_COLORS = [
  "#3730A3",
  "#1E3A8A",
  "#7C3AED",
  "#0D9488",
  "#F59E0B",
  "#60A5FA",
];

function ConfettiOverlay({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    let particles: Particle[] = Array.from({ length: 28 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 80,
      y: H * 0.35,
      vx: (Math.random() - 0.5) * 9,
      vy: -(Math.random() * 9 + 5),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.25,
      shape: Math.random() > 0.35 ? "rect" : "circle",
      size: Math.random() * 5 + 4,
      opacity: 1,
    }));

    const startTime = performance.now();
    const duration = 3000;

    function frame(ts: number) {
      const elapsed = ts - startTime;
      ctx!.clearRect(0, 0, W, H);

      particles = particles.filter((p) => p.opacity > 0.02 && p.y < H + 20);

      for (const p of particles) {
        p.vy += 0.22;
        p.vx *= 0.99;
        p.x += p.vx + Math.sin(elapsed * 0.003 + p.x) * 0.4;
        p.y += p.vy;
        p.rotation += p.vr;
        if (elapsed > duration * 0.6) {
          p.opacity -= 0.018;
        }

        ctx!.save();
        ctx!.globalAlpha = Math.max(p.opacity, 0);
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        if (p.shape === "rect") {
          ctx!.fillRect(-p.size / 2, -p.size, p.size, p.size * 2);
        } else {
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.restore();
      }

      if (particles.length > 0 && elapsed < duration + 1000) {
        rafRef.current = requestAnimationFrame(frame);
      }
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl"
    />
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28 } },
  exit: { opacity: 0, transition: { duration: 0.22 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.84, y: 44 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.93, y: 16, transition: { duration: 0.2 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

interface ResultModalProps {
  result: SegmentResult | null;
  spinCount: number;
  onClose: () => void;
}

export default function ResultModal({ result, spinCount, onClose }: ResultModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, onClose]);

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getRegistrationURL(result: SegmentResult) {
    if (result.type === "win") {
      return `${BASE_REGISTRATION_URL}?coupon=${result.code}`;
    }
    return BASE_REGISTRATION_URL;
  }

  const isWin = result?.type === "win";

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          key="backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            key="card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md px-8 pt-10 pb-8 overflow-hidden"
          >
            <ConfettiOverlay active={isWin} />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative z-10 flex flex-col items-center text-center gap-5"
            >
              {/* Icon */}
              <motion.div variants={childVariants} className="text-4xl select-none">
                {isWin ? "🎉" : result.type === "no-win" && result.label === "Try Again" ? "🔄" : "🤖"}
              </motion.div>

              {/* Heading */}
              <motion.div variants={childVariants} className="space-y-1">
                <h2 className="text-2xl font-bold text-ink tracking-tight">
                  {isWin ? "You Won!" : result.type === "no-win" ? result.label : ""}
                </h2>
                {isWin && result.type === "win" && (
                  <p className="text-muted text-sm">
                    Here&apos;s your exclusive discount code
                  </p>
                )}
                {!isWin && (
                  <p className="text-muted text-sm max-w-xs">
                    Better luck next time! You can still register for the event.
                  </p>
                )}
                {/* Spin again hint */}
                {spinCount === 1 && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="mt-2 text-sm font-semibold rounded-lg px-3 py-1.5 inline-block"
                    style={{ background: "#DBEAFE", color: "#1E3A8A" }}
                  >
                    🎲 You have 1 spin left — try again!
                  </motion.p>
                )}
              </motion.div>

              {/* Coupon badge (win only) */}
              {isWin && result.type === "win" && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.7 },
                    visible: {
                      opacity: 1,
                      scale: [1.05, 1],
                      transition: { type: "spring", stiffness: 300, damping: 20 },
                    },
                  }}
                  whileHover={{ scale: 1.03, rotateZ: 0.5 }}
                  className="w-full"
                >
                  <div className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-2xl px-6 py-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted font-medium uppercase tracking-wider mb-1">
                        {result.discount}
                      </p>
                      <p className="text-2xl font-bold font-mono tracking-wider text-primary">
                        {result.code}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(result.code)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                          >
                            ✓ Copied
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                          >
                            Copy
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div variants={childVariants} className="w-full pt-1">
                <motion.a
                  href={getRegistrationURL(result)}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{
                    scale: 1.025,
                    boxShadow: "0 8px 30px rgba(30,58,138,0.25)",
                  }}
                  whileTap={{ scale: 0.975 }}
                  className="block w-full py-3.5 rounded-full bg-primary text-white text-sm font-semibold text-center tracking-wide"
                >
                  {isWin ? "Register Now with Discount →" : "Register Anyway →"}
                </motion.a>
              </motion.div>

              {/* Dismiss */}
              <motion.button
                variants={childVariants}
                onClick={onClose}
                className="text-xs text-subtle hover:text-muted transition-colors cursor-pointer"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
