import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "./design-system.css";
import "./public-site.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: { default: "Leyer — Claridad por diseño", template: "%s · Leyer" },
  description:
    "Una base común para la presencia digital y la gestión de tu estudio jurídico.",
};

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  display: "swap",
  subsets: ["latin"],
  fallback: ["Arial", "sans-serif"],
  // Next has no automatic fallback metrics for Google Sans yet.
  adjustFontFallback: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${googleSans.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
