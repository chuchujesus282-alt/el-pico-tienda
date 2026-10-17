import type { Metadata } from "next";
import ProveedorCarrito from "@/components/carrito/ProveedorCarrito";
import BarraInferior from "@/components/layout/BarraInferior";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import NavCategorias from "@/components/layout/NavCategorias";
import OcultarEnRutas from "@/components/layout/OcultarEnRutas";
import { RUTAS_PANTALLA_COMPLETA } from "@/components/layout/pantallaCompleta";
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
      <body className="flex min-h-dvh flex-col">
        <ProveedorCarrito>
          <OcultarEnRutas prefijos={RUTAS_PANTALLA_COMPLETA}>
            <Header />
          </OcultarEnRutas>
          <NavCategorias />
          <main className="flex-1">{children}</main>
          {/* Páginas de pantalla completa (iniciar sesión): sin header, footer ni barra inferior. */}
          <OcultarEnRutas prefijos={RUTAS_PANTALLA_COMPLETA}>
            <Footer />
            <BarraInferior />
          </OcultarEnRutas>
        </ProveedorCarrito>
      </body>
    </html>
  );
}
