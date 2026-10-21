import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});
const editorial = Instrument_Serif({
  variable: "--font-editorial",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${editorial.variable} font-sans antialiased`}
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
