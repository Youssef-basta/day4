"use client";

import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { BarberPole } from "@/components/BarberPole";
import { StudioCard } from "@/components/StudioCard";
import {
  ScissorsIcon,
  RazorIcon,
  ColorDropIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  CrownIcon,
  TowelIcon,
  BeardIcon,
  LineupIcon,
  KidsIcon,
  SparkleIcon,
  EyeIcon,
  HandIcon,
  MaskIcon,
  BubblesIcon,
  BottleIcon,
} from "@/components/icons";
import { useStore } from "@/lib/store";

const SERVICE_ICONS: Record<string, typeof ScissorsIcon> = {
  haircut: ScissorsIcon,
  beard: RazorIcon,
  kids: KidsIcon,
  color: ColorDropIcon,
  shave: TowelIcon,
  sculpt: BeardIcon,
  lineup: LineupIcon,
  royal: CrownIcon,
};

const ADDON_ICONS: Record<string, typeof ScissorsIcon> = {
  eyebrows: EyeIcon,
  scalp: HandIcon,
  hotoil: BottleIcon,
  mask: MaskIcon,
  wash: BubblesIcon,
};

export default function HomePage() {
  const { services, addons } = useStore();

  return (
    <>
      <BrandHeader />

      <main className="mx-auto max-w-md pb-24">
        {/* HERO */}
        <section className="relative overflow-hidden bg-brand-blue text-white px-4 pt-8 pb-12 rounded-b-3xl">
          <div className="absolute inset-0 scissors-pattern opacity-60" aria-hidden />
          <ScissorsIcon
            className="absolute -right-4 -top-2 h-44 w-44 text-white/10 rotate-12"
            aria-hidden
          />
          <div className="absolute right-3 top-3 bottom-3 w-2">
            <BarberPole />
          </div>

          <div className="relative">
            <p className="text-[11px] tracking-[0.25em] uppercase text-brand-yellow font-semibold">
              Kuwait City · Est. 2019
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight">
              Sharp cuts.
              <br />
              <span className="text-brand-yellow">No waiting.</span>
            </h1>
            <p className="mt-3 text-sm text-blue-100 max-w-[260px]">
              Book a barber in under a minute. Walk in, sit down, walk out fresh.
            </p>
            <Link href="/book" className="btn-accent mt-6 w-full shadow-lg shadow-black/10">
              <ScissorsIcon className="h-5 w-5" />
              Book Now
            </Link>
          </div>
        </section>

        {/* WHY US */}
        <section className="px-4 mt-6">
          <ul className="grid grid-cols-3 gap-2">
            <Feature icon={<ClockIcon className="h-5 w-5" />} title="60-sec" hint="booking" />
            <Feature
              icon={<StarIcon className="h-5 w-5 text-brand-yellow" />}
              title="4.9★"
              hint="rated"
            />
            <Feature
              icon={<MapPinIcon className="h-5 w-5" />}
              title="Salmiya"
              hint="walk-ins ok"
            />
          </ul>
        </section>

        {/* SERVICES */}
        <section className="px-4 mt-8">
          <SectionHeading kicker="Menu" title="Our services" />
          <ul className="space-y-3 mt-3">
            {services.map((s) => {
              const Icon = SERVICE_ICONS[s.id] ?? ScissorsIcon;
              const tier = s.tier ?? "standard";
              return <ServiceCard key={s.id} service={s} Icon={Icon} tier={tier} />;
            })}
          </ul>
        </section>

        {/* ADD-ONS */}
        <section className="px-4 mt-10">
          <SectionHeading kicker="Make it yours" title="Add-ons" />
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Layer any of these onto your booking.
          </p>
          <ul className="grid grid-cols-2 gap-3">
            {addons.map((a) => {
              const Icon = ADDON_ICONS[a.id] ?? SparkleIcon;
              return (
                <li
                  key={a.id}
                  className="card !p-3 flex flex-col items-start gap-2"
                >
                  <span className="h-9 w-9 rounded-lg bg-brand-blue/5 text-brand-blue flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-tight">
                      {a.name}
                    </p>
                    {a.description && (
                      <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                        {a.description}
                      </p>
                    )}
                  </div>
                  <p className="text-xs font-bold text-brand-blue mt-auto">
                    +{a.priceKwd} KWD · {a.durationMin}m
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* STUDIO GALLERY */}
        <section className="px-4 mt-10">
          <SectionHeading kicker="The Studio" title="Step inside" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <StudioCard variant="chair" />
            <StudioCard variant="mirror" />
            <div className="col-span-2">
              <StudioCard variant="products" />
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section className="px-4 mt-10">
          <div className="card relative overflow-hidden">
            <span className="absolute -top-3 -left-2 text-7xl text-brand-yellow/40 font-serif leading-none">
              “
            </span>
            <div className="flex gap-0.5 text-brand-yellow mb-2">
              <StarIcon className="h-4 w-4" />
              <StarIcon className="h-4 w-4" />
              <StarIcon className="h-4 w-4" />
              <StarIcon className="h-4 w-4" />
              <StarIcon className="h-4 w-4" />
            </div>
            <p className="text-sm text-gray-700 italic">
              Cleanest fade in Kuwait. In and out in 30 minutes — and the booking
              app is instant.
            </p>
            <p className="text-xs text-gray-500 mt-3 font-semibold">
              — Faisal A., regular since 2022
            </p>
          </div>
        </section>

        {/* FOOTER INFO */}
        <section className="px-4 mt-10">
          <div className="card space-y-3 text-sm">
            <h3 className="font-bold text-brand-blue uppercase tracking-wider text-xs">
              Visit us
            </h3>
            <InfoRow
              icon={<MapPinIcon className="h-5 w-5" />}
              primary="Salmiya, Block 10"
              secondary="Salem Al Mubarak St."
            />
            <InfoRow
              icon={<ClockIcon className="h-5 w-5" />}
              primary="Sat – Thu · 10:00 AM – 9:30 PM"
              secondary="Friday · 2:00 PM – 9:30 PM"
            />
            <InfoRow
              icon={<PhoneIcon className="h-5 w-5" />}
              primary="+965 5000 0000"
              secondary="WhatsApp & calls"
            />
          </div>
          <Link href="/book" className="btn-primary w-full mt-5">
            <ScissorsIcon className="h-5 w-5" />
            Book your seat
          </Link>
        </section>
      </main>
    </>
  );
}

function ServiceCard({
  service,
  Icon,
  tier,
}: {
  service: { id: string; name: string; description?: string; durationMin: number; priceKwd: number };
  Icon: typeof ScissorsIcon;
  tier: "standard" | "premium" | "signature";
}) {
  if (tier === "signature") {
    return (
      <li className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue via-blue-900 to-brand-blue text-white p-4 ring-2 ring-brand-yellow shadow-lg shadow-brand-blue/30">
        <CrownIcon className="absolute -right-4 -top-4 h-28 w-28 text-brand-yellow/15" />
        <div className="relative flex items-start gap-3">
          <span className="h-12 w-12 shrink-0 rounded-xl bg-brand-yellow text-brand-blue flex items-center justify-center">
            <Icon className="h-6 w-6" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold">{service.name}</p>
              <span className="chip bg-brand-yellow text-brand-blue gap-1 px-2 py-0.5">
                <CrownIcon className="h-3 w-3" />
                Signature
              </span>
            </div>
            {service.description && (
              <p className="text-xs text-blue-100 mt-0.5">{service.description}</p>
            )}
            <p className="text-[11px] text-blue-200 mt-1">
              {service.durationMin} min · best value
            </p>
          </div>
          <p className="font-extrabold text-brand-yellow whitespace-nowrap">
            {service.priceKwd} KWD
          </p>
        </div>
      </li>
    );
  }

  if (tier === "premium") {
    return (
      <li className="card flex items-start gap-3 ring-1 ring-brand-yellow/60 bg-gradient-to-br from-white to-amber-50">
        <span className="h-12 w-12 shrink-0 rounded-xl bg-brand-blue text-brand-yellow flex items-center justify-center">
          <Icon className="h-6 w-6" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{service.name}</p>
            <span className="chip bg-brand-yellow text-brand-blue gap-1 px-2 py-0.5">
              <SparkleIcon className="h-3 w-3" />
              Premium
            </span>
          </div>
          {service.description && (
            <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
          )}
          <p className="text-[11px] text-gray-400 mt-1">
            {service.durationMin} min
          </p>
        </div>
        <p className="font-bold text-brand-blue whitespace-nowrap">
          {service.priceKwd} KWD
        </p>
      </li>
    );
  }

  return (
    <li className="card flex items-start gap-3">
      <span className="h-12 w-12 shrink-0 rounded-xl bg-brand-blue/5 text-brand-blue flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{service.name}</p>
        {service.description && (
          <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
        )}
        <p className="text-[11px] text-gray-400 mt-1">
          {service.durationMin} min
        </p>
      </div>
      <p className="font-bold text-brand-blue whitespace-nowrap">
        {service.priceKwd} KWD
      </p>
    </li>
  );
}

function SectionHeading({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className="text-[11px] tracking-[0.25em] uppercase text-brand-yellow font-bold">
          {kicker}
        </p>
        <h2 className="text-lg font-bold text-brand-blue">{title}</h2>
      </div>
      <span className="h-px flex-1 bg-gray-200 mb-2 ml-3" />
    </div>
  );
}

function Feature({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <li className="card !p-3 text-center">
      <span className="mx-auto h-9 w-9 rounded-full bg-brand-blue/5 text-brand-blue flex items-center justify-center">
        {icon}
      </span>
      <p className="mt-1.5 text-sm font-bold text-brand-blue leading-tight">
        {title}
      </p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{hint}</p>
    </li>
  );
}

function InfoRow({
  icon,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="h-9 w-9 shrink-0 rounded-lg bg-brand-blue/5 text-brand-blue flex items-center justify-center">
        {icon}
      </span>
      <div className="leading-tight">
        <p className="font-semibold">{primary}</p>
        <p className="text-xs text-gray-500">{secondary}</p>
      </div>
    </div>
  );
}
