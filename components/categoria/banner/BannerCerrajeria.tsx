"use client";

import { useId, type CSSProperties } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerCerrajeria.module.css";

/**
 * Banner de la categoría Cerrajería, estilo "plano técnico". Portado del prototipo aprobado banner-cerrajeria-v1.html:
 * candado de latón a la izquierda, corte longitudinal de un cilindro de 5 pines (cuerpo, rotor, línea de corte, pines
 * de llave y de empuje con sus resortes) y su vista frontal.
 * Activo: la llave entra (1,25 s) y cada diente levanta su pin hasta la línea de corte; con los 5 alineados la línea se
 * prende en verde (clase global `abierto`, "ESTADO · ABIERTO"), el rotor gira 90° en la vista frontal y el arco del
 * candado salta y gira. Al salir todo vuelve y la llave sale. Tiempos y colores del prototipo.
 * Diferencias con el prototipo: los pines, resortes y el perfil de la llave se calculan aquí y se dibujan en el
 * servidor (el prototipo los armaba con JS), solo el nombre en la etiqueta (sin "Protege tu casa con", kicker ni
 * subtítulo) y, en reposo, el candado se mece apenas.
 */

// ---------- mecanismo de pines (rotor: y 130–200 · línea de corte y=130 · sin llave, el pin descansa en y=170) ----------
const XS = [220, 280, 340, 400, 460];
const L = [18, 30, 12, 26, 22]; // largo de cada pin de llave
const DRV = 30; // largo del pin de empuje
const BASE = 170;

/** Dibujo de un pin con su resorte, levantado `lift`. */
function geomPin(x: number, l: number, lift: number) {
  const kBottom = BASE - lift,
    kTop = kBottom - l,
    dTop = kTop - DRV;
  const kp = `M${x - 8} ${kTop + 3}Q${x - 8} ${kTop} ${x - 5} ${kTop}H${x + 5}Q${x + 8} ${kTop} ${x + 8} ${kTop + 3}V${kBottom - 6}L${x} ${kBottom}L${x - 8} ${kBottom - 6}Z`;
  const top = 46,
    h = dTop - top,
    n = 7;
  let sp = `M${x} ${top}`;
  for (let k = 1; k <= n; k++) sp += `L${x + (k % 2 ? -6 : 6)} ${(top + (h * k) / n).toFixed(2)}`;
  return { kp, drvY: dTop, sp };
}

// ---------- llave: perfil de dientes que empuja cada pin a su altura ----------
const KEY_Y = 200,
  TIP_X = 186,
  OFF0 = 330;
const PERFIL: [number, number][] = [
  [TIP_X, 196],
  [TIP_X + 14, 184],
  ...XS.flatMap((x, i): [number, number][] => {
    const y = BASE - (40 - L[i]);
    return [
      [x - 7, y],
      [x + 7, y],
    ];
  }),
  [486, 160],
  [528, 160],
];
const CUERPO_LLAVE = `M${PERFIL.map((p) => p.join(" ")).join("L")}L528 ${KEY_Y - 2}L${TIP_X} ${KEY_Y - 2}Z`;

/** Altura del perfil de la llave en x (coordenadas de la llave); null fuera de ella. */
function alturaLlave(xl: number): number | null {
  if (xl < PERFIL[0][0] || xl > PERFIL[PERFIL.length - 1][0]) return null;
  for (let i = 1; i < PERFIL.length; i++) {
    const [x0, y0] = PERFIL[i - 1],
      [x1, y1] = PERFIL[i];
    if (xl <= x1) return y0 + ((y1 - y0) * (xl - x0)) / (x1 - x0 || 1);
  }
  return null;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 3);
const back = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(p: string) => raiz.querySelector<T>(`[data-p="${p}"]`)!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const llave = q<SVGGElement>("llave"),
    arco = q<SVGGElement>("arco"),
    frontal = q<SVGGElement>("frontal"),
    estado = q<SVGTextElement>("estado");
  const pines = XS.map((x, i) => ({
    x,
    l: L[i],
    kp: q<SVGPathElement>(`kp${i}`),
    drv: q<SVGRectElement>(`drv${i}`),
    sp: q<SVGPathElement>(`sp${i}`),
  }));

  let off = OFF0,
    arcoY = 0,
    arcoR = 0,
    rot = 0;
  // Altura con la que se dibujó cada pin la última vez: solo se redibuja el que la llave movió (la mayor parte del
  // recorrido, la llave avanza sin tocar la mayoría de los pines).
  const dibujado = pines.map(() => 0);
  const drawKey = () => {
    llave.setAttribute("transform", `translate(${off.toFixed(2)} 0)`);
    pines.forEach((p, i) => {
      const t = alturaLlave(p.x - off);
      const lift = Math.min(40 - p.l + 0.01, t === null ? 0 : Math.max(0, BASE - t));
      if (Math.abs(lift - dibujado[i]) < 0.05) return;
      dibujado[i] = lift;
      const g = geomPin(p.x, p.l, lift);
      p.kp.setAttribute("d", g.kp);
      p.drv.setAttribute("y", g.drvY.toFixed(2));
      p.sp.setAttribute("d", g.sp);
    });
  };
  const drawArco = () => arco.setAttribute("transform", `translate(0 ${(-arcoY).toFixed(2)}) rotate(${arcoR.toFixed(2)} 52 142)`);
  const drawFront = () => frontal.setAttribute("transform", `rotate(${rot.toFixed(2)})`);
  const ponerEstado = (abierto: boolean) => {
    raiz.classList.toggle("abierto", abierto);
    estado.textContent = abierto ? "ESTADO · ABIERTO" : "ESTADO · CERRADO";
  };

  // ---------- tiempo: cada encender/apagar sube `gen` y corta lo anterior ----------
  let gen = 0,
    destruido = false;
  const rafs = new Set<number>();
  const tween = (d: number, f: (p: number) => void, e: (t: number) => number = ease) => {
    const g = gen;
    const dur = reduce ? 10 : d;
    return new Promise<boolean>((r) => {
      const s = performance.now();
      const k = (n: number) => {
        if (g !== gen || destruido) return r(false);
        const t = Math.min(1, (n - s) / dur);
        f(e(t));
        if (t < 1) {
          const id = requestAnimationFrame((m) => {
            rafs.delete(id);
            k(m);
          });
          rafs.add(id);
        } else r(true);
      };
      k(s);
    });
  };

  async function activar() {
    ++gen;
    raiz.classList.add("on");
    llave.style.opacity = "1";
    // 1. la llave entra: cada diente levanta su pin
    if (!(await tween(1250, (p) => ((off = OFF0 * (1 - p)), drawKey()), out))) return;
    // 2. todos los pines en la línea de corte → el rotor gira
    ponerEstado(true);
    if (!(await tween(420, (p) => ((rot = 90 * p), drawFront()), back))) return;
    // 3. el arco del candado salta y gira
    if (!(await tween(260, (p) => ((arcoY = 16 * p), drawArco()), out))) return;
    await tween(420, (p) => ((arcoR = -28 * p), drawArco()), back);
  }

  async function reposo() {
    const g = ++gen;
    // `on` se queda hasta que la llave sale (BannerPlano ya la quitó; el prototipo la quita al final).
    raiz.classList.add("on");
    ponerEstado(false);
    const a = { y: arcoY, r: arcoR, rot, off };
    const ok = await tween(300, (p) => {
      arcoR = a.r * (1 - p);
      arcoY = a.y * (1 - p);
      rot = a.rot * (1 - p);
      drawArco();
      drawFront();
    });
    if (!ok) return;
    const salio = await tween(
      500,
      (p) => {
        off = a.off + (OFF0 - a.off) * p;
        drawKey();
        llave.style.opacity = String(1 - p * p);
      },
      (t) => t * t,
    );
    if (salio && g === gen) raiz.classList.remove("on");
  }

  return {
    encender: () => void activar(),
    apagar: () => void reposo(),
    destruir() {
      destruido = true;
      gen++;
      rafs.forEach((id) => cancelAnimationFrame(id));
      raiz.classList.remove("abierto");
    },
  };
}

export default function BannerCerrajeria({ nombre }: PropsBannerPropio) {
  const id = useId().replace(/:/g, "");
  const clipCil = `cil-${id}`,
    clipCandado = `candado-${id}`;
  const s = styles;
  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#d4a843"
      crearMotor={crearMotor}
      decoracion="pines"
      variables={
        {
          "--brillo": "radial-gradient(55% 120% at 60% 55%, rgba(212,168,67,.20), transparent 70%)",
          "--brillo-on": "1",
          "--etiqueta-pad": "2px 26px 0",
          "--etiqueta-sombra": "0 10px 24px -10px rgba(227, 38, 47, 0.6)",
        } as CSSProperties
      }
    >
      <div className={s.brilloAbierto} aria-hidden />
      <svg viewBox="0 0 780 260" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={s.svg}>
        <defs>
          <clipPath id={clipCil}>
            <rect x="150" y="40" width="370" height="160" rx="10" />
          </clipPath>
          <clipPath id={clipCandado}>
            <rect x="36" y="138" width="88" height="80" rx="10" />
          </clipPath>
        </defs>

        <text data-p="estado" className={s.estado} x="150" y="24">
          ESTADO · CERRADO
        </text>
        <text className={s.bp} x="520" y="24" textAnchor="end" style={{ fontSize: 7 }}>
          CORTE LONGITUDINAL · CILINDRO 5 PINES
        </text>

        {/* ===== candado (izquierda); en reposo se mece apenas ===== */}
        <g className={s.mece}>
          <g data-p="arco">
            <path className={s.ln} d="M52 142V108A28 28 0 0 1 108 108V142" fill="none" style={{ strokeWidth: 7 }} />
            <path d="M52 142V108A28 28 0 0 1 108 108V142" fill="none" stroke="#0a1f38" strokeWidth="3" />
          </g>
          <rect className={`${s.fill} ${s.fCandado} ${s.ln}`} x="36" y="138" width="88" height="80" rx="10" />
          {/* reflejo dorado que cruza el cuerpo del candado al abrirse */}
          <g clipPath={`url(#${clipCandado})`}>
            <rect className={s.reflejo} x="16" y="130" width="22" height="96" />
          </g>
          <circle cx="80" cy="172" r="6" fill="#0b1d33" />
          <path d="M77 176h6l2 18h-10z" fill="#0b1d33" />
          <path className={s.cota} d="M44 150H116M44 206H116" />
        </g>
        <text className={s.bp} x="36" y="236" style={{ fontSize: 7 }}>
          CANDADO 50 mm
        </text>

        {/* ===== cilindro en corte ===== */}
        <rect className={`${s.fill} ${s.fCuerpo} ${s.ln}`} x="150" y="40" width="370" height="160" rx="10" />
        <g clipPath={`url(#${clipCil})`}>
          <rect className={`${s.fill} ${s.fRotor}`} x="150" y="130" width="370" height="70" />
        </g>
        <path className={s.ln} d="M150 130H520" style={{ strokeWidth: 1.5, opacity: 0.6 }} />
        <line className={s.corte} x1="140" y1="130" x2="530" y2="130" />
        <text className={s.bp} x="152" y="124" style={{ fontSize: 7 }}>
          LÍNEA DE CORTE
        </text>
        <text className={s.bp} x="160" y="214" style={{ fontSize: 7 }}>
          ROTOR
        </text>
        <text className={s.bp} x="160" y="56" style={{ fontSize: 7 }}>
          CUERPO
        </text>

        {/* cámaras, resortes y pines (el motor los mueve con la llave) */}
        {XS.map((x, i) => {
          const g = geomPin(x, L[i], 0);
          return (
            <g key={x}>
              <rect x={x - 11} y="44" width="22" height="128" rx="3" fill="rgba(7,21,38,.75)" stroke="rgba(190,215,245,.55)" strokeWidth="1" />
              <path data-p={`sp${i}`} className={s.resorte} d={g.sp} />
              <rect data-p={`drv${i}`} className={`${s.fill} ${s.fAcero} ${s.ln}`} x={x - 8} y={g.drvY} width="16" height={DRV} rx="3" style={{ strokeWidth: 1.5 }} />
              <path data-p={`kp${i}`} className={`${s.fill} ${s.fLaton} ${s.ln}`} d={g.kp} style={{ strokeWidth: 1.5 }} />
            </g>
          );
        })}
        {/* bocallave */}
        <path className={s.cota} d="M170 172H520M170 200H520" style={{ strokeDasharray: "2 3" }} />
        {/* al abrir, cada pin enciende su punto en la línea de corte, de izquierda a derecha */}
        {XS.map((x, i) => (
          <circle key={x} className={s.alineado} cx={x} cy="130" r="3.5" style={{ transitionDelay: `${i * 60}ms` }} />
        ))}

        {/* vista frontal (arriba a la derecha) */}
        <g transform="translate(700 72)">
          <circle r="34" className={`${s.fill} ${s.fCuerpo} ${s.ln}`} />
          <g data-p="frontal">
            <circle r="22" className={`${s.fill} ${s.fRotor} ${s.ln}`} style={{ strokeWidth: 1.5 }} />
            <path d="M-2 -12H2V8L5 12H-5L-2 8Z" fill="#0b1d33" />
          </g>
          <circle r="3" cx="0" cy="-28" fill="rgba(190,215,245,.55)" />
        </g>
        <text className={s.bp} x="664" y="124" style={{ fontSize: 7 }}>
          VISTA FRONTAL
        </text>

        {/* llave: fuera de cuadro e invisible hasta activarse */}
        <g data-p="llave" transform={`translate(${OFF0} 0)`} style={{ opacity: 0 }}>
          <path className={`${s.fill} ${s.fLaton} ${s.ln}`} d={CUERPO_LLAVE} style={{ strokeWidth: 1.5 }} />
          <path className={s.cota} d={`M${TIP_X + 20} 190H520`} />
          <path className={`${s.fill} ${s.fLaton} ${s.ln}`} d="M528 150H548Q610 132 618 176Q610 222 548 206H528Z" />
          <circle cx="596" cy="178" r="9" fill="#0f2a4a" stroke="#c3ccd8" strokeWidth="1.5" />
        </g>
      </svg>
    </BannerPlano>
  );
}
