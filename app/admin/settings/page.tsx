import { getStudioSettings } from "@/lib/db/catalog";
import { getLocale } from "@/lib/i18n-server";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStudioSettings();
  const locale = getLocale();
  return <SettingsForm initial={settings} currentLocale={locale} />;
}
