import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ProveedorCarrito from "@/components/carrito/ProveedorCarrito";
import FondoHerramientas from "@/components/layout/FondoHerramientas";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import NavCategorias from "@/components/layout/NavCategorias";
import { chakra } from "@/components/producto-detalle/fuentes";
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
    <html lang="es-VE" className={`${inter.variable} ${chakra.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <ProveedorCarrito>
          <Header />
          <NavCategorias />
          <FondoHerramientas />
          <main className="relative flex-1">
            {/* Franja azul que baja desde la barra de categorías y se desvanece (ver globals.css). */}
            <div className="fondo-franja pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 md:h-64 lg:h-80" aria-hidden />
            {children}
          </main>
          <Footer />
        </ProveedorCarrito>
      </body>
    </html>
  );
}
