import { ChairIcon, MirrorIcon, BottleIcon } from "./icons";

type Variant = "chair" | "mirror" | "products";

const VARIANTS: Record<
  Variant,
  { gradient: string; icon: typeof ChairIcon; label: string }
> = {
  chair: {
    gradient: "linear-gradient(135deg,#1E3A8A 0%,#3B5BB5 100%)",
    icon: ChairIcon,
    label: "The chair",
  },
  mirror: {
    gradient: "linear-gradient(135deg,#FACC15 0%,#F59E0B 100%)",
    icon: MirrorIcon,
    label: "Old-school mirror",
  },
  products: {
    gradient: "linear-gradient(135deg,#1E3A8A 0%,#FACC15 140%)",
    icon: BottleIcon,
    label: "Premium products",
  },
};

export function StudioCard({ variant }: { variant: Variant }) {
  const v = VARIANTS[variant];
  const Icon = v.icon;
  const dark = variant === "mirror";
  return (
    <figure className="studio-tile" style={{ background: v.gradient }}>
      <Icon
        className={`relative h-16 w-16 ${
          dark ? "text-brand-blue" : "text-brand-yellow"
        }`}
      />
      <figcaption
        className={`absolute bottom-2 left-3 text-[11px] font-semibold uppercase tracking-wider ${
          dark ? "text-brand-blue" : "text-white"
        }`}
      >
        {v.label}
      </figcaption>
    </figure>
  );
}
