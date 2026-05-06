import { getCurrentAdmin } from "@/lib/db/admin";
import { getStudioSettings } from "@/lib/db/catalog";
import { AdminChrome } from "./AdminChrome";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, session] = await Promise.all([
    getStudioSettings(),
    getCurrentAdmin(),
  ]);
  return (
    <AdminChrome
      brandName={settings.brandName}
      userEmail={session?.email ?? null}
      userRole={session?.role ?? null}
    >
      {children}
    </AdminChrome>
  );
}
