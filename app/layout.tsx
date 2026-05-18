import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Gamif — A cinematic mystery gifting house",
  description:
    "Curated mystery boxes built piece by piece. Exclusive box prices, a lucky spin, and an unboxing moment built to be remembered.",
  openGraph: {
    title: "Gamif — A cinematic mystery gifting house",
    description:
      "Curated mystery boxes built piece by piece. Exclusive box prices, a lucky spin, and an unboxing moment built to be remembered.",
    type: "website",
    locale: "en_GE",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F2EFE9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="surface-bone antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
