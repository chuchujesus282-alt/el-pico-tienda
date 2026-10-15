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
      <Contenedor className="pt-5 pb-16 md:pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-pico-azul underline-offset-4 hover:underline"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Volver a la tienda
        </Link>

        <div className="mx-auto mt-8 w-full max-w-md text-center motion-safe:animate-aparecer md:mt-12">
          <Montanas className="mx-auto h-12 w-auto fill-pico-rojo" />
          <h1 className="mt-6 text-3xl font-bold text-pico-azul">Bienvenido</h1>
          <p className="mt-3 text-sm text-gris-texto">
            ¿No tienes cuenta?{" "}
            <Link href="/crear-cuenta" className="font-semibold text-pico-rojo underline underline-offset-4 hover:text-pico-rojo-oscuro">
              Crear cuenta
            </Link>
          </p>

          <div className="mt-8 text-left">
            <FormularioInicioSesion />
          </div>
        </div>
      </Contenedor>
    </div>
  );
}
