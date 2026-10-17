import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import FormularioCrearCuenta from "@/components/cuenta/FormularioCrearCuenta";
import { Montanas } from "@/components/layout/Logo";
import Contenedor from "@/components/ui/Contenedor";

// Crear cuenta con los datos fiscales para la factura — responsable: persona A (rama `inicio-sesion`).
// Pantalla completa como /iniciar-sesion (sin header, footer ni barra inferior: ver components/layout/pantallaCompleta.ts):
// fondo blanco, las montañas del logo y el título centrados, y el formulario debajo.

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function PaginaCrearCuenta() {
  return (
    <div className="flex min-h-dvh flex-col bg-pico-blanco">
      <Contenedor className="w-full pt-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:pb-16">
        <Link
          href="/iniciar-sesion"
          className="area-tactil inline-flex items-center gap-1 text-[15px] font-semibold text-pico-azul underline-offset-4 hover:underline"
        >
          <ChevronLeft className="size-5" aria-hidden />
          Volver a iniciar sesión
        </Link>

        <div className="mx-auto mt-8 w-full max-w-3xl motion-safe:animate-aparecer md:mt-10">
          <div className="text-center">
            <Montanas className="mx-auto h-14 w-auto fill-pico-rojo md:h-16" />
            <h1 className="mt-6 text-4xl font-bold text-pico-azul md:text-5xl">Crea tu cuenta</h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gris-texto">
              Con estos datos te facturamos y armamos tus pedidos más rápido.
            </p>
            <p className="mt-3 text-base text-gris-texto">
              ¿Ya tienes cuenta?{" "}
              <Link href="/iniciar-sesion" className="font-semibold text-pico-rojo underline underline-offset-4 hover:text-pico-rojo-oscuro">
                Inicia sesión
              </Link>
            </p>
          </div>

          <div className="mt-8 md:mt-10">
            <FormularioCrearCuenta />
          </div>
        </div>
      </Contenedor>
    </div>
  );
}
