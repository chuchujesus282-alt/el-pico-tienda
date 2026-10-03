import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ProveedorCarrito from "@/components/carrito/ProveedorCarrito";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import NavCategorias from "@/components/layout/NavCategorias";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Centro Ferretero El Pico",
    template: "%s | El Pico",
  },
  description: "Tienda en línea de Centro Ferretero El Pico, Caracas. Herramientas, plomería, electricidad, pinturas y más.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-VE" className={inter.variable}>
      <body className="flex min-h-dvh flex-col">
        <ProveedorCarrito>
          <Header />
          <NavCategorias />
          <main className="flex-1">{children}</main>
          <Footer />
        </ProveedorCarrito>
      </body>
    </html>
  );
}
