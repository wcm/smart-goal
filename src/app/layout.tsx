import type { Metadata } from "next";
import { Geist, Instrument_Sans } from "next/font/google";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "SMART Goal",
  title: {
    default: "SMART Goal — Turn Any Goal Into a Clear, Achievable Plan",
    template: "%s · SMART Goal",
  },
  description:
    "Use AI and the SMART framework to make any goal specific, measurable, achievable, relevant, and time-bound—then turn it into a practical plan.",
  openGraph: {
    type: "website",
    siteName: "SMART Goal",
    title: "SMART Goal — Turn Any Goal Into a Clear, Achievable Plan",
    description:
      "Make your goal SMART, add your real-world context, and get a practical step-by-step plan.",
    url: appUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "SMART Goal — Turn Any Goal Into a Clear, Achievable Plan",
    description:
      "Make your goal SMART, add your real-world context, and get a practical step-by-step plan.",
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
    name: "SMART Goal",
    alternateName: "SMART Goal Planner",
    url: appUrl,
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${instrumentSans.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-941H9XZXST"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-941H9XZXST');
            `,
          }}
        />
      </head>
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
