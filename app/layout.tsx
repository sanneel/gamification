import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gamif — Premium Mystery Gift Boxes",
  description:
    "Build curated mystery gift boxes with exclusive box prices, surprise rewards, and a lucky spin wheel. The most addictive gifting experience in Georgia.",
  openGraph: {
    title: "Gamif — Premium Mystery Gift Boxes",
    description: "Exclusive box prices. Lucky spin rewards. Unforgettable unboxing.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0D0D0D" />
      </head>
      <body className="bg-[#0D0D0D] text-white antialiased">{children}</body>
    </html>
  );
}
