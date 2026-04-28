export type WinCode = "DGAI50" | "DGAI100";

export type SegmentResult =
  | { type: "win"; code: WinCode; discount: string }
  | { type: "no-win"; label: string };

export interface WheelSegment {
  label: string;
  color: string;
  result: SegmentResult;
  weight: number;
}

export const SEGMENTS: WheelSegment[] = [
  {
    label: "₹50 Off",
    color: "#3730A3",
    result: { type: "win", code: "DGAI50", discount: "₹50 Off" },
    weight: 2,
  },
  {
    label: "₹100 Off",
    color: "#1E3A8A",
    result: { type: "win", code: "DGAI100", discount: "₹100 Off" },
    weight: 1,
  },
  {
    label: "Try Again",
    color: "#475569",
    result: { type: "no-win", label: "Try Again" },
    weight: 3,
  },
  {
    label: "Almost\nThere",
    color: "#2563EB",
    result: { type: "no-win", label: "Almost There!" },
    weight: 2,
  },
  {
    label: "AI Said\nNo…",
    color: "#64748B",
    result: { type: "no-win", label: "AI Said No… This Time" },
    weight: 2,
  },
];

export const BASE_REGISTRATION_URL =
  "https://www.commudle.com/fill-form/4598";
export const LOCALSTORAGE_KEY = "dgai_spin_used";
export const SEGMENT_COUNT = SEGMENTS.length;
export const SEG_ANGLE = (2 * Math.PI) / SEGMENT_COUNT;

export function pickSegment(): number {
  const totalWeight = SEGMENTS.reduce((acc, s) => acc + s.weight, 0);
  let rand = Math.random() * totalWeight;
  for (let i = 0; i < SEGMENTS.length; i++) {
    rand -= SEGMENTS[i].weight;
    if (rand <= 0) return i;
  }
  return SEGMENTS.length - 1;
}

// Returns the target rotation such that segment `segmentIndex` lands under
// the pointer at 12 o'clock. Segments are drawn starting at -π/2 clockwise.
//
// Math: with wheel rotation R applied, segment i's center appears at canvas
// angle (-π/2 + (i+0.5)*SEG_ANGLE + R). The pointer reads at -π/2.
// Solving: R = -(i+0.5)*SEG_ANGLE + k*2π for integer k.
// We pick k so that target > currentRotation + extraRotations*2π.
export function targetRotationForSegment(
  currentRotation: number,
  segmentIndex: number,
  extraRotations: number = 6
): number {
  const baseR = -(segmentIndex + 0.5) * SEG_ANGLE;
  const minTarget = currentRotation + extraRotations * 2 * Math.PI;
  const k = Math.ceil((minTarget - baseR) / (2 * Math.PI));
  return baseR + k * 2 * Math.PI;
}
