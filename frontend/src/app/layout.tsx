import type { Metadata } from "next";
import { Epilogue, DM_Sans } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PriusGo — Toyota Prius rental in Šiauliai",
  description: "Affordable Toyota Prius rental in Šiauliai, Lithuania. Book a fuel-efficient hybrid car for city trips and daily use.",
  metadataBase: new URL("https://prius-go.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PriusGo — Toyota Prius rental in Šiauliai",
    description: "Affordable Toyota Prius rental in Šiauliai, Lithuania. Book a fuel-efficient hybrid car for city trips and daily use.",
    url: "https://prius-go.vercel.app",
    siteName: "PriusGo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PriusGo — Toyota Prius rental in Šiauliai",
    description: "Affordable Toyota Prius rental in Šiauliai, Lithuania. Book a fuel-efficient hybrid car for city trips and daily use.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${epilogue.variable} ${dmSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
