import type { Metadata } from "next";
import { Moul, Battambang, Kantumruy_Pro, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

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
  title: "Smey-Motion",
  description: "Script-to-kinetic-typography video engine for the Khmer language.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="km"
      className={`${poppins.variable} ${moul.variable} ${battambang.variable} ${kantumruyPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
