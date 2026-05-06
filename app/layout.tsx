import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BackdropDecoration } from "@/components/BackdropDecoration";
import { getStudioSettings } from "@/lib/db/catalog";
import { getLocale, isRtl } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStudioSettings();
  return {
    title: settings.brandName,
    description:
      settings.heroSubheading ??
      "Book your next cut, trim, or color in seconds.",
    icons: {
      icon: "/logo.jpeg",
      apple: "/logo.jpeg",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E3A8A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocale();
  const dir = isRtl(locale) ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir}>
      <body>
        <BackdropDecoration />
        <div className="relative min-h-screen">{children}</div>
      </body>
    </html>
  );
}
