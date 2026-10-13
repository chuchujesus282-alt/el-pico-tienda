import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import FormularioCrearCuenta from "@/components/cuenta/FormularioCrearCuenta";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";

// Crear cuenta con los datos fiscales para la factura — responsable: persona A (rama `inicio-sesion`).

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function PaginaCrearCuenta() {
  return (
    <>
      <EncabezadoPagina
        titulo="Crea tu cuenta"
        descripcion="Con estos datos te facturamos y armamos tus pedidos más rápido."
        ruta={[{ texto: "Iniciar sesión", href: "/iniciar-sesion" }, { texto: "Crear cuenta" }]}
        icono={UserPlus}
      />
    <Contenedor className="py-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/iniciar-sesion"
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-gris-texto hover:text-pico-azul hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Volver a iniciar sesión
        </Link>
        <FormularioCrearCuenta />
      </div>
    </Contenedor>
    </>
  );
}
