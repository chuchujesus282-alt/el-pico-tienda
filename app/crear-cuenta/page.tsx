import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import FormularioCrearCuenta from "@/components/cuenta/FormularioCrearCuenta";
import { Montanas } from "@/components/layout/Logo";
import Contenedor from "@/components/ui/Contenedor";

// Crear cuenta con los datos fiscales para la factura — responsable: persona A (rama `inicio-sesion`).
// Pantalla completa como /iniciar-sesion (sin header, footer ni barra inferior: ver components/layout/pantallaCompleta.ts):
// fondo blanco y una sola columna centrada (como /iniciar-sesion). Al crear la cuenta se va a /mis-direcciones.

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function PaginaCrearCuenta() {
  return (
    <div className="flex min-h-dvh flex-col bg-pico-blanco">
      <Contenedor className="flex w-full flex-1 flex-col pt-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:pb-16">
        <Link
          href="/iniciar-sesion"
          className="area-tactil inline-flex items-center gap-1 self-start text-[15px] font-semibold text-pico-azul underline-offset-4 hover:underline"
        >
          <ChevronLeft className="size-5" aria-hidden />
          Volver a iniciar sesión
        </Link>

        {/* Entrada en cascada: las montañas caen, luego el título y el formulario parte por parte. */}
        <div className="mx-auto my-auto w-full max-w-xl pt-8">
          <div className="text-center">
            <Montanas className="mx-auto h-14 w-auto fill-pico-rojo motion-safe:animate-caer md:h-16" />
            <h1 className="mt-6 text-4xl font-bold text-pico-azul motion-safe:animate-aparecer [animation-delay:120ms] md:text-5xl">Crea tu cuenta</h1>
            <p className="mt-4 text-base text-gris-texto motion-safe:animate-aparecer [animation-delay:190ms]">
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
