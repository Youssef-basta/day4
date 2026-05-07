import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { CustomerHeaderActions } from "@/components/CustomerHeaderActions";
import {
  getServices,
  getStudioSettings,
} from "@/lib/db/catalog";
import { getCustomerProfile, getCustomerSession } from "@/lib/db/customer";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const [settings, profile, services] = await Promise.all([
    getStudioSettings(),
    getCustomerProfile(session.phone),
    getServices(),
  ]);

  if (!profile) {
    redirect("/login");
  }

  return (
    <>
      <BrandHeader
        brandName={settings.brandName}
        rightSlot={<CustomerHeaderActions session={session} />}
      />
      <main className="mx-auto max-w-md px-4 py-6 pb-24 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-brand-blue">Your account</h1>
          <p className="text-xs text-gray-500 mt-1">
            Hi, {profile.name ?? session.name}.
          </p>
        </div>

        <Link
          href="/account/bookings"
          className="card flex items-center justify-between gap-3 hover:bg-gray-50 transition"
        >
          <div>
            <p className="text-sm font-bold text-brand-blue">
              Booking history
            </p>
            <p className="text-xs text-gray-500">
              See your past visits and re-book in a tap
            </p>
          </div>
          <span className="text-brand-blue text-lg font-bold">›</span>
        </Link>

        <ProfileForm profile={profile} services={services} />

        <Link href="/book" className="btn-accent w-full">
          Book a new appointment
        </Link>
      </main>
    </>
  );
}
