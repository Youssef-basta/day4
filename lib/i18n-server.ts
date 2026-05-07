// Server-only i18n helpers — they read the locale cookie via next/headers.
// Client components must NOT import from this file; pass `locale` as a prop
// or use `t(locale, key)` from `@/lib/i18n` directly.

import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, isRtl, t, type DictKey, type Locale } from "./i18n";

export function getLocale(): Locale {
  const c = cookies().get(LOCALE_COOKIE)?.value;
  return c === "ar" ? "ar" : "en";
}

export function useServerT() {
  const locale = getLocale();
  return {
    locale,
    rtl: isRtl(locale),
    t: (key: DictKey, vars?: Record<string, string | number>) =>
      t(locale, key, vars),
  };
}
