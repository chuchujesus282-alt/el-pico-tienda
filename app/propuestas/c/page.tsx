import type { Metadata } from "next";
import PanelTrabajos from "@/components/propuestas/c/PanelTrabajos";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import { CALCULADORAS, obtenerCalculadora } from "@/lib/calculadoras/registro";

// Propuesta C para /calculadoras — "panel de herramienta". Solo de muestra: no se indexa.

export const metadata: Metadata = {
  title: "Calcula tu proyecto (propuesta C)",
  description: "Elige tu trabajo, mira qué medidas te pide y qué materiales te devuelve, y abre la calculadora.",
  robots: { index: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PropuestaC({ searchParams }: Props) {
  const { calc } = await searchParams;
  const pedido = typeof calc === "string" ? calc : undefined;
  const inicial = (pedido && obtenerCalculadora(pedido)?.slug) || CALCULADORAS[0].slug;

  return (
    <>
      <EncabezadoPagina
        titulo="Calcula tu proyecto"
        descripcion="Elige tu trabajo, pon las medidas y te decimos cuánto material llevar. Gratis y sin registrarte."
        ruta={[{ texto: "Calculadoras" }]}
        compacto
      />
      <Contenedor className="pt-4 pb-10 md:pt-6 md:pb-14">
        <PanelTrabajos inicial={inicial} />
      </Contenedor>
    </>
  );
}
