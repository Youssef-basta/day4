import type { CSSProperties } from "react";
import {
  ScissorsIcon,
  CombIcon,
  RazorIcon,
  ColorDropIcon,
  ChairIcon,
  StarIcon,
} from "./icons";

type Piece = {
  Icon: typeof ScissorsIcon;
  position: string;
  size: string;
  color: string;
  drift: "drift-a" | "drift-b" | "drift-c" | "drift-d";
  delay: string;
  rotate: string;
};

const PIECES: Piece[] = [
  // Left gutter
  {
    Icon: ScissorsIcon,
    position: "top-[7%] left-[6%]",
    size: "h-32 w-32",
    color: "text-brand-blue/15",
    drift: "drift-a",
    delay: "0s",
    rotate: "12deg",
  },
  {
    Icon: CombIcon,
    position: "top-[33%] left-[3%]",
    size: "h-24 w-24",
    color: "text-brand-yellow/55",
    drift: "drift-b",
    delay: "1.5s",
    rotate: "-10deg",
  },
  {
    Icon: RazorIcon,
    position: "top-[58%] left-[8%]",
    size: "h-28 w-28",
    color: "text-brand-blue/15",
    drift: "drift-c",
    delay: "0.8s",
    rotate: "22deg",
  },
  {
    Icon: ColorDropIcon,
    position: "bottom-[10%] left-[5%]",
    size: "h-20 w-20",
    color: "text-brand-yellow/55",
    drift: "drift-d",
    delay: "2.2s",
    rotate: "-12deg",
  },
  {
    Icon: StarIcon,
    position: "top-[20%] left-[16%]",
    size: "h-6 w-6",
    color: "text-brand-yellow/70",
    drift: "drift-a",
    delay: "3s",
    rotate: "0deg",
  },

  // Right gutter
  {
    Icon: ScissorsIcon,
    position: "top-[10%] right-[7%]",
    size: "h-28 w-28",
    color: "text-brand-blue/15",
    drift: "drift-b",
    delay: "0.5s",
    rotate: "-30deg",
  },
  {
    Icon: CombIcon,
    position: "top-[40%] right-[9%]",
    size: "h-24 w-24",
    color: "text-brand-yellow/55",
    drift: "drift-c",
    delay: "1.8s",
    rotate: "18deg",
  },
  {
    Icon: RazorIcon,
    position: "top-[66%] right-[3%]",
    size: "h-32 w-32",
    color: "text-brand-blue/15",
    drift: "drift-a",
    delay: "1.1s",
    rotate: "-15deg",
  },
  {
    Icon: ChairIcon,
    position: "bottom-[12%] right-[8%]",
    size: "h-24 w-24",
    color: "text-brand-yellow/55",
    drift: "drift-d",
    delay: "0.3s",
    rotate: "0deg",
  },
  {
    Icon: StarIcon,
    position: "top-[55%] right-[18%]",
    size: "h-5 w-5",
    color: "text-brand-yellow/70",
    drift: "drift-c",
    delay: "2.5s",
    rotate: "0deg",
  },
];

export function BackdropDecoration() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden hidden md:block"
    >
      {/* Soft brand-tinted gradient replacing the flat gray */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50" />

      {/* Faint diagonal scissors texture */}
      <div className="absolute inset-0 scissors-pattern opacity-30" />

      {/* Animated barber-tool decorations */}
      {PIECES.map((p, i) => {
        const Icon = p.Icon;
        const style: CSSProperties = {
          animationDelay: p.delay,
          // CSS variable consumed by drift keyframes for per-piece rotation.
          ["--r" as never]: p.rotate,
        };
        return (
          <Icon
            key={i}
            className={`absolute ${p.position} ${p.size} ${p.color} ${p.drift}`}
            style={style}
          />
        );
      })}
    </div>
  );
}
