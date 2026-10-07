import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FormularioPedido from "@/components/finalizar-pedido/FormularioPedido";
import { fuentePaginas } from "@/components/producto-detalle/fuentes";
import Contenedor from "@/components/ui/Contenedor";
import { getProducto } from "@/lib/catalogo";
import { getDireccionesCliente } from "@/lib/cliente";
import type { ItemCarrito } from "@/types/carrito";

// Finalizar pedido — responsable: persona B (rama `finalizar-pedido`).
// /finalizar-pedido                         → pedido con lo que hay en el carrito.
// /finalizar-pedido?producto=ID&cantidad=N  → "Comprar ahora": solo ese producto (no toca el carrito).

export const metadata: Metadata = { title: "Finalizar pedido", robots: { index: false } };

function primero(valor: string | string[] | undefined): string | undefined {
  return (Array.isArray(valor) ? valor[0] : valor)?.trim() || undefined;
}

export default async function PaginaFinalizarPedido({ searchParams }: PageProps<"/finalizar-pedido">) {
  const parametros = await searchParams;
  const id = primero(parametros.producto);

  let itemsDirectos: ItemCarrito[] | null = null;
  if (id) {
    const producto = await getProducto(id);
    if (!producto) notFound();
    const cantidad = Number.parseInt(primero(parametros.cantidad) ?? "", 10);
    itemsDirectos = [{ producto, cantidad: Number.isFinite(cantidad) ? Math.min(999, Math.max(1, cantidad)) : 1 }];
  }

  const direcciones = await getDireccionesCliente();

  return (
    <div className={fuentePaginas}>
      <Contenedor className="py-6 md:py-8">
        <Link
          href={id ? `/producto/${encodeURIComponent(id)}` : "/"}
          className="group mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-gris-texto hover:text-logo-marino"
        >
          <ArrowLeft className="size-3.5 transition-transform motion-safe:group-hover:-translate-x-1" aria-hidden />
          {id ? "Volver al producto" : "Seguir comprando"}
        </Link>
        <div className="mb-5 motion-safe:animate-aparecer">
          <h1 className="font-titulo text-3xl leading-tight font-bold text-logo-marino md:text-4xl">Finalizar pedido</h1>
          <p className="mt-1 text-sm text-gris-texto">
            Elige cómo lo recibes y cómo pagas. Te llevamos a WhatsApp con todo listo.
          </p>
        </div>
        <FormularioPedido itemsDirectos={itemsDirectos} direcciones={direcciones} />
      </Contenedor>
    </div>
  );
}
