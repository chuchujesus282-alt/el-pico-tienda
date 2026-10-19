import type { Metadata } from "next";
import type { ProductosPorCodigo } from "@/components/calculadoras/proyecto";
import ExploradorCalculadoras from "@/components/propuestas/b/ExploradorCalculadoras";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import { codigosDeProductos } from "@/lib/calculadoras/materiales";
import { CALCULADORAS, obtenerCalculadora } from "@/lib/calculadoras/registro";
import { getProducto } from "@/lib/catalogo";

// Propuesta B para /calculadoras: "La calculadora como protagonista". Encabezado mínimo, selector de trabajo arriba y
// la calculadora real funcionando debajo, sin cambiar de página. Página de prueba: no se indexa.

export const metadata: Metadata = {
  title: "Calcula tu proyecto (propuesta B)",
  description: "Elige tu trabajo, pon las medidas y ve cuánto material llevar.",
  robots: { index: false },
};

const PASOS = ["Elige tu trabajo", "Pon tus medidas", "Pide por WhatsApp"];

export default async function PropuestaB({ searchParams }: PageProps<"/propuestas/b">) {
  const { calc } = await searchParams;
  const pedido = typeof calc === "string" ? calc : "";
  const inicial = obtenerCalculadora(pedido)?.slug ?? CALCULADORAS[0].slug;

  // Productos de TODAS las calculadoras (sin repetir): así cambiar de trabajo no espera al servidor.
  // Si uno falla o ya no existe, ese material sale como "Consultar disponibilidad".
  const codigos = codigosDeProductos(CALCULADORAS.flatMap((c) => [...c.materiales, ...c.herramientas]));
  const encontrados = await Promise.all(codigos.map((codigo) => getProducto(codigo).catch(() => null)));
  const productos: ProductosPorCodigo = {};
  for (const producto of encontrados) if (producto) productos[producto.id] = producto;

  return (
    <>
      <EncabezadoPagina titulo="Calcula tu proyecto" ruta={[{ texto: "Calculadoras" }]} compacto>
        <ol aria-label="Cómo funciona" className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] font-semibold text-pico-blanco/90">
          {PASOS.map((paso, i) => (
            <li key={paso} className="flex items-center gap-1.5">
              <span className="flex size-5 items-center justify-center rounded-chip bg-pico-rojo text-[11px] font-bold text-pico-blanco" aria-hidden>
                {i + 1}
              </span>
              {paso}
            </li>
          ))}
        </ol>
      </EncabezadoPagina>

      <Contenedor className="py-5 md:py-8">
        <ExploradorCalculadoras inicial={inicial} productos={productos} />
      </Contenedor>
    </>
  );
}
