import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "OG Beta Testers | Google Play Closed Testing Platform",
  description:
    "Launch your Android app faster with real testers for Google Play closed testing. Meet the 14-day requirement, track progress, and publish confidently.",
  keywords: [
    "Google Play closed testing",
    "Android app testers",
    "12 testers for Play Console",
    "14 day Play Store testing"
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): JSX.Element {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
