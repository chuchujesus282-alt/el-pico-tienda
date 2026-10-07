import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FormularioPedido from "@/components/finalizar-pedido/FormularioPedido";
import Contenedor from "@/components/ui/Contenedor";
import TituloSeccion from "@/components/ui/TituloSeccion";
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
    <Contenedor className="py-6 md:py-8">
      <Link
        href={id ? `/producto/${encodeURIComponent(id)}` : "/"}
        className="mb-4 inline-flex items-center gap-1 text-[13px] text-gris-texto hover:text-pico-azul hover:underline"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        {id ? "Volver al producto" : "Seguir comprando"}
      </Link>
      <TituloSeccion titulo="Finalizar pedido" nivel="h1" />
      <FormularioPedido itemsDirectos={itemsDirectos} direcciones={direcciones} />
    </Contenedor>
  );
}
