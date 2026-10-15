import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import FormularioInicioSesion from "@/components/cuenta/FormularioInicioSesion";
import { Montanas } from "@/components/layout/Logo";
import Contenedor from "@/components/ui/Contenedor";

// Inicio de sesión — responsable: persona A (rama `inicio-sesion`).
// A propósito sencilla: fondo blanco y una sola columna centrada (logo, saludo, formulario, Google).

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

export default function PaginaIniciarSesion() {
  return (
    <div className="bg-pico-blanco">
      {/* Fondo blanco detrás de toda la página: sin la franja gris entre el formulario y el pie. */}
      <div className="fixed inset-0 -z-10 bg-pico-blanco" aria-hidden />
      <Contenedor className="pt-5 pb-8 md:pb-12">
        <Link
          href="/"
          className="area-tactil inline-flex items-center gap-1 text-[15px] font-semibold text-pico-azul underline-offset-4 hover:underline"
        >
          <ChevronLeft className="size-5" aria-hidden />
          Volver a la tienda
        </Link>

        <div className="mx-auto mt-10 w-full max-w-lg text-center motion-safe:animate-aparecer md:mt-14">
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
