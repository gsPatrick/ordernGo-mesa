// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RestaurantProvider } from "@/context/RestaurantContext";
import KioskGuard from "@/components/KioskGuard/KioskGuard"; // <--- IMPORTAR

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
  viewportFit: "cover", // Importante para iPhones com notch/ilha
};

export const metadata = {
  title: "OrdenGo Mesa",
  description: "Cardápio Digital Interativo",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Faz a barra de status se misturar ao app
    title: "OrdenGo",
  },
  formatDetection: {
    telephone: false, // Evita que números virem links de ligar
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RestaurantProvider>
          <KioskGuard /> {/* <--- ADICIONAR AQUI: Protege e mantém tela ligada */}
          {children}
        </RestaurantProvider>
      </body>
    </html>
  );
}