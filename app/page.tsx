import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { BarberPole } from "@/components/BarberPole";
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
import {
  getAddons,
  getDrinks,
  getServices,
  getStudioSettings,
  getTestimonials,
} from "@/lib/db/catalog";
import type { Drink, Service, Testimonial } from "@/lib/types";

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

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, addons, drinks, settings, testimonials] = await Promise.all([
    getServices(),
    getAddons(),
    getDrinks(),
    getStudioSettings(),
    getTestimonials(),
  ]);

  const hotDrinks = drinks.filter((d) => d.temperature === "hot");
  const coldDrinks = drinks.filter((d) => d.temperature === "cold");

  const features: { title?: string; hint?: string }[] = [
    { title: settings.feature1Title, hint: settings.feature1Hint },
    { title: settings.feature2Title, hint: settings.feature2Hint },
    { title: settings.feature3Title, hint: settings.feature3Hint },
  ].filter((f) => f.title && f.hint);

  return (
    <>
      <BrandHeader brandName={settings.brandName} />

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
            {settings.heroKicker && (
              <p className="text-[11px] tracking-[0.25em] uppercase text-brand-yellow font-semibold">
                {settings.heroKicker}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-extrabold leading-tight">
              {settings.heroHeadline1 ?? "Sharp cuts."}
              <br />
              <span className="text-brand-yellow">
                {settings.heroHeadline2 ?? "No waiting."}
              </span>
            </h1>
            {settings.heroSubheading && (
              <p className="mt-3 text-sm text-blue-100 max-w-[260px]">
                {settings.heroSubheading}
              </p>
            )}
            <Link
              href="/book"
              className="btn-accent mt-6 w-full shadow-lg shadow-black/10"
            >
              <ScissorsIcon className="h-5 w-5" />
              Book Now
            </Link>
          </div>
        </section>

        {/* WHY US */}
        {features.length > 0 && (
          <section className="px-4 mt-6">
            <ul className="grid grid-cols-3 gap-2">
              {features.map((f, i) => (
                <Feature
                  key={i}
                  icon={
                    i === 0 ? (
                      <ClockIcon className="h-5 w-5" />
                    ) : i === 1 ? (
                      <StarIcon className="h-5 w-5 text-brand-yellow" />
                    ) : (
                      <MapPinIcon className="h-5 w-5" />
                    )
                  }
                  title={f.title!}
                  hint={f.hint!}
                />
              ))}
            </ul>
          </section>
        )}

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
        {addons.length > 0 && (
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
        )}

        {/* REFRESHMENTS */}
        {drinks.length > 0 && (
          <section className="px-4 mt-10">
            <SectionHeading kicker="On the house" title="Refreshments" />
            <p className="text-xs text-gray-500 mt-1 mb-3">
              Order hot or cold drinks while you're in the chair.
            </p>

            {hotDrinks.length > 0 && (
              <div className="mb-4">
                <p className="chip bg-orange-100 text-orange-700 mb-2 text-[10px] uppercase tracking-wider">
                  Hot
                </p>
                <ul className="space-y-2">
                  {hotDrinks.map((d) => (
                    <DrinkRow key={d.id} drink={d} />
                  ))}
                </ul>
              </div>
            )}
            {coldDrinks.length > 0 && (
              <div>
                <p className="chip bg-sky-100 text-sky-700 mb-2 text-[10px] uppercase tracking-wider">
                  Cold
                </p>
                <ul className="space-y-2">
                  {coldDrinks.map((d) => (
                    <DrinkRow key={d.id} drink={d} />
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* TESTIMONIALS */}
        {testimonials.length > 0 && (
          <section className="px-4 mt-10 space-y-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </section>
        )}

        {/* FOOTER INFO */}
        <section className="px-4 mt-10">
          <div className="card space-y-3 text-sm">
            <h3 className="font-bold text-brand-blue uppercase tracking-wider text-xs">
              Visit us
            </h3>
            {settings.addressLine1 && (
              <InfoRow
                icon={<MapPinIcon className="h-5 w-5" />}
                primary={settings.addressLine1}
                secondary={settings.addressLine2 ?? ""}
              />
            )}
            {settings.hoursLine1 && (
              <InfoRow
                icon={<ClockIcon className="h-5 w-5" />}
                primary={settings.hoursLine1}
                secondary={settings.hoursLine2 ?? ""}
              />
            )}
            {settings.phone && (
              <InfoRow
                icon={<PhoneIcon className="h-5 w-5" />}
                primary={settings.phone}
                secondary={settings.phoneHint ?? ""}
              />
            )}
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
  service: Service;
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

function DrinkRow({ drink }: { drink: Drink }) {
  return (
    <li className="card !py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{drink.name}</p>
        {drink.description && (
          <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
            {drink.description}
          </p>
        )}
      </div>
      <p className="text-xs font-bold text-brand-blue whitespace-nowrap">
        {drink.priceKwd === 0 ? "Free" : `${drink.priceKwd} KWD`}
      </p>
    </li>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="card relative overflow-hidden">
      <span className="absolute -top-3 -left-2 text-7xl text-brand-yellow/40 font-serif leading-none">
        "
      </span>
      <div className="flex gap-0.5 text-brand-yellow mb-2">
        {Array.from({ length: testimonial.rating }, (_, i) => (
          <StarIcon key={i} className="h-4 w-4" />
        ))}
      </div>
      <p className="text-sm text-gray-700 italic">{testimonial.quote}</p>
      <p className="text-xs text-gray-500 mt-3 font-semibold">
        — {testimonial.author}
      </p>
    </div>
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
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
        {hint}
      </p>
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
        {secondary && <p className="text-xs text-gray-500">{secondary}</p>}
      </div>
    </div>
  );
}
