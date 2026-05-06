import { getStudioSettings } from "@/lib/db/catalog";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const settings = await getStudioSettings();
  return <LoginForm brandName={settings.brandName} />;
}
