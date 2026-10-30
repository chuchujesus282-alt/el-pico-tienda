import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import VolverAPedir from "@/components/cuenta/VolverAPedir";
import { FORMAS_RETIRO, METODOS_PAGO } from "@/components/finalizar-pedido/pedido";
import Contenedor from "@/components/ui/Contenedor";
import Precio from "@/components/ui/Precio";
import TituloPagina from "@/components/ui/TituloPagina";
import { haySesion, miPedido } from "@/lib/cuenta";
import { enlaceMapa } from "@/lib/direcciones";
import { descripcionProducto, formatearBs, formatearFecha, tituloProducto } from "@/lib/formato";
import { productosDeHoy } from "@/lib/pedidos/servidor";

// Detalle de un pedido de la cuenta — responsable: persona A (fase 5). Solo el dueño lo ve (si no, 404).
// Precios y tasa de ESE día; "Volver a pedir" agrega los productos con los precios de hoy.

export const metadata: Metadata = { title: "Detalle del pedido", robots: { index: false } };

const tasaVE = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const etiquetaPago = (valor: string) => METODOS_PAGO.find((m) => m.valor === valor)?.etiqueta ?? valor;

export default async function PaginaPedido({ params }: PageProps<"/mi-cuenta/pedidos/[id]">) {
  const { id } = await params;
  const pedido = await miPedido(id);
  if (!pedido) {
    if (!(await haySesion())) redirect("/iniciar-sesion");
    notFound();
  }

  const { productos: deHoy } = await productosDeHoy(pedido.items.map((i) => i.productoId));
  const porId = new Map(deHoy.map((p) => [p.id, p]));
  const lineas = pedido.items.flatMap((i) => {
    const producto = porId.get(i.productoId);
    return producto ? [{ producto, cantidad: i.cantidad }] : [];
  });

  const retiro = FORMAS_RETIRO.find((f) => f.valor === pedido.retiro)?.etiqueta ?? pedido.retiro;
  const pago =
    pedido.pago === "combinado" ? `Pago combinado (${pedido.pagosCombinados.map(etiquetaPago).join(" + ")})` : etiquetaPago(pedido.pago);

  return (
    <Contenedor className="flex flex-col gap-6 py-6 md:py-10">
      <TituloPagina
        titulo="Detalle del pedido"
        descripcion={<span className="first-letter:uppercase">{formatearFecha(pedido.fecha)}</span>}
        volver={{ href: "/mi-cuenta/pedidos", texto: "Mis pedidos" }}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section aria-labelledby="titulo-productos" className="rounded-tarjeta bg-pico-blanco p-5 shadow-tarjeta md:p-6">
          <h2 id="titulo-productos" className="mb-4 text-xl font-bold text-pico-azul">
            {pedido.items.length} {pedido.items.length === 1 ? "producto" : "productos"}
          </h2>
          <ul className="divide-y divide-gris-borde">
            {pedido.items.map((i) => {
              const hoy = porId.get(i.productoId);
              // La que se guardó al pedir (el color o la referencia que eligió); en pedidos de antes, la de hoy.
              const descripcion = descripcionProducto({ descripcion: i.descripcion ?? hoy?.descripcion });
              return (
                <li key={i.productoId} className="flex items-start justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block font-medium text-texto">{hoy ? tituloProducto(hoy) : i.nombre}</span>
                    {descripcion && <span className="block text-[13px] text-gris-texto">{descripcion}</span>}
                    <span className="block text-[13px] text-gris-texto">
                      Cód. {i.productoId} · {i.cantidad} × <Precio valor={i.precioUsd} tamano="pequeno" className="inline" />
                      {!hoy && " · ya no está en la tienda"}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <Precio valor={i.precioUsd * i.cantidad} className="block text-base tabular-nums" />
                    {i.precioBs !== null && (
                      <span className="block text-xs text-gris-texto tabular-nums">{formatearBs(i.precioBs * i.cantidad)}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="flex flex-col gap-4">
          <section aria-label="Resumen" className="rounded-tarjeta bg-pico-blanco p-5 shadow-tarjeta md:p-6">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gris-texto">Retiro</dt>
                <dd className="text-right font-semibold text-pico-azul">{retiro}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gris-texto">Pago</dt>
                <dd className="text-right font-semibold text-pico-azul">{pago}</dd>
              </div>
              {pedido.tasa !== null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-gris-texto">Tasa BCV de ese día</dt>
                  <dd className="text-right font-semibold text-pico-azul tabular-nums">{tasaVE.format(pedido.tasa)} Bs/$</dd>
                </div>
              )}
            </dl>
            {pedido.direccion && (
              <a
                href={enlaceMapa(pedido.direccion)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-start gap-2 rounded-tarjeta bg-pico-azul-claro px-3 py-2.5 text-sm text-pico-azul hover:underline"
              >
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <span className="font-semibold">{pedido.direccion.nombre}</span> · {pedido.direccion.descripcion}
                </span>
              </a>
            )}
            <div className="mt-4 flex items-end justify-between border-t border-gris-borde pt-4">
              <span className="text-sm font-semibold text-pico-azul">Total de ese día</span>
              <span className="text-right">
                <Precio valor={pedido.totalUsd} tamano="grande" className="block text-3xl tabular-nums" />
                {pedido.totalBs !== null && <span className="block text-sm text-gris-texto tabular-nums">{formatearBs(pedido.totalBs)}</span>}
              </span>
            </div>
          </section>

          <section aria-label="Volver a pedir" className="rounded-tarjeta bg-pico-blanco p-5 shadow-tarjeta md:p-6">
            <VolverAPedir lineas={lineas} faltan={pedido.items.length - lineas.length} />
          </section>
        </aside>
      </div>
    </Contenedor>
  );
}
