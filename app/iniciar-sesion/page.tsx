import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import FormularioInicioSesion from "@/components/cuenta/FormularioInicioSesion";
import { Montanas } from "@/components/layout/Logo";
import Contenedor from "@/components/ui/Contenedor";

// Inicio de sesión — responsable: persona A (rama `inicio-sesion`).
// Pantalla completa (sin header, footer ni barra inferior: ver components/layout/pantallaCompleta.ts):
// fondo blanco y una sola columna centrada (logo, saludo, formulario, botones sociales).

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

export default function PaginaIniciarSesion() {
  return (
    <div className="flex min-h-dvh flex-col bg-pico-blanco">
      <Contenedor className="flex w-full flex-1 flex-col pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))] md:pb-12">
        <Link
          href="/"
          className="area-tactil inline-flex items-center gap-1 self-start text-[15px] font-semibold text-pico-azul underline-offset-4 hover:underline"
        >
          <ChevronLeft className="size-5" aria-hidden />
          Volver a la tienda
        </Link>

        {/* my-auto: el formulario queda centrado en la pantalla, con aire arriba en pantallas bajas. */}
        <div className="mx-auto my-auto w-full max-w-lg pt-8 text-center motion-safe:animate-aparecer">
          <Montanas className="mx-auto h-16 w-auto fill-pico-rojo md:h-20" />
          <h1 className="mt-7 text-4xl font-bold text-pico-azul md:text-5xl">Bienvenido</h1>
          <p className="mt-4 text-base text-gris-texto">
            ¿No tienes cuenta?{" "}
            <Link href="/crear-cuenta" className="font-semibold text-pico-rojo underline underline-offset-4 hover:text-pico-rojo-oscuro">
              Crear cuenta
            </Link>
          </p>

          <div className="mt-10 text-left">
            <FormularioInicioSesion />
          </div>
        </div>
      </Contenedor>
    </div>
  );
}
