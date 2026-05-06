import { getStudioSettings } from "@/lib/db/catalog";
import { AdminChrome } from "./AdminChrome";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStudioSettings();
  return <AdminChrome brandName={settings.brandName}>{children}</AdminChrome>;
}
