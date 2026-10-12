import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FormularioCrearCuenta from "@/components/cuenta/FormularioCrearCuenta";
import Contenedor from "@/components/ui/Contenedor";
import TituloSeccion from "@/components/ui/TituloSeccion";

// Crear cuenta con los datos fiscales para la factura — responsable: persona A (rama `inicio-sesion`).

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function PaginaCrearCuenta() {
  return (
    <Contenedor className="py-6 md:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/iniciar-sesion"
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-gris-texto hover:text-pico-azul hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Volver a iniciar sesión
        </Link>
        <TituloSeccion titulo="Crea tu cuenta" nivel="h1" className="mb-1" />
        <p className="mb-6 text-sm text-gris-texto">Con estos datos te facturamos y armamos tus pedidos más rápido.</p>
        <FormularioCrearCuenta />
      </div>
    </Contenedor>
  );
}
