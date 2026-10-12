import type { Metadata } from "next";
import FormularioInicioSesion from "@/components/cuenta/FormularioInicioSesion";
import Boton from "@/components/ui/Boton";
import Contenedor from "@/components/ui/Contenedor";
import TituloSeccion from "@/components/ui/TituloSeccion";

// Inicio de sesión — responsable: persona A (rama `inicio-sesion`).

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

export default function PaginaIniciarSesion() {
  return (
    <Contenedor className="py-8 md:py-12">
      <div className="mx-auto w-full max-w-md rounded-tarjeta border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta md:p-8">
        <TituloSeccion titulo="Inicia sesión" nivel="h1" className="mb-1" />
        <p className="mb-6 text-sm text-gris-texto">Entra a tu cuenta para comprar más rápido.</p>

        <FormularioInicioSesion />

        <div className="mt-6 flex flex-col gap-3 border-t border-gris-borde pt-6 text-center">
          <p className="text-sm text-gris-texto">¿No tienes cuenta?</p>
          <Boton href="/crear-cuenta" variante="secundario" anchoCompleto className="h-11">
            Crear cuenta
          </Boton>
        </div>
      </div>
    </Contenedor>
  );
}
