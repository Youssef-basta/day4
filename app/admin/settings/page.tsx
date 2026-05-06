import { getStudioSettings } from "@/lib/db/catalog";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStudioSettings();
  return <SettingsForm initial={settings} />;
}
