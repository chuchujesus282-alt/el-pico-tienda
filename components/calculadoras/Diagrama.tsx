import type { TipoDiagrama } from "@/lib/calculadoras/tipos";

const trazo = "fill-none stroke-pico-azul";
const cota = "fill-none stroke-pico-rojo";
const texto = "fill-pico-rojo text-[13px] font-semibold";

/** Línea de cota roja con sus topes y la etiqueta de la medida. */
function Cota({ x1, y1, x2, y2, etiqueta, tx, ty }: { x1: number; y1: number; x2: number; y2: number; etiqueta: string; tx: number; ty: number }) {
  const vertical = x1 === x2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className={cota} strokeWidth={1.5} />
      {vertical ? (
        <>
          <line x1={x1 - 5} y1={y1} x2={x1 + 5} y2={y1} className={cota} strokeWidth={1.5} />
          <line x1={x2 - 5} y1={y2} x2={x2 + 5} y2={y2} className={cota} strokeWidth={1.5} />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - 5} x2={x1} y2={y1 + 5} className={cota} strokeWidth={1.5} />
          <line x1={x2} y1={y2 - 5} x2={x2} y2={y2 + 5} className={cota} strokeWidth={1.5} />
        </>
      )}
      <text x={tx} y={ty} textAnchor="middle" className={texto}>
        {etiqueta}
      </text>
    </g>
  );
}

function Pared() {
  return (
    <>
      <rect x="40" y="24" width="230" height="110" rx="3" className={`${trazo} fill-pico-azul-claro`} strokeWidth={2} />
      {/* Puerta y ventana: lo que se descuenta. */}
      <rect x="70" y="64" width="40" height="70" className="fill-pico-blanco stroke-pico-azul" strokeWidth={1.5} strokeDasharray="5 4" />
      <rect x="170" y="52" width="60" height="42" className="fill-pico-blanco stroke-pico-azul" strokeWidth={1.5} strokeDasharray="5 4" />
      <Cota x1={40} y1={152} x2={270} y2={152} etiqueta="Largo" tx={155} ty={170} />
      <Cota x1={22} y1={24} x2={22} y2={134} etiqueta="Alto" tx={22} ty={16} />
    </>
  );
}

function Superficie() {
  return (
    <>
      <polygon points="60,52 250,52 290,132 20,132" className={`${trazo} fill-pico-azul-claro`} strokeWidth={2} />
      {[1, 2, 3].map((i) => (
        <line key={i} x1={60 + i * 47.5} y1={52} x2={20 + i * 67.5} y2={132} className="stroke-pico-azul/30" strokeWidth={1} />
      ))}
      <line x1="45" y1="82" x2="265" y2="82" className="stroke-pico-azul/30" strokeWidth={1} />
      <line x1="32" y1="108" x2="278" y2="108" className="stroke-pico-azul/30" strokeWidth={1} />
      <Cota x1={20} y1={150} x2={290} y2={150} etiqueta="Largo" tx={155} ty={168} />
      <text x="286" y="88" textAnchor="start" className={texto}>
        Ancho
      </text>
    </>
  );
}

function Volumen() {
  return (
    <>
      <polygon points="60,50 250,50 285,104 25,104" className={`${trazo} fill-pico-azul-claro`} strokeWidth={2} />
      <polygon points="25,104 285,104 285,128 25,128" className={`${trazo} fill-pico-blanco`} strokeWidth={2} />
      <Cota x1={25} y1={146} x2={285} y2={146} etiqueta="Largo" tx={155} ty={164} />
      <Cota x1={298} y1={104} x2={298} y2={128} etiqueta="Espesor" tx={272} ty={44} />
      <line x1="298" y1="50" x2="298" y2="100" className="stroke-pico-rojo/40" strokeWidth={1} strokeDasharray="3 3" />
      <text x="34" y="74" textAnchor="end" className={texto}>
        Ancho
      </text>
    </>
  );
}

function Techo() {
  return (
    <>
      <polygon points="30,112 150,40 290,112" className={`${trazo} fill-pico-azul-claro`} strokeWidth={2} />
      <line x1="150" y1="40" x2="150" y2="112" className="stroke-pico-azul/30" strokeWidth={1} strokeDasharray="4 4" />
      {/* Caída: se mide siguiendo la pendiente. */}
      <line x1="160" y1="28" x2="298" y2="99" className={cota} strokeWidth={1.5} />
      <line x1="157" y1="33" x2="163" y2="23" className={cota} strokeWidth={1.5} />
      <line x1="295" y1="104" x2="301" y2="94" className={cota} strokeWidth={1.5} />
      <text x="246" y="50" textAnchor="middle" className={texto}>
        Caída
      </text>
      <Cota x1={30} y1={134} x2={290} y2={134} etiqueta="El largo va hacia el fondo" tx={160} ty={154} />
    </>
  );
}

function Malla() {
  return (
    <>
      <rect x="40" y="24" width="230" height="110" rx="3" className={`${trazo} fill-pico-azul-claro`} strokeWidth={2} />
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={`v${i}`} x1={40 + i * 28.75} y1={24} x2={40 + i * 28.75} y2={134} className="stroke-pico-azul/50" strokeWidth={1.5} />
      ))}
      {[1, 2, 3].map((i) => (
        <line key={`h${i}`} x1={40} y1={24 + i * 27.5} x2={270} y2={24 + i * 27.5} className="stroke-pico-azul/50" strokeWidth={1.5} />
      ))}
      <Cota x1={40} y1={152} x2={270} y2={152} etiqueta="Largo" tx={155} ty={170} />
      <Cota x1={22} y1={24} x2={22} y2={134} etiqueta="Ancho" tx={24} ty={16} />
      <Cota x1={68.75} y1={12} x2={97.5} y2={12} etiqueta="Separación" tx={150} ty={16} />
    </>
  );
}

const dibujos: Record<TipoDiagrama, () => React.JSX.Element> = {
  pared: Pared,
  superficie: Superficie,
  volumen: Volumen,
  techo: Techo,
  malla: Malla,
};

/** Dibujo simple de "cómo medir", con las cotas en rojo. Decorativo: el texto de al lado dice lo mismo. */
export default function Diagrama({ tipo, className = "" }: { tipo: TipoDiagrama; className?: string }) {
  const Dibujo = dibujos[tipo];
  return (
    <svg viewBox="0 0 320 180" className={`font-sans ${className}`} aria-hidden>
      <Dibujo />
    </svg>
  );
}
