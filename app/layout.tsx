import type { Metadata } from "next";
import ProveedorCarrito from "@/components/carrito/ProveedorCarrito";
import SincronizarCuenta from "@/components/cuenta/SincronizarCuenta";
import BarraInferior from "@/components/layout/BarraInferior";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderSoloInicioMovil from "@/components/layout/HeaderSoloInicioMovil";
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
  description: "Tienda en línea de Centro Ferretero El Pico, Caracas. Herramientas, grifería, electricidad, pinturas y más.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-VE" className={chakra.variable}>
      <body className="flex min-h-dvh flex-col">
        <ProveedorCarrito>
          {/* Con la sesión abierta, el carrito y los favoritos se guardan también en la cuenta. */}
          <SincronizarCuenta />
          <OcultarEnRutas prefijos={RUTAS_PANTALLA_COMPLETA}>
            <HeaderSoloInicioMovil>
              <Header />
            </HeaderSoloInicioMovil>
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
