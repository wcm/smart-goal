import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
  metadataBase: new URL(appUrl),
  applicationName: "Goal Planner",
  title: {
    default: "AI Goal Planner — Break Any Goal Into Achievable Steps",
    template: "%s · Goal Planner",
  },
  description:
    "Turn any goal into a realistic, time-estimated plan. Break big steps into achievable actions, track progress, and build momentum.",
  openGraph: {
    type: "website",
    siteName: "Goal Planner",
    title: "AI Goal Planner — Break Any Goal Into Achievable Steps",
    description:
      "Turn any goal into a realistic, time-estimated plan and break it down until the next action feels easy.",
    url: appUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Goal Planner — Break Any Goal Into Achievable Steps",
    description:
      "Turn any goal into a realistic, time-estimated plan and break it down until the next action feels easy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Goal Planner",
    alternateName: "Goal Planner AI",
    url: appUrl,
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
