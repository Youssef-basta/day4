import { redirect } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { getStudioSettings } from "@/lib/db/catalog";
import { getCustomerSession } from "@/lib/db/customer";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function CustomerLoginPage() {
  const session = await getCustomerSession();
  if (session) redirect("/account");
  const settings = await getStudioSettings();
  return (
    <>
      <BrandHeader brandName={settings.brandName} />
      <main className="mx-auto max-w-md px-4 py-8">
        <LoginForm />
      </main>
    </>
  );
}
