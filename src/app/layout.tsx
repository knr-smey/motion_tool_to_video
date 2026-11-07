import type { Metadata } from "next";
import { Moul, Battambang, Kantumruy_Pro } from "next/font/google";
import "./globals.css";

const moul = Moul({
  variable: "--font-moul",
  weight: "400",
  subsets: ["khmer"],
});

const battambang = Battambang({
  variable: "--font-battambang",
  weight: ["400", "700"],
  subsets: ["khmer"],
});

const kantumruyPro = Kantumruy_Pro({
  variable: "--font-kantumruy-pro",
  weight: ["400", "500", "700"],
  subsets: ["khmer"],
});

export const metadata: Metadata = {
  title: "KineticCast Khmer",
  description: "Script-to-kinetic-typography video engine for the Khmer language.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="km"
      className={`${moul.variable} ${battambang.variable} ${kantumruyPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">{children}</body>
    </html>
  );
}
