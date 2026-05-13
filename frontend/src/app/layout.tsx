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
  title: "PriusGo | Toyota Prius rental in Šiauliai, Lithuania",
  description: "PriusGo is a Toyota Prius rental service in Šiauliai, Lithuania. Book a fuel-efficient hybrid car for daily use, business trips, and local travel.",
  metadataBase: new URL("https://prius-go.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PriusGo | Toyota Prius rental in Šiauliai, Lithuania",
    description: "PriusGo is a Toyota Prius rental service in Šiauliai, Lithuania. Book a fuel-efficient hybrid car for daily use, business trips, and local travel.",
    url: "https://prius-go.vercel.app",
    siteName: "PriusGo",
    type: "website",
    images: [
      {
        url: "/images/prius-hero.jpg",
        width: 1200,
        height: 630,
        alt: "PriusGo Toyota Prius rental in Šiauliai, Lithuania",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PriusGo | Toyota Prius rental in Šiauliai, Lithuania",
    description: "PriusGo is a Toyota Prius rental service in Šiauliai, Lithuania. Book a fuel-efficient hybrid car for daily use, business trips, and local travel.",
    images: ["/images/prius-hero.jpg"],
  },
  keywords: [
    "Toyota Prius rental", "Šiauliai car rental", "nuoma Šiauliai", "car hire Šiauliai",
    "hybrid car rental Lithuania", "affordable car rental Lithuania", "PriusGo",
    "Prius nuoma", "automobilio nuoma Šiauliai", "cheap car hire Lithuania",
  ],
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "PriusGo",
  description: "Toyota Prius hybrid car rental in Šiauliai, Lithuania. Daily and weekly rates, manual approval, local pickup.",
  url: "https://prius-go.vercel.app",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Šiauliai",
    addressCountry: "LT",
  },
  areaServed: { "@type": "City", name: "Šiauliai" },
  priceRange: "€20–€100",
  openingHours: "Mo-Su 00:00-24:00",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Lithuanian"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${epilogue.variable} ${dmSans.variable} antialiased`}>
        {children}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </body>
    </html>
  );
}
