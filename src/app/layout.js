// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RestaurantProvider } from "@/context/RestaurantContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configuração PWA e Viewport (Bloqueia Zoom e define cor)
export const viewport = {
  themeColor: "#df0024",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Impede zoom pinça
  userScalable: false, // Impede zoom
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased select-none`}>
        {/* 'select-none' impede que o usuário fique selecionando texto na tela touch */}
        <RestaurantProvider>
          {children}
        </RestaurantProvider>
      </body>
    </html>
  );
}