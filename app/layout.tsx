import type { Metadata } from "next";
import ProveedorCarrito from "@/components/carrito/ProveedorCarrito";
import BarraInferior from "@/components/layout/BarraInferior";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import NavCategorias from "@/components/layout/NavCategorias";
import { chakra } from "@/components/producto-detalle/fuentes";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Centro Ferretero El Pico",
    template: "%s | El Pico",
  },
  description: "Tienda en línea de Centro Ferretero El Pico, Caracas. Herramientas, plomería, electricidad, pinturas y más.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-VE" className={chakra.variable}>
      {/* Abajo deja libre el alto de la barra inferior del teléfono (0 desde 768px). */}
      <body className="flex min-h-dvh flex-col pb-(--alto-barra-inferior)">
        <ProveedorCarrito>
          <Header />
          <NavCategorias />
          <main className="flex-1">{children}</main>
          <Footer />
          <BarraInferior />
        </ProveedorCarrito>
      </body>
    </html>
  );
}
