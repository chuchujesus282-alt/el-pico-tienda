import { useEffect, type RefObject } from "react";
import { animarAlDesplazar } from "./tactil";

// El tornillo que se atornilla: dibujo, plano de medidas y animación, COMPARTIDOS por el banner del inicio
// (components/inicio/BannerTornilleria.tsx, claro) y la tarjeta de categoría (CategoryCardTornilleria.tsx, azul).
// Portado TAL CUAL de los prototipos aprobados banner-tornilleria.html y tarjeta-tornilleria-vertical.html, que usan
// el mismo dibujo y la misma animación: state(t), SIDE, FRONT, T_TILT, T_SCREW, T_END, TURNS, curvas y flotación sin
// cambios; solo cambian los colores (COLORES_CLARO / COLORES_AZUL). No cambies valores sin acordarlo: afectan a los dos.
// Al animarse el tornillo se inclina hacia el usuario (la vista lateral se aplana con scaleY = cos y la de frente
// crece con scaleY = sen), aparece el aro y se atornilla dando 3 vueltas mientras la cabeza se hunde, con un pequeño
// asiento al final. Es reversible: al salir se desatornilla (velocidad 1.3) y vuelve a verse de lado, flotando.

type Ease = (x: number) => number;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, s: number, d: number, e: Ease) => e(clamp((t - s) / d));
const cubicOut: Ease = (x) => 1 - Math.pow(1 - x, 3);
const cubicInOut: Ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const quadInOut: Ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

// posiciones: de lado la cabeza está arriba; de frente queda en el centro
const SIDE = { x: 140, y: 92 },
  FRONT = { x: 140, y: 150 };
const T_TILT = 0.55,
  T_SCREW = 1.25,
  T_END = T_TILT + T_SCREW + 0.15;
const TURNS = 3;

function state(t: number) {
  const tilt = seg(t, 0, T_TILT, cubicInOut); // 0 de lado → 1 de frente
  const sc = seg(t, T_TILT, T_SCREW, quadInOut); // avance del atornillado
  const speed = Math.sin(Math.PI * clamp((t - T_TILT) / T_SCREW));
  return {
    tilt,
    x: SIDE.x + (FRONT.x - SIDE.x) * tilt,
    y: SIDE.y + (FRONT.y - SIDE.y) * tilt,
    spin: 360 * TURNS * sc,
    sink: sc,
    speed,
    holeOp: seg(t, T_TILT - 0.1, 0.3, cubicOut),
    settle: Math.sin(clamp((t - T_TILT - T_SCREW) / 0.15) * Math.PI),
    f: 1 - seg(t, 0, 0.35, cubicOut),
  };
}

/** Atributos de cada pieza para un estado y una flotación: los mismos cálculos que el frame() del prototipo. */
function atributos(s: ReturnType<typeof state>, bob: number) {
  const ang = (s.tilt * Math.PI) / 2,
    c = Math.cos(ang),
    sn = Math.sin(ang);
  const scale = 1 - 0.18 * s.sink * s.tilt;
  return {
    screw: `translate(${s.x.toFixed(2)} ${(s.y + bob + s.settle * 1.5).toFixed(2)}) scale(${scale.toFixed(3)})`,
    side: `scale(1 ${Math.max(c, 0.001).toFixed(3)})`,
    sideOp: c > 0.04 ? "1" : "0",
    front: `scale(1 ${Math.max(sn, 0.001).toFixed(3)})`,
    frontOp: sn > 0.04 ? "1" : "0",
    slot: `rotate(${s.spin.toFixed(1)})`,
    hole: `translate(${FRONT.x} ${FRONT.y}) scale(1 ${Math.max(sn, 0.001).toFixed(3)})`,
    holeOp: (s.holeOp * 0.9).toFixed(3),
    swirlOp: (s.speed * 0.8).toFixed(3),
    swirl: `translate(${FRONT.x} ${FRONT.y}) rotate(${(s.spin * 0.6).toFixed(1)})`,
    f: s.f.toFixed(3),
  };
}

// Reposo (t = 0, sin flotación): así el tornillo se ve en su sitio desde el HTML, antes de que corra el JavaScript.
const REPOSO = atributos(state(0), 0);

/** Colores del dibujo y del plano: los del banner claro del inicio y los de la tarjeta azul, como sus prototipos. */
export type ColoresTornillo = {
  plano: string;
  planoCirculo: string;
  planoCotas: string;
  trazo: string;
  cuerpo: string;
  cabeza: string;
};
export const COLORES_CLARO: ColoresTornillo = {
  plano: "rgba(60,82,112,.4)",
  planoCirculo: "rgba(60,82,112,.28)",
  planoCotas: "rgba(60,82,112,.55)",
  trazo: "#8794a6",
  cuerpo: "#eef2f7",
  cabeza: "#f3f6fa",
};
export const COLORES_AZUL: ColoresTornillo = {
  plano: "rgba(190,215,245,.45)",
  planoCirculo: "rgba(190,215,245,.28)",
  planoCotas: "rgba(190,215,245,.5)",
  trazo: "#c3ccd8",
  cuerpo: "#0e2847",
  cabeza: "#0e2847",
};

type Ref = RefObject<SVGGElement | null>;
export type RefsTornillo = {
  /** El enlace que se anima (banner o tarjeta): recibe el mouse, el foco y el toque, y la variable --f. */
  contenedor: RefObject<HTMLElement | null>;
  tornillo: Ref;
  lateral: Ref;
  frente: Ref;
  ranura: Ref;
  aro: Ref;
  giro: Ref;
};

/**
 * La animación: el requestAnimationFrame arranca aquí y en la limpieza se cancela y se quitan los listeners.
 * Escritorio: anima con el mouse encima o el foco, y se desatornilla al salir. Teléfono: el toque que DESPLAZA la página
 * sobre la tarjeta lo anima, y vuelve a reposo al salir de la pantalla o cuando otra toma el turno (tactil.ts); el toque
 * quieto entra. `claseOn` (opcional): se pone mientras está animado (la flecha de la tarjeta, como el prototipo).
 */
export function useTornilloQueSeAtornilla(refs: RefsTornillo, claseOn?: string) {
  useEffect(() => {
    const banner = refs.contenedor.current,
      screw = refs.tornillo.current,
      side = refs.lateral.current,
      front = refs.frente.current,
      slot = refs.ranura.current,
      hole = refs.aro.current,
      swirl = refs.giro.current;
    if (!banner || !screw || !side || !front || !slot || !hole || !swirl) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // reversible: al salir se desatornilla y vuelve a verse de lado
    let t = 0,
      dir = -1,
      clock = 0,
      on = false;
    function turnOn() {
      if (on) return;
      on = true;
      dir = 1;
      if (claseOn) banner!.classList.add(claseOn);
    }
    function turnOff() {
      if (!on) return;
      on = false;
      dir = -1;
      if (claseOn) banner!.classList.remove(claseOn);
    }
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    banner.addEventListener("mouseenter", turnOn);
    banner.addEventListener("mouseleave", turnOff);
    banner.addEventListener("focusin", turnOn);
    banner.addEventListener("focusout", turnOff);
    const quitarTactil = finePointer ? null : animarAlDesplazar(banner, turnOn, turnOff);

    let last = performance.now();
    let raf = 0;
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reduce) clock += dt;
      t = Math.max(0, Math.min(T_END, t + dt * dir * (reduce ? 3 : dir > 0 ? 1 : 1.3)));
      const s = state(t);

      // flotación solo de lado y en reposo
      const bob = Math.sin(clock * 1.6) * 5 * (1 - s.tilt) * (t === 0 ? 1 : 1 - clamp(t / 0.2));
      const a = atributos(s, bob);
      screw!.setAttribute("transform", a.screw);
      side!.setAttribute("transform", a.side);
      side!.setAttribute("opacity", a.sideOp);
      front!.setAttribute("transform", a.front);
      front!.setAttribute("opacity", a.frontOp);
      slot!.setAttribute("transform", a.slot);

      hole!.setAttribute("transform", a.hole);
      hole!.setAttribute("opacity", a.holeOp);
      swirl!.setAttribute("opacity", a.swirlOp);
      swirl!.setAttribute("transform", a.swirl);
      banner!.style.setProperty("--f", a.f);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // ---------- limpieza: nada queda vivo al cambiar de página ----------
    return () => {
      cancelAnimationFrame(raf);
      banner.removeEventListener("mouseenter", turnOn);
      banner.removeEventListener("mouseleave", turnOff);
      banner.removeEventListener("focusin", turnOn);
      banner.removeEventListener("focusout", turnOff);
      quitarTactil?.();
      if (claseOn) banner.classList.remove(claseOn);
      banner.style.removeProperty("--f");
    };
    // Las refs no cambian; la clase tampoco.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Plano de medidas (va dentro del SVG del plano): escuadra, círculo punteado, cotas 50 mm y Ø 20 mm, TORNILLO 12 × 50. */
export function PlanoTornillo({ colores }: { colores: ColoresTornillo }) {
  return (
    <>
      <g stroke={colores.plano} fill="none">
        <path d="M40 58 V44 H56" strokeWidth="1.2" />
        <circle cx="140" cy="150" r="96" strokeDasharray="2 4" stroke={colores.planoCirculo} />
        <line x1="140" y1="40" x2="140" y2="60" />
        <line x1="28" y1="150" x2="50" y2="150" />
        <line x1="230" y1="150" x2="252" y2="150" />
      </g>
      <g stroke={colores.planoCotas}>
        {/* cota vertical: largo total */}
        <line x1="216" y1="80" x2="216" y2="224" />
        <line x1="209" y1="80" x2="223" y2="80" />
        <line x1="209" y1="224" x2="223" y2="224" />
        {/* cota horizontal: cabeza */}
        <line x1="107" y1="250" x2="173" y2="250" />
        <line x1="107" y1="244" x2="107" y2="256" />
        <line x1="173" y1="244" x2="173" y2="256" />
      </g>
      <text x="230" y="152" transform="rotate(90 230 152)" textAnchor="middle">
        50 mm
      </text>
      <circle cx="107" cy="250" r="3" fill="#e3262f" />
      <text x="140" y="268" textAnchor="middle">
        Ø 20 mm
      </text>
      <text x="16" y="126">
        TORNILLO 12 × 50
      </text>
    </>
  );
}

/** La escena (va dentro del SVG de la escena): el aro, el tornillo con sus dos vistas y los trazos de giro. */
export function EscenaTornillo({
  colores,
  tornillo,
  lateral,
  frente,
  ranura,
  aro,
  giro,
}: { colores: ColoresTornillo } & Omit<RefsTornillo, "contenedor">) {
  return (
    <>
      {/* superficie donde se atornilla (aparece al hundirse) */}
      <g ref={aro} opacity={REPOSO.holeOp} transform={REPOSO.hole} fill="none" stroke={colores.trazo} strokeLinecap="round">
        <circle r="40" strokeWidth="2.5" />
        <circle r="49" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.7" />
      </g>

      <g ref={tornillo} transform={REPOSO.screw} strokeLinecap="round" strokeLinejoin="round">
        {/* vista lateral (origen en el centro de la cabeza) */}
        <g ref={lateral} transform={REPOSO.side} opacity={REPOSO.sideOp}>
          <path d="M -22 13 V 94 L 0 132 L 22 94 V 13" fill={colores.cuerpo} stroke={colores.trazo} strokeWidth="3.5" />
          <path
            d="M -22 34 L 22 20 M -22 56 L 22 42 M -22 78 L 22 64 M -19.1 99.1 L 22 86"
            fill="none"
            stroke={colores.trazo}
            strokeWidth="3.5"
          />
          <rect x="-33" y="-12" width="66" height="25" rx="7" fill={colores.cabeza} stroke={colores.trazo} strokeWidth="3.5" />
          <path d="M -12 0 H 12" stroke="#e3262f" strokeWidth="4" />
        </g>
        {/* vista de frente: la parte plana de la cabeza con la ranura roja */}
        <g ref={frente} transform={REPOSO.front} opacity={REPOSO.frontOp}>
          <circle r="40" fill={colores.cabeza} stroke={colores.trazo} strokeWidth="3.5" />
          <circle r="29" fill="none" stroke={colores.trazo} strokeWidth="2" opacity="0.55" />
          <g ref={ranura} transform={REPOSO.slot}>
            <rect x="-21" y="-5" width="42" height="10" rx="2.5" fill="#a81d26" stroke="#e3262f" strokeWidth="2" />
          </g>
        </g>
      </g>

      {/* trazos de giro */}
      <g
        ref={giro}
        opacity={REPOSO.swirlOp}
        transform={REPOSO.swirl}
        fill="none"
        stroke={colores.trazo}
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M 0 -60 A 60 60 0 0 1 42 -43" />
        <path d="M 0 60 A 60 60 0 0 1 -42 43" />
      </g>
    </>
  );
}
