import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BackdropDecoration } from "@/components/BackdropDecoration";

export const metadata: Metadata = {
  title: "Joe Barber Studio",
  description: "Book your next cut, trim, or color in seconds.",
};

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
  return (
    <html lang="en">
      <body>
        <BackdropDecoration />
        <div className="relative min-h-screen">{children}</div>
      </body>
    </html>
  );
}
