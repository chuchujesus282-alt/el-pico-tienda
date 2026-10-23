import { Montanas } from "@/components/layout/Logo";

// Escena del banner "Cerrajería que PROTEGE" del carrusel (misma familia que HerramientasAsomadas y ObraEnConcreto):
// azul marino para el texto y, cortada en diagonal con el ángulo del filete, una placa de acero cepillado; en el
// corte, una bisagra de latón con sus nudillos. Encima flota un candado de latón (dibujado en SVG) con las montañas
// de El Pico grabadas y su llave colgando debajo. Solo la monta BannerInicio cuando banner.id === "cerrajeria".
//
// - Al pasar el cursor (o con el foco del teclado) la llave sube y entra, gira y el arco salta: el candado se abre.
//   Al salir, todo vuelve a la vez.
// - Movimiento reducido: queda quieto y cerrado.

// Cuadrícula técnica (plano de taller). Escrita completa para que Tailwind la encuentre.
const CUADRICULA_BLANCA =
  "bg-[linear-gradient(var(--color-pico-blanco)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-blanco)_1px,transparent_1px)] bg-[size:40px_40px]";
const CUADRICULA_AZUL =
  "bg-[linear-gradient(var(--color-pico-azul)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-azul)_1px,transparent_1px)] bg-[size:40px_40px]";

// Bisagra en el corte: nudillos de latón de 56px con la junta oscura entre uno y otro.
const BISAGRA =
  "bg-[repeating-linear-gradient(to_bottom,var(--color-laton-oscuro)_0,var(--color-laton-oscuro)_3px,var(--color-laton-claro)_3px,var(--color-laton)_30px,var(--color-laton-oscuro)_56px)]";

// Mismos cortes que el banner de construcción. En el teléfono, al 66%: deja aire al sello "PROTEGE".
const CORTE = "left-[66%] md:left-[57%] xl:left-[52%]";
const CORTE_BISAGRA = "left-[calc(66%-1.4rem)] md:left-[calc(57%-1.4rem)] xl:left-[calc(52%-1.4rem)]";

// Secuencia al abrir: la llave sube (0 ms), gira (450 ms) y el arco salta (700 ms). Al salir, sin retraso.
const MOVER = "transition-transform ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-none";

function FondoAcero() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro">
      <div className={`absolute inset-0 opacity-[0.05] ${CUADRICULA_BLANCA} [mask-image:linear-gradient(to_right,black_10%,transparent_55%)]`} />
      <div
        className={`absolute -inset-y-6 -right-24 ${CORTE} origin-bottom -skew-x-12 overflow-hidden bg-gradient-to-br from-acero-claro via-acero to-acero-oscuro shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%]`}
      >
        {/* Acero cepillado: vetas finas horizontales. */}
        <div className="absolute inset-0 skew-x-12 bg-[repeating-linear-gradient(to_bottom,var(--color-pico-blanco)_0,var(--color-pico-blanco)_1px,transparent_1px,transparent_5px)] opacity-[0.18]" />
        <div className={`absolute inset-0 skew-x-12 opacity-[0.08] ${CUADRICULA_AZUL}`} />
        <Montanas className="absolute -right-6 -bottom-10 w-[115%] skew-x-12 fill-pico-azul/[0.07]" />
        {/* Luz suave detrás del candado. */}
        <div className="absolute top-1/2 left-[45%] aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 skew-x-12 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_60%)] opacity-50" />
      </div>
      {/* Bisagra de latón en el corte. */}
      <div className={`absolute -inset-y-6 ${CORTE_BISAGRA} w-[1.4rem] origin-bottom -skew-x-12 ${BISAGRA} shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%]`} />
    </div>
  );
}

/** Candado de latón con arco de acero, de frente; la llave entra por debajo. Ids fijos: hay un solo banner así. */
function Candado() {
  return (
    <svg viewBox="0 0 200 320" className="h-auto w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="cerr-laton" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--color-laton-oscuro)" }} />
          <stop offset="0.28" style={{ stopColor: "var(--color-laton-claro)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--color-laton)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-laton-oscuro)" }} />
        </linearGradient>
        <linearGradient id="cerr-acero" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--color-acero-oscuro)" }} />
          <stop offset="0.35" style={{ stopColor: "var(--color-acero-claro)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-acero-oscuro)" }} />
        </linearGradient>
      </defs>

      {/* Llave: detrás del cuerpo. Cuelga bajo el candado y al abrir sube hasta que la paleta queda adentro; luego gira
          (se angosta, como vista de frente al dar la vuelta). */}
      <g className={`${MOVER} duration-400 group-hover:-translate-y-[30px]`}>
        <g
          className={`${MOVER} duration-300 group-hover:scale-x-[0.28] group-hover:[transition-delay:450ms]`}
          style={{ transformOrigin: "100px 0", transformBox: "view-box" }}
        >
          {/* Paleta con sus dientes: en reposo asoma bajo el cuerpo; al subir entra entera por la ranura. */}
          <path d="M94 240h12v34H94z" fill="url(#cerr-acero)" />
          <path d="M106 244h7v5h-7zM106 253h5v5h-5zM106 262h8v5h-8z" fill="var(--color-acero-oscuro)" />
          {/* Ojo de la llave: queda siempre a la vista, bajo el candado. */}
          <circle cx="100" cy="292" r="19" fill="url(#cerr-acero)" stroke="var(--color-acero-oscuro)" strokeWidth="2" />
          <circle cx="100" cy="295" r="6.5" fill="var(--color-pico-azul-oscuro)" opacity="0.55" />
          {/* El único acento rojo: la argolla de la llave. */}
          <circle cx="100" cy="295" r="10.5" fill="none" stroke="var(--color-pico-rojo)" strokeWidth="3" />
        </g>
      </g>

      {/* Arco: salta al abrir. */}
      <path
        d="M57 132V92a43 43 0 0 1 86 0v40"
        fill="none"
        stroke="url(#cerr-acero)"
        strokeWidth="20"
        className={`${MOVER} duration-400 group-hover:-translate-y-[22px] group-hover:[transition-delay:700ms]`}
      />

      {/* Cuerpo de latón con su borde biselado, el brillo y las montañas de El Pico grabadas. */}
      <rect x="22" y="118" width="156" height="112" rx="16" fill="url(#cerr-laton)" />
      <rect x="30" y="126" width="140" height="96" rx="11" fill="none" stroke="var(--color-laton-oscuro)" strokeOpacity="0.45" strokeWidth="2" />
      <rect x="40" y="130" width="10" height="88" rx="5" fill="var(--color-pico-blanco)" opacity="0.35" />
      {/* Mismo contorno que Montanas (Logo.tsx), escalado a 64px de ancho y centrado en el cuerpo. */}
      <path
        transform="translate(68 148) scale(0.0434) translate(-263 -263)"
        fillRule="evenodd"
        d="M263 1262 L763 421 L988 800 L1250 263 L1737 1262 Z M482 1137 L763 665 L1043 1137 Z"
        fill="var(--color-laton-oscuro)"
        opacity="0.55"
      />
      {/* Remaches de las esquinas. */}
      {[
        [38, 134],
        [162, 134],
        [38, 214],
        [162, 214],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="var(--color-laton-oscuro)" opacity="0.6" />
      ))}
      {/* Ranura de la llave en la base. */}
      <rect x="92" y="222" width="16" height="8" rx="2" fill="var(--color-pico-azul-oscuro)" />
    </svg>
  );
}

export default function CerraduraSegura() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <FondoAcero />
      {/* El candado flota a la derecha; al pasar el cursor crece un poco. */}
      <div className="absolute top-1/2 right-[6%] w-[22%] max-w-[16rem] -translate-y-1/2 transition-transform duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:scale-[1.05] motion-reduce:transition-none md:right-[12%] md:w-[19%] lg:w-[16%] xl:right-[15%] xl:w-[15%]">
        {/* Sombra en el "piso", para que se note que flota. */}
        <span className="absolute -bottom-[6%] left-1/2 h-[7%] w-[60%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/45 blur-xl" />
        <span className="relative block drop-shadow-2xl drop-shadow-pico-azul-oscuro/50 motion-safe:animate-levitar">
          <Candado />
        </span>
      </div>
    </div>
  );
}
