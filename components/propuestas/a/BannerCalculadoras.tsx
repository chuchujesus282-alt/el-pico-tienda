import { ArrowDown, Check } from "lucide-react";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";

// Propuesta A – "Banner con propósito". Reutiliza EncabezadoPagina (migas, lupa a /buscar en el teléfono, acento rojo)
// y solo cambia lo de adentro: una pregunta como título, UNA frase que dice qué resuelve y por qué, y una invitación
// que baja a la grilla. Nada de fotos ni dibujos: las fotos reales ya están en las tarjetas, que son las protagonistas.

type Props = {
  /** id de la grilla a la que baja "Elige tu trabajo". */
  destino: string;
  /** Cantidad de calculadoras (sale de CALCULADORAS, no se escribe a mano). */
  cantidad: number;
  /** Cantidad de materiales distintos que pueden devolver (sale de CALCULADORAS). */
  materiales: number;
};

// Lo que te llevas de cada calculadora: sale de cómo funcionan (redondeo a unidades de venta, precio del catálogo,
// "Agregar todo al carrito" y pedido por WhatsApp). Solo desde 1024px, a la derecha del texto.
const entregas = ["Cantidades en sacos, barras, cajas o galones", "El precio de cada material", "Todo al carrito y pides por WhatsApp"];

function QueTeDamos() {
  return (
    <div className="w-80 rounded-tarjeta bg-pico-blanco/[0.06] p-4 ring-1 ring-pico-blanco/10">
      <p className="text-xs font-semibold tracking-[0.2em] text-pico-blanco/60 uppercase">Te llevas</p>
      <ul className="mt-3 space-y-2.5">
        {entregas.map((texto) => (
          <li key={texto} className="flex items-start gap-2.5 text-sm leading-snug">
            <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-chip bg-pico-blanco text-pico-azul" aria-hidden>
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            {texto}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BannerCalculadoras({ destino, cantidad, materiales }: Props) {
  return (
    <EncabezadoPagina
      etiqueta="Calculadoras de materiales"
      titulo="¿Cuánto material necesitas?"
      descripcion={
        <>
          Pon las medidas de tu obra y te decimos cuántos sacos, bloques o galones llevar, con su precio,{" "}
          <span className="font-semibold text-pico-blanco">para que no compres de más ni te quedes corto.</span>
        </>
      }
      ruta={[{ texto: "Calculadoras" }]}
      compacto
      ilustracion={<QueTeDamos />}
    >
      {/* Invitación a la grilla: es un enlace de ancla, no un botón rojo, para no competir con los "Calcular" de las tarjetas. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <a
          href={`#${destino}`}
          className="group inline-flex h-10 items-center gap-2 rounded-boton bg-pico-blanco px-4 text-sm font-semibold text-pico-azul transition-colors hover:bg-pico-azul-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco"
        >
          Elige tu trabajo
          <ArrowDown className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-y-0.5" aria-hidden />
        </a>
        <p className="text-[13px] text-pico-blanco/75">
          <strong className="font-semibold text-pico-blanco">{cantidad} calculadoras</strong>
          <span aria-hidden> · </span>
          {materiales} materiales
          <span className="hidden sm:inline">
            <span aria-hidden> · </span>
            gratis y sin registrarte
          </span>
        </p>
      </div>
    </EncabezadoPagina>
  );
}
