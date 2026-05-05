import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

const baseProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function ScissorsIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

export function RazorIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 13h11a4 4 0 0 0 4-4V5H10a4 4 0 0 0-4 4v4Z" />
      <path d="M14 13l6 7" />
      <path d="M3 13v3" />
    </svg>
  );
}

export function CombIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="2" y="6" width="20" height="5" rx="1" />
      <line x1="6" y1="11" x2="6" y2="18" />
      <line x1="10" y1="11" x2="10" y2="20" />
      <line x1="14" y1="11" x2="14" y2="20" />
      <line x1="18" y1="11" x2="18" y2="18" />
    </svg>
  );
}

export function ColorDropIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3c0 0 6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg
      {...baseProps}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={1}
      {...props}
    >
      <polygon points="12 2 14.9 8.6 22 9.3 16.7 14.1 18.2 21 12 17.4 5.8 21 7.3 14.1 2 9.3 9.1 8.6 12 2" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 4h3l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function ChairIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 9V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2" />
      <path d="M4 9h16v4a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9Z" />
      <path d="M7 16v4M17 16v4" />
    </svg>
  );
}

export function MirrorIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="6" y="3" width="12" height="14" rx="6" />
      <path d="M12 17v4" />
      <path d="M9 21h6" />
      <path d="M9 7c1-1 4-1 5 1" />
    </svg>
  );
}

export function BottleIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M10 2h4v3l1 2v12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V7l1-2V2Z" />
      <path d="M9 11h6" />
    </svg>
  );
}

export function CrownIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 18h18" />
      <path d="M3 18l2-10 4 5 3-8 3 8 4-5 2 10" />
      <circle cx="12" cy="6" r=".8" fill="currentColor" />
    </svg>
  );
}

export function TowelIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="11" width="18" height="9" rx="2" />
      <path d="M3 14h18" />
      <path d="M8 5c.5 1-.5 2 0 3" />
      <path d="M12 4c.5 1-.5 2 0 3" />
      <path d="M16 5c.5 1-.5 2 0 3" />
    </svg>
  );
}

export function BeardIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7 5c-1 4 0 7 5 7s6-3 5-7" />
      <path d="M7 12c0 4 2 8 5 8s5-4 5-8" />
      <circle cx="10" cy="9" r=".8" fill="currentColor" />
      <circle cx="14" cy="9" r=".8" fill="currentColor" />
    </svg>
  );
}

export function LineupIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 12h3l2-5 3 9 3-9 2 5h3" />
      <path d="M3 18h18" />
    </svg>
  );
}

export function KidsIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="7" r="3" />
      <path d="M5 21c0-4 3-6 7-6s7 2 7 6" />
      <path d="M9 5c1-2 5-2 6 0" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M5 5c1-1 4-2 7-2s6 1 7 2" />
    </svg>
  );
}

export function HandIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M9 11V4a1.5 1.5 0 0 1 3 0v6" />
      <path d="M12 10V3a1.5 1.5 0 0 1 3 0v8" />
      <path d="M15 11V5a1.5 1.5 0 0 1 3 0v9" />
      <path d="M9 11V8a1.5 1.5 0 0 0-3 0v6c0 4 3 7 7 7h0a7 7 0 0 0 7-7v-3" />
    </svg>
  );
}

export function MaskIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 6c2-2 12-2 14 0v6a7 7 0 0 1-14 0V6Z" />
      <circle cx="9" cy="11" r=".8" fill="currentColor" />
      <circle cx="15" cy="11" r=".8" fill="currentColor" />
      <path d="M9 16c1 1 5 1 6 0" />
    </svg>
  );
}

export function BubblesIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="8" cy="14" r="4" />
      <circle cx="16" cy="10" r="3" />
      <circle cx="14" cy="17" r="2" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...baseProps} fill="currentColor" stroke="none" {...props}>
      <path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2z" />
      <path d="M19 14l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7L19 14z" />
      <path d="M5 15l.5 1.4 1.4.5-1.4.5L5 19l-.5-1.5-1.4-.6 1.4-.5L5 15z" />
    </svg>
  );
}
