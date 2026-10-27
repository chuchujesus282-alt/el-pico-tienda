import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Aviso } from "@/components/cuenta/Campos";
import FormularioPerfil from "@/components/cuenta/FormularioPerfil";
import TarjetaCuenta from "@/components/cuenta/TarjetaCuenta";
import Contenedor from "@/components/ui/Contenedor";
import { leerPerfil } from "@/lib/cuenta";

// Mi cuenta — responsable: persona A. Solo con la sesión abierta (si no, a iniciar sesión).
// A la izquierda quién eres, atajos a lo tuyo y cerrar sesión; a la derecha, los datos para la factura
// (quien entró con Google los llena aquí la primera vez).

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

export default async function PaginaMiCuenta() {
  const cuenta = await leerPerfil();
  if (!cuenta) redirect("/iniciar-sesion");

  return (
    <>
      {/* Sin EncabezadoPagina (pedido de persona B): el título queda solo para lectores de pantalla. */}
      <h1 className="sr-only">Mi cuenta</h1>
      <Contenedor className="py-6 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start xl:gap-10">
          <TarjetaCuenta nombre={cuenta.fiscales?.nombre ?? cuenta.nombre} correo={cuenta.correo} />

          <section aria-labelledby="titulo-factura" className="rounded-tarjeta bg-pico-blanco p-5 shadow-tarjeta md:p-8">
            <h2 id="titulo-factura" className="text-2xl font-bold text-pico-azul">
              Datos para tu factura
            </h2>
            <p className="mt-2 mb-6 text-[15px] text-gris-texto">
              Los usamos para hacer tu factura y para contactarte sobre tus pedidos.
            </p>
            {!cuenta.fiscales && (
              <div className="mb-6">
                <Aviso tipo="info">Todavía no tenemos tus datos: complétalos para que tu factura salga a tu nombre.</Aviso>
              </div>
            )}
            <FormularioPerfil inicial={cuenta.fiscales} />
          </section>
        </div>
      </Contenedor>
    </>
  );
}
