import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ListaPedidos from "@/components/cuenta/ListaPedidos";
import Contenedor from "@/components/ui/Contenedor";
import TituloPagina from "@/components/ui/TituloPagina";
import { misPedidos } from "@/lib/cuenta";

// Mis pedidos — responsable: persona A (fase 5). Solo con la sesión abierta. De 20 en 20 (?pagina=2).

export const metadata: Metadata = { title: "Mis pedidos", robots: { index: false } };

const POR_PAGINA = 20;

export default async function PaginaMisPedidos({ searchParams }: PageProps<"/mi-cuenta/pedidos">) {
  const valor = (await searchParams).pagina;
  const pagina = Math.max(1, Number.parseInt((Array.isArray(valor) ? valor[0] : valor) ?? "1", 10) || 1);
  const resultado = await misPedidos(pagina, POR_PAGINA);
  if (!resultado) redirect("/iniciar-sesion");
  const { pedidos, total } = resultado;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const enlace = "inline-flex h-10 items-center gap-1 rounded-boton px-3 text-sm font-semibold text-pico-azul hover:bg-pico-azul-claro";

  return (
    <Contenedor className="flex flex-col gap-6 py-6 md:py-10">
      <TituloPagina
        titulo="Mis pedidos"
        descripcion="Los pedidos que enviaste por WhatsApp, con los precios y la tasa BCV de ese día."
        contador={total}
        volver={{ href: "/mi-cuenta", texto: "Mi cuenta" }}
      />
      {pedidos.length > 0 ? (
        <ListaPedidos pedidos={pedidos} />
      ) : (
        <p className="rounded-tarjeta bg-pico-blanco px-5 py-8 text-center text-sm text-gris-texto shadow-tarjeta">
          {pagina > 1 ? "No hay más pedidos." : "Todavía no has enviado pedidos. Cuando envíes uno por WhatsApp, aparecerá aquí."}
        </p>
      )}
      {paginas > 1 && (
        <nav aria-label="Páginas de pedidos" className="flex items-center justify-center gap-3">
          {pagina > 1 && (
            <Link href={`/mi-cuenta/pedidos?pagina=${pagina - 1}`} className={enlace}>
              <ChevronLeft className="size-4" aria-hidden /> Anteriores
            </Link>
          )}
          <span className="text-sm text-gris-texto">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas && (
            <Link href={`/mi-cuenta/pedidos?pagina=${pagina + 1}`} className={enlace}>
              Más viejos <ChevronRight className="size-4" aria-hidden />
            </Link>
          )}
        </nav>
      )}
    </Contenedor>
  );
}
