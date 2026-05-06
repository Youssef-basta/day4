// Phase 1 i18n: a tiny EN / AR dictionary + locale cookie + RTL helper.
// Coverage is intentionally limited to the most visible customer-side
// strings (home hero, header, key CTAs). Phase 2 expands coverage to the
// rest of the app.

import { cookies } from "next/headers";

export type Locale = "en" | "ar";

export const LOCALE_COOKIE = "kbs_locale";

export function getLocale(): Locale {
  const c = cookies().get(LOCALE_COOKIE)?.value;
  return c === "ar" ? "ar" : "en";
}

export function isRtl(locale: Locale): boolean {
  return locale === "ar";
}

const dict = {
  // Customer landing page
  "hero.bookNow": { en: "Book Now", ar: "احجز الآن" },
  "hero.bookYourSeat": { en: "Book your seat", ar: "احجز مقعدك" },
  "hero.fallbackHeadline1": { en: "Sharp look,", ar: "إطلالة أنيقة،" },
  "hero.fallbackHeadline2": { en: "easy booking.", ar: "حجز سهل." },
  "section.menu": { en: "Menu", ar: "القائمة" },
  "section.services": { en: "Our services", ar: "خدماتنا" },
  "section.makeItYours": { en: "Make it yours", ar: "خصصها" },
  "section.addons": { en: "Add-ons", ar: "إضافات" },
  "section.addonsHint": {
    en: "Layer any of these onto your booking.",
    ar: "أضف أيًا منها إلى حجزك.",
  },
  "section.refreshments": { en: "Refreshments", ar: "المشروبات" },
  "section.onTheHouse": { en: "On the house", ar: "على حساب المحل" },
  "section.refreshmentsHint": {
    en: "Order hot or cold drinks while you're in the chair.",
    ar: "اطلب مشروبات ساخنة أو باردة أثناء الجلسة.",
  },
  "drinks.hot": { en: "Hot", ar: "ساخن" },
  "drinks.cold": { en: "Cold", ar: "بارد" },
  "drinks.free": { en: "Free", ar: "مجاني" },
  "footer.visitUs": { en: "Visit us", ar: "زورونا" },
  // Header / chrome
  "header.bookings": { en: "Bookings", ar: "الحجوزات" },
  "header.admin": { en: "Admin", ar: "الإدارة" },
  // Settings page
  "settings.language": { en: "Language", ar: "اللغة" },
  "settings.languageHint": {
    en: "Customer-facing text honors this preference. Phase 1 covers the home page and header.",
    ar: "النصوص المعروضة للعملاء تتبع هذا الإعداد. تغطي المرحلة الأولى الصفحة الرئيسية والترويسة.",
  },
} as const;

type Key = keyof typeof dict;

export function t(locale: Locale, key: Key): string {
  return dict[key][locale] ?? dict[key].en;
}

// Server-side convenience for components that just need a t() bound to
// the current cookie locale.
export function useServerT() {
  const locale = getLocale();
  return {
    locale,
    rtl: isRtl(locale),
    t: (key: Key) => t(locale, key),
  };
}
