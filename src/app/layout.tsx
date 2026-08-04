import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "GoalFlow — Turn goals into doable steps",
    template: "%s · GoalFlow",
  },
  description:
    "Build a realistic, adaptive plan for any goal, then break it down until the next action feels easy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
