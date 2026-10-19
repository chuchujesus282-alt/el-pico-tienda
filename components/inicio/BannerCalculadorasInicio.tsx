import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RUTA_CALCULADORAS } from "@/components/calculadoras/rutas";
import { calcularBloques } from "@/lib/calculadoras/bloques";

// Ejemplo de la libreta: una pared de 4 × 2,5 m de bloque de concreto de 15 cm. Las cantidades NO van escritas a
// mano: salen de la misma calculadora de bloques de la tienda, así siempre coinciden con lo que obtendría el cliente.
const EJEMPLO = { largo: 4, alto: 2.5 };
const NOMBRES: Record<string, string> = {
  "bloque-concreto-15": "Bloques de 15",
  cemento: "Cemento",
  arena: "Arena lavada",
};
/** En el teléfono la libreta es angosta: nombres de una palabra para que quepan con su cantidad. */
const NOMBRES_CORTOS: Record<string, string> = {
  "bloque-concreto-15": "Bloques",
  cemento: "Cemento",
  arena: "Arena",
};
const UNIDADES: Record<string, (n: number) => string> = {
  "bloque-concreto-15": (n) => `${n}`,
  cemento: (n) => `${n} ${n === 1 ? "saco" : "sacos"}`,
  arena: (n) => `${n.toLocaleString("es-VE")} m³`,
};

/** Palomita a lápiz rojo; `--i` desfasa su animación (se marcan en cascada). */
function Palomita({ i }: { i: number }) {
  return (
    <svg viewBox="0 0 24 24" className="absolute -top-[35%] -left-[20%] size-[160%] overflow-visible" aria-hidden>
      <path
        d="M3.5 13.5c2 1.2 3.6 3.2 5 5.6C11.6 12.2 15.8 6.6 21.5 2.5"
        pathLength={1}
        strokeWidth={3.4}
        className="libreta-check"
        style={{ "--i": i } as CSSProperties}
      />
    </svg>
  );
}

/**
 * La libreta amarilla del maestro de obra (el concepto "La lista" del concurso): hoja rayada con margen rojo, sujeta
 * con tirro, con las cuentas de la pared. Las palomitas rojas se marcan una tras otra y la última ("Lo que te falte")
 * se queda punteada esperando: eso lo completa el cliente en la calculadora. En bucle; con "reducir movimiento" queda
 * quieta y marcada. Estilos en globals.css (`.libreta`).
 */
function Libreta() {
  const { materiales } = calcularBloques({ medidas: EJEMPLO, opciones: { tipo: "concreto", espesor: "15" } });
  const renglones = materiales.map((m) => ({
    nombre: NOMBRES[m.material] ?? m.material,
    corto: NOMBRES_CORTOS[m.material] ?? m.material,
    cantidad: (UNIDADES[m.material] ?? String)(m.cantidad),
  }));
  const medidas = `${EJEMPLO.largo} × ${EJEMPLO.alto.toLocaleString("es-VE")} m`;

  return (
    <div
      className="libreta relative w-full -rotate-3 px-3 pt-4 pb-3 transition-transform duration-500 ease-(--curva-suave) group-hover:rotate-0 md:px-5 md:pt-6 md:pb-4"
      aria-hidden
    >
      <span className="libreta-tirro absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2 md:-top-3 md:h-6 md:w-24" />
      <p className="relative pl-4 text-[9px] font-bold tracking-[0.08em] whitespace-nowrap text-pico-rojo uppercase sm:text-[10px] sm:tracking-[0.16em] md:pl-6 md:text-xs">
        Pared {medidas}
      </p>
      <ul className="relative mt-1.5 space-y-1 pl-4 md:mt-2 md:space-y-1.5 md:pl-6">
        {renglones.map((r, i) => (
          <li key={r.nombre} className="flex items-center gap-2 text-[11px] leading-tight font-semibold text-texto md:gap-2.5 md:text-sm">
            <span className="relative size-3 shrink-0 rounded-[2px] border-[1.5px] border-texto md:size-3.5">
              <Palomita i={i} />
            </span>
            <span className="min-w-0 flex-1 truncate">
              <span className="sm:hidden">{r.corto}</span>
              <span className="hidden sm:inline">{r.nombre}</span>
            </span>
            <span className="font-bold whitespace-nowrap tabular-nums">{r.cantidad}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 text-[11px] leading-tight font-bold text-pico-rojo md:gap-2.5 md:text-sm">
          <span className="libreta-falta relative size-3 shrink-0 rounded-[2px] border-[1.5px] border-dashed border-pico-rojo md:size-3.5" />
          Lo que te falte
        </li>
      </ul>
    </div>
  );
}

/**
 * Tira del inicio que lleva a /calculadoras: azul cobalto de plano de obra con su cuadrícula de tiza (la paleta
 * ganadora del concurso de colores, "Plano de obra"), la pregunta en grande con subrayado amarillo, la libreta
 * amarilla al centro (más alta que la tira: sobresale como pegada encima) y el botón blanco con letra roja.
 * El de las categorías es components/calculadoras/BannerCalculadoras.
 */
export default function BannerCalculadoras() {
  return (
    <Link
      href={RUTA_CALCULADORAS}
      className="group relative isolate my-4 block rounded-banner shadow-tarjeta transition-shadow duration-200 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pico-azul md:my-6"
    >
      {/* Fondo: el plano (va aparte y recortado, así la libreta puede sobresalir de la tira). */}
      <span className="tira-plano absolute inset-0 -z-10 overflow-hidden rounded-banner" aria-hidden />

      <div className="grid grid-cols-[minmax(0,1fr)_9.5rem] items-center gap-3 py-5 pr-3 pl-5 sm:grid-cols-[minmax(0,1fr)_12rem] md:grid-cols-[minmax(0,1fr)_16rem] md:gap-8 lg:grid-cols-[minmax(0,1fr)_17rem_auto] md:py-6 md:pr-8 md:pl-10 lg:gap-12 lg:pl-14">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.18em] text-amarillo-obra uppercase md:text-xs">Calculadoras gratis</p>
          <p className="mt-1.5 leading-[0.95] font-bold text-pico-blanco">
            <span className="block text-base md:text-xl">¿Cuánto material</span>
            <span className="relative mt-0.5 inline-block text-xl tracking-[-0.02em] whitespace-nowrap uppercase sm:text-3xl lg:text-4xl">
              te hace falta?
              <svg viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute -bottom-[0.18em] left-0 h-[0.22em] w-full overflow-visible" aria-hidden>
                <path d="M3 9C40 4 82 11 122 6s60-3 75 1" pathLength={1} strokeWidth={5} className="tira-subrayado" />
              </svg>
            </span>
          </p>
          <p className="mt-3 hidden max-w-md text-sm text-pico-blanco/85 sm:block md:text-base">
            Pon las medidas y te decimos cuántos bloques, sacos y cabillas llevar. Lo agregas todo al pedido.
          </p>
          {/* En teléfono y tableta el botón va bajo el texto; desde 1024px, en su propia columna a la derecha. */}
          <span className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-chip bg-pico-blanco px-4 text-sm font-bold text-pico-rojo shadow-tarjeta md:h-11 md:px-5 md:text-base lg:hidden">
            Calcular mi obra
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>

        {/* La libreta sobresale de la tira por arriba y por abajo. */}
        <div className="-my-10 md:-my-12">
          <Libreta />
        </div>

        <span className="hidden h-12 items-center gap-2 rounded-chip bg-pico-blanco px-6 text-base font-bold whitespace-nowrap text-pico-rojo shadow-tarjeta transition duration-200 group-hover:shadow-boton-hover motion-safe:group-hover:-translate-y-0.5 lg:inline-flex">
          Calcular mi obra
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
