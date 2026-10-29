import Link from "next/link";
import { ChevronRight, Package, ReceiptText } from "lucide-react";
import ListaPedidos from "@/components/cuenta/ListaPedidos";
import type { ResumenPedido } from "@/lib/pedidos/servidor";
import { Aviso } from "@/components/cuenta/Campos";
import FormularioPerfil from "@/components/cuenta/FormularioPerfil";
import TarjetaCuenta from "@/components/cuenta/TarjetaCuenta";
import Contenedor from "@/components/ui/Contenedor";
import TituloPagina from "@/components/ui/TituloPagina";
import type { DatosFiscales } from "@/types/cuenta";

type Props = {
  nombre: string;
  correo: string;
  fiscales: DatosFiscales | null;
  /** Últimos pedidos y cuántos hay en total (persona A, fase 5). */
  pedidos?: { recientes: ResumenPedido[]; total: number };
};

/**
 * Diseño de /mi-cuenta (la página solo lee la cuenta y lo monta): saludo por el nombre, y debajo quién eres y atajos
 * (columna azul y blanca) junto a los datos para la factura.
 */
export default function VistaMiCuenta({ nombre, correo, fiscales, pedidos }: Props) {
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

      {pedidos && (
        // Mis pedidos (persona A, fase 5): mismo estilo de sección que "Datos para tu factura".
        <section
          id="mis-pedidos"
          aria-labelledby="titulo-pedidos"
          className="scroll-mt-6 rounded-tarjeta bg-pico-blanco p-5 shadow-tarjeta motion-safe:animate-aparecer motion-safe:[animation-delay:240ms] md:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="titulo-pedidos" className="flex items-center gap-3 text-2xl font-bold text-pico-azul">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pico-azul-claro text-pico-azul" aria-hidden>
                <Package className="size-5" strokeWidth={1.75} />
              </span>
              Mis pedidos
            </h2>
            {pedidos.total > pedidos.recientes.length && (
              <Link href="/mi-cuenta/pedidos" className="group inline-flex items-center gap-1 text-sm font-semibold text-pico-azul hover:text-pico-rojo">
                Ver todos ({pedidos.total})
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            )}
          </div>
          <p className="mt-2 mb-5 text-[15px] text-gris-texto">
            Los pedidos que enviaste por WhatsApp, con los precios y la tasa BCV de ese día.
          </p>
          {pedidos.recientes.length > 0 ? (
            <ListaPedidos pedidos={pedidos.recientes} />
          ) : (
            <p className="rounded-tarjeta bg-gris-fondo px-4 py-5 text-sm text-gris-texto">
              Todavía no has enviado pedidos. Cuando envíes uno por WhatsApp, aparecerá aquí.
            </p>
          )}
        </section>
      )}
    </Contenedor>
  );
}
