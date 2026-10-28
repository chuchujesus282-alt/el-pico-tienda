import { ReceiptText } from "lucide-react";
import { Aviso } from "@/components/cuenta/Campos";
import FormularioPerfil from "@/components/cuenta/FormularioPerfil";
import TarjetaCuenta from "@/components/cuenta/TarjetaCuenta";
import Contenedor from "@/components/ui/Contenedor";
import TituloPagina from "@/components/ui/TituloPagina";
import type { DatosFiscales } from "@/types/cuenta";

type Props = { nombre: string; correo: string; fiscales: DatosFiscales | null };

/**
 * Diseño de /mi-cuenta (la página solo lee la cuenta y lo monta): saludo por el nombre, y debajo quién eres y atajos
 * (columna azul y blanca) junto a los datos para la factura.
 */
export default function VistaMiCuenta({ nombre, correo, fiscales }: Props) {
  const nombreVisible = fiscales?.nombre ?? nombre;
  const primerNombre = nombreVisible.trim().split(/\s+/)[0] || "de nuevo";
  return (
    <Contenedor className="flex flex-col gap-6 py-6 md:gap-8 md:py-10">
      {/* Sin el banner azul (pedido de persona B): título liviano que saluda por el nombre. */}
      <TituloPagina
        titulo={`Hola, ${primerNombre}`}
        descripcion="Tus datos para la factura, tus favoritos, tu carrito y tus direcciones, en todos tus dispositivos."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start xl:gap-10">
        <TarjetaCuenta nombre={nombreVisible} correo={correo} />

        <section
          aria-labelledby="titulo-factura"
          className="rounded-tarjeta bg-pico-blanco p-5 shadow-tarjeta motion-safe:animate-aparecer motion-safe:[animation-delay:160ms] md:p-8"
        >
          <h2 id="titulo-factura" className="flex items-center gap-3 text-2xl font-bold text-pico-azul">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pico-azul-claro text-pico-azul" aria-hidden>
              <ReceiptText className="size-5" strokeWidth={1.75} />
            </span>
            Datos para tu factura
          </h2>
          <p className="mt-2 mb-6 text-[15px] text-gris-texto">Los usamos para hacer tu factura y para contactarte sobre tus pedidos.</p>
          {!fiscales && (
            <div className="mb-6">
              <Aviso tipo="info">Todavía no tenemos tus datos: complétalos para que tu factura salga a tu nombre.</Aviso>
            </div>
          )}
          <FormularioPerfil inicial={fiscales} />
        </section>
      </div>
    </Contenedor>
  );
}
