import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import SplashScreen from "./components/SplashScreen";
import MobileBlock  from "./components/MobileBlock";

export const metadata: Metadata = {
  title: "Panel de Administración",
  description: "Sistema de administración",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <SplashScreen />
        <MobileBlock />
        {children}
      </body>
    </html>
  );
}
