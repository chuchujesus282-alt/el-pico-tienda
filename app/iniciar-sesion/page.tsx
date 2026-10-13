import type { Metadata } from "next";
import { User } from "lucide-react";
import FormularioInicioSesion from "@/components/cuenta/FormularioInicioSesion";
import Boton from "@/components/ui/Boton";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";

// Inicio de sesión — responsable: persona A (rama `inicio-sesion`).

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

export default function PaginaIniciarSesion() {
  return (
    <>
      <EncabezadoPagina titulo="Inicia sesión" descripcion="Entra a tu cuenta para comprar más rápido." ruta={[{ texto: "Iniciar sesión" }]} icono={User} />
    <Contenedor className="py-8 md:py-12">
      <div className="mx-auto w-full max-w-md rounded-tarjeta border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta md:p-8">

        <FormularioInicioSesion />

        <div className="mt-6 flex flex-col gap-3 border-t border-gris-borde pt-6 text-center">
          <p className="text-sm text-gris-texto">¿No tienes cuenta?</p>
          <Boton href="/crear-cuenta" variante="secundario" anchoCompleto className="h-11">
            Crear cuenta
          </Boton>
        </div>
      </div>
    </Contenedor>
    </>
  );
}
