"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  SEGMENTS,
  SEG_ANGLE,
  LOCALSTORAGE_KEY,
  pickSegment,
  targetRotationForSegment,
  type SegmentResult,
} from "@/lib/wheel";

const WHEEL_SIZE = 380;

function drawWheel(
  ctx: CanvasRenderingContext2D,
  rotation: number,
  size: number
) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  ctx.clearRect(0, 0, size, size);

  // Outer glow ring (very subtle)
  ctx.save();
  ctx.shadowColor = "rgba(30,58,138,0.12)";
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, 2 * Math.PI);
  ctx.fillStyle = "#F1F5F9";
  ctx.fill();
  ctx.restore();

  // Segments
  for (let i = 0; i < SEGMENTS.length; i++) {
    const startAngle = -Math.PI / 2 + i * SEG_ANGLE + rotation;
    const endAngle = startAngle + SEG_ANGLE;
    const midAngle = startAngle + SEG_ANGLE / 2;

    // Segment fill
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = SEGMENTS[i].color;
    ctx.fill();

    // Divider lines
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Label text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midAngle);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";

    const lines = SEGMENTS[i].label.split("\n");
    const fontSize = 22;
    ctx.font = `400 ${fontSize}px Righteous, system-ui, sans-serif`;

    const lineHeight = fontSize * 1.15;
    const textX = r * 0.56;
    const totalH = (lines.length - 1) * lineHeight;

    lines.forEach((line, li) => {
      ctx.fillText(line, textX, -totalH / 2 + li * lineHeight);
    });
    ctx.restore();
  }

  // Outer ring stroke
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Center hub
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0,0,0,0.08)";
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
  ctx.fillStyle = "#1E3A8A";
  ctx.fill();
}

interface SpinWheelProps {
  spinCount: number;
  onSpinComplete: (result: SegmentResult) => void;
}

export default function SpinWheel({ spinCount, onSpinComplete }: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const pointerControls = useAnimation();
  const spinBtnControls = useAnimation();

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WHEEL_SIZE * dpr;
    canvas.height = WHEEL_SIZE * dpr;
    // Removed explicit CSS width/height to allow responsive scaling
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    drawWheel(ctx, rotationRef.current, WHEEL_SIZE);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Heartbeat on spin button while idle
  useEffect(() => {
    if (spinCount < 2 && !isSpinning) {
      spinBtnControls.start({
        scale: [1, 1.025, 1],
        transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 },
      });
    } else {
      spinBtnControls.stop();
    }
  }, [spinCount, isSpinning, spinBtnControls]);

  // Pointer bounce at rest
  useEffect(() => {
    if (!isSpinning) {
      pointerControls.start({
        y: [0, -4, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      });
    }
  }, [isSpinning, pointerControls]);

  function handleSpin() {
    if (isSpinning || spinCount >= 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsSpinning(true);
    spinBtnControls.stop();
    localStorage.setItem(LOCALSTORAGE_KEY, (spinCount + 1).toString());

    const segIdx = pickSegment();
    const extraRots = 6 + Math.floor(Math.random() * 3);
    const finalTarget = targetRotationForSegment(
      rotationRef.current,
      segIdx,
      extraRots
    );

    // Phase 1: Wind-up (backward 0.15 rad in 220ms)
    const windUpStart = rotationRef.current;
    const windUpEnd = windUpStart - 0.15;
    const windUpDuration = 220;
    let windUpT0: number | null = null;

    function windUpFrame(ts: number) {
      if (windUpT0 === null) windUpT0 = ts;
      const elapsed = ts - windUpT0;
      const t = Math.min(elapsed / windUpDuration, 1);
      // ease-in quadratic
      rotationRef.current = windUpStart + (windUpEnd - windUpStart) * (t * t);
      const dpr = window.devicePixelRatio || 1;
      const ctx2 = canvas!.getContext("2d");
      if (ctx2) {
        ctx2.save();
        ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawWheel(ctx2, rotationRef.current, WHEEL_SIZE);
        ctx2.restore();
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(windUpFrame);
      } else {
        rotationRef.current = windUpEnd;
        startMainSpin(segIdx, finalTarget);
      }
    }

    rafRef.current = requestAnimationFrame(windUpFrame);

    // Pointer wobble during spin
    pointerControls.start({
      rotateZ: [0, -10, 10, -7, 7, -4, 4, 0],
      transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
    });
  }

  function startMainSpin(segIdx: number, finalTarget: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const spinStart = rotationRef.current;
    const spinDuration = 4200;
    let spinT0: number | null = null;

    function spinFrame(ts: number) {
      if (spinT0 === null) spinT0 = ts;
      const elapsed = ts - spinT0;
      const t = Math.min(elapsed / spinDuration, 1);
      // Quartic ease-out
      const eased = 1 - Math.pow(1 - t, 4);
      rotationRef.current = spinStart + (finalTarget - spinStart) * eased;

      const dpr = window.devicePixelRatio || 1;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawWheel(ctx, rotationRef.current, WHEEL_SIZE);
        ctx.restore();
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(spinFrame);
      } else {
        rotationRef.current = finalTarget;
        onSpinDone(segIdx);
      }
    }

    rafRef.current = requestAnimationFrame(spinFrame);
  }

  function onSpinDone(segIdx: number) {
    setIsSpinning(false);
    // Pointer snap-down
    pointerControls.stop();
    pointerControls.start({
      y: [-5, 3, -1, 0],
      rotateZ: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    });
    // Small delay before showing modal
    setTimeout(() => {
      onSpinComplete(SEGMENTS[segIdx].result);
    }, 600);
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      id="spin"
      className="flex flex-col items-center gap-6 lg:gap-10"
    >
      <div className="text-center max-w-sm px-4">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl md:text-4xl lg:text-5xl tracking-widest text-ink"
          style={{ fontFamily: "var(--font-funky)" }}
        >
          Unlock Your Discount
        </motion.h2>
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 lg:mt-3 text-sm sm:text-base py-1.5 px-3 rounded-xl inline-block"
          style={{
            color: "#0F172A",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontWeight: 500,
            letterSpacing: "0.01em",
            background: "rgba(255,255,255,0.72)",
            boxShadow: "0 2px 12px rgba(30,58,138,0.08)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(30,58,138,0.10)",
          }}
        >
          Two spins per person. Win a discount code for registration.
        </motion.p>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center w-full px-4"
      >
        {/* Wheel + pointer wrapper */}
        <div
          className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] aspect-square"
        >
          {/* Pointer arrow — fixed at top-center */}
          <motion.div
            animate={pointerControls}
            className="absolute left-1/2 -top-1 z-10 -translate-x-1/2 origin-bottom"
            style={{ transformOrigin: "50% 100%" }}
          >
            <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
              <path
                d="M11 28L0.607696 4.00001L21.3923 4.00001L11 28Z"
                fill="#0F172A"
              />
              <path
                d="M11 24L2 6H20L11 24Z"
                fill="#0F172A"
              />
            </svg>
          </motion.div>

          {/* Canvas wheel */}
          <canvas
            ref={canvasRef}
            aria-label="Spin wheel with 5 prize segments"
            className="rounded-full w-full h-full"
            style={{
              filter: spinCount >= 2 && !isSpinning ? "grayscale(0.4) opacity(0.7)" : "none",
              transition: "filter 0.5s ease",
            }}
          />
        </div>

        {/* Spin button */}
        <div className="mt-8 lg:mt-10 flex flex-col items-center gap-3">
          {spinCount >= 2 ? (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-muted font-medium bg-secondary/20 px-4 py-2 rounded-full"
            >
              You've used both your spins.
            </motion.p>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <motion.button
                animate={spinBtnControls}
                onClick={handleSpin}
                disabled={isSpinning}
                whileHover={!isSpinning ? { scale: 1.04 } : {}}
                whileTap={!isSpinning ? { scale: 0.96 } : {}}
                className="relative overflow-hidden px-10 py-3.5 lg:px-12 lg:py-4 rounded-full text-sm font-semibold tracking-wide transition-colors cursor-pointer select-none disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSpinning ? "#475569" : "#1E3A8A",
                  color: "#FFFFFF",
                }}
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full"
                    />
                    Spinning…
                  </span>
                ) : (
                  "Spin the Wheel"
                )}
              </motion.button>
              <p className="text-xs text-muted/80">{2 - spinCount} spin{2 - spinCount !== 1 ? 's' : ''} remaining</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
