// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RestaurantProvider } from "@/context/RestaurantContext";
import KioskGuard from "@/components/KioskGuard/KioskGuard";
import OrientationGuard from "@/components/OrientationGuard/OrientationGuard";
import Screensaver from "@/components/Screensaver/Screensaver"; // <--- NOVO

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#df0024",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata = {
  title: "OrdenGo Mesa",
  description: "Cardápio Digital Interativo",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OrdenGo",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RestaurantProvider>
          <KioskGuard />
          <OrientationGuard />
          <Screensaver /> {/* <--- Adicionado aqui */}
          {children}
        </RestaurantProvider>
      </body>
    </html>
  );
}