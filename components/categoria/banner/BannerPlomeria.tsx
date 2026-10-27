"use client";

import { useId, type CSSProperties } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerPlomeria.module.css";

/**
 * Banner de la categoría Plomería, estilo "plano técnico". Portado del prototipo aprobado banner-plomeria-v1.html: red
 * de tubería PVC ½" (tubo hueco de doble línea, codos curvos, anillo en cada acople, dos válvulas de bola con manija
 * roja y manómetro), manguera flexible y un lavamanos de lujo (tope de mármol flotante con mueble de listones y luz LED,
 * bowl de sobreponer y grifo alto en oro cepillado), con sus cotas.
 * Activo: la red se arma pieza por pieza (entran deslizándose, 45 ms entre una y otra), sale la manguera, giran las
 * manijas, el agua recorre la red (clase global `agua`) y el manómetro sube a 60 PSI al pasar; luego corre por la
 * manguera (`vivo`: corriente en la red y la gota del tubo bajo la etiqueta), se acciona el monomando y sale el chorro
 * (`grifo`) y el bowl se llena. Al salir todo se vacía (320 ms) y la red se desarma (240 ms). Tiempos y colores del
 * prototipo.
 * Diferencias con el prototipo: la geometría de la red se calcula aquí una vez y se dibuja en el servidor (el
 * prototipo la armaba con JS en el navegador), solo el nombre en la etiqueta (sin "Todo el flujo en", kicker ni
 * subtítulo) y, en reposo, el grifo gotea de vez en cuando.
 */

// ---------- geometría de la red (la misma cuenta que el prototipo) ----------
type Punto = [number, number];
const H = 11, // medio diámetro
  R = 24, // radio del codo
  RING = 17; // medio anillo
const PTS: Punto[] = [
  [18, 196],
  [150, 196],
  [150, 104],
  [360, 104],
  [360, 180],
  [526, 180],
];
const VALV: Punto[] = [
  [84, 196],
  [450, 180],
];
const TEE_X = 250; // manómetro sobre el tramo superior

type Pieza =
  | { tipo: "tubo"; d: string[] }
  | { tipo: "valvula"; p: Punto }
  | { tipo: "adaptador"; p: Punto }
  | { tipo: "vastago" };

const f = (n: number) => +n.toFixed(2);
const sub = (a: Punto, b: Punto): Punto => [a[0] - b[0], a[1] - b[1]];
const add = (a: Punto, b: Punto): Punto => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Punto, k: number): Punto => [a[0] * k, a[1] * k];
const unit = (v: Punto): Punto => {
  const l = Math.hypot(v[0], v[1]);
  return [v[0] / l, v[1] / l];
};
const nrm = (v: Punto): Punto => [-v[1], v[0]];
const P = (p: Punto) => `${f(p[0])} ${f(p[1])}`;

function armarRed() {
  const piezas: Pieza[] = [];
  const ring = (p: Punto, dir: Punto) => {
    const n = nrm(dir);
    return `M${P(add(p, mul(n, RING)))}L${P(add(p, mul(n, -RING)))}`;
  };
  /** Tramo recto, partido en las válvulas. */
  function recto(a: Punto, b: Punto, dir: Punto, cortes: Punto[]) {
    const n = nrm(dir);
    const paradas = [a, ...cortes.flatMap((c) => [add(c, mul(dir, -16)), add(c, mul(dir, 16))]), b];
    for (let i = 0; i < paradas.length; i += 2) {
      const s0 = paradas[i],
        s1 = paradas[i + 1];
      piezas.push({
        tipo: "tubo",
        d: [`M${P(add(s0, mul(n, H)))}L${P(add(s1, mul(n, H)))}`, `M${P(add(s0, mul(n, -H)))}L${P(add(s1, mul(n, -H)))}`, ring(s1, dir)],
      });
      if (i / 2 < cortes.length) piezas.push({ tipo: "valvula", p: cortes[i / 2] });
    }
  }
  let inicio = PTS[0];
  let centro = `M${P(inicio)}`;
  piezas.push({ tipo: "tubo", d: [ring(inicio, [1, 0])] });
  for (let i = 1; i < PTS.length; i++) {
    const prev = PTS[i - 1],
      cur = PTS[i],
      next = PTS[i + 1];
    const a = unit(sub(cur, prev));
    const fin = next ? add(cur, mul(a, -R)) : cur;
    const cortes = VALV.filter(
      (v) => a[1] === 0 && v[1] === cur[1] && v[0] > Math.min(inicio[0], fin[0]) && v[0] < Math.max(inicio[0], fin[0]),
    );
    recto(inicio, fin, a, cortes);
    centro += `L${P(fin)}`;
    if (next) {
      const b = unit(sub(next, cur)),
        T2 = add(cur, mul(b, R)),
        cr = a[0] * b[1] - a[1] * b[0],
        sw = cr > 0 ? 1 : 0;
      const na = nrm(a),
        nb = nrm(b);
      const arco = (s: number) => {
        const p0 = add(fin, mul(na, s * H)),
          p1 = add(T2, mul(nb, s * H)),
          r = R + (cr > 0 ? -s * H : s * H);
        return `M${P(p0)}A${f(r)} ${f(r)} 0 0 ${sw} ${P(p1)}`;
      };
      piezas.push({ tipo: "tubo", d: [arco(1), arco(-1), ring(T2, b)] });
      centro += `A${R} ${R} 0 0 ${sw} ${P(T2)}`;
      inicio = T2;
    }
  }
  piezas.push({ tipo: "adaptador", p: PTS[PTS.length - 1] });
  // El vástago del manómetro entra justo después del tramo superior (el que empieza en x=174).
  const idx = piezas.findIndex((p) => p.tipo === "tubo" && p.d[0].startsWith("M174"));
  piezas.splice(idx + 1, 0, { tipo: "vastago" });
  return { piezas, centro };
}
const { piezas: PIEZAS, centro: CENTRO } = armarRed();
const VASTAGO = `M${TEE_X - 4} ${104 - H}V78M${TEE_X + 4} ${104 - H}V78`;

/** Marcas del manómetro. */
const MARCAS = Array.from({ length: 7 }, (_, i) => {
  const a = ((-120 + i * 25) * Math.PI) / 180;
  return `M${f(Math.sin(a) * 13)} ${f(-Math.cos(a) * 13)}L${f(Math.sin(a) * 16)} ${f(-Math.cos(a) * 16)}`;
}).join("");

const MANGUERA = "M534 180C566 180 570 204 612 204H690Q712 204 712 182V162";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lin = (t: number) => t;
const out = (t: number) => 1 - Math.pow(1 - t, 3);

type Estado = { water: number; flex: number; waterF: number; open: number; psi: number; mando: number; nivel: number };

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(p: string) => raiz.querySelector<T>(`[data-p="${p}"]`)!;
  const qa = <T extends Element>(p: string) => [...raiz.querySelectorAll<T>(`[data-p="${p}"]`)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const piezas = [...raiz.querySelectorAll<SVGGElement>("[data-pieza]")].map((g) => ({
    g,
    k: 0,
    mano: g.dataset.pieza === "vastago",
  }));
  const manijas = qa<SVGGElement>("manija").map((h) => ({ h, x: Number(h.dataset.x), y: Number(h.dataset.y) }));
  const mano = q<SVGGElement>("mano"),
    flex = qa<SVGPathElement>("flex"),
    agua = qa<SVGPathElement>("agua"),
    waterF = q<SVGPathElement>("waterF"),
    aguja = q<SVGGElement>("aguja"),
    pres = q<SVGTextElement>("pres"),
    mando = q<SVGGElement>("mando"),
    nivel = q<SVGRectElement>("nivel");

  // Punto de la red donde está el manómetro (fracción del recorrido del agua).
  const W = agua[0],
    TOT = W.getTotalLength();
  let teeFrac = 0;
  for (let l = 0; l < TOT; l += 2) {
    const p = W.getPointAtLength(l);
    if (Math.abs(p.y - 104) < 1 && p.x >= TEE_X) {
      teeFrac = l / TOT;
      break;
    }
  }

  const S: Estado = { water: 0, flex: 0, waterF: 0, open: 0, psi: 0, mando: 0, nivel: 0 };
  const ponerPieza = (p: (typeof piezas)[number], k: number) => {
    p.k = k;
    p.g.style.opacity = String(k);
    p.g.setAttribute("transform", `translate(${f(90 * (1 - k))} 0)`);
    if (p.mano) mano.style.opacity = String(k);
  };
  function draw() {
    flex.forEach((e) => e.setAttribute("stroke-dashoffset", String(1 - S.flex)));
    agua.forEach((e) => e.setAttribute("stroke-dashoffset", String(1 - S.water)));
    waterF.setAttribute("stroke-dashoffset", String(1 - S.waterF));
    manijas.forEach((v, i) => {
      const k = Math.min(1, Math.max(0, S.open * 2 - i));
      v.h.setAttribute("transform", `translate(${v.x} ${v.y}) scale(${f(0.18 + 0.82 * k)} 1) translate(${-v.x} ${-v.y})`);
    });
    aguja.setAttribute("transform", `rotate(${f(-120 + S.psi * 2.5)})`);
    pres.textContent = `PRESIÓN ${Math.round(S.psi)} PSI`;
    mando.setAttribute("transform", `rotate(${f(S.mando)} 718 112)`);
    nivel.setAttribute("y", String(f(152 - S.nivel)));
  }

  // ---------- tiempo: cada encender/apagar sube `gen` y corta lo anterior ----------
  let gen = 0,
    destruido = false;
  const rafs = new Set<number>();
  const timers = new Set<number>();
  const tween = (d: number, fn: (p: number) => void, e: (t: number) => number = ease) => {
    const g = gen;
    const dur = reduce ? 10 : d;
    return new Promise<boolean>((r) => {
      const s = performance.now();
      const k = (n: number) => {
        if (g !== gen || destruido) return r(false);
        const t = Math.min(1, (n - s) / dur);
        fn(e(t));
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
  const wait = (ms: number) => {
    const g = gen;
    return new Promise<boolean>((r) => {
      const id = window.setTimeout(
        () => {
          timers.delete(id);
          r(g === gen && !destruido);
        },
        reduce ? 10 : ms,
      );
      timers.add(id);
    });
  };

  async function activar() {
    ++gen;
    raiz.classList.add("on");
    // 1. la red se arma pieza por pieza: cada una entra deslizándose
    const jobs = piezas.map((p, i) => wait(i * 45).then((ok) => ok && tween(260, (k) => ponerPieza(p, k), out)));
    if (!(await Promise.all(jobs)).every(Boolean)) return;
    if (!(await tween(240, (p) => ((S.flex = p), draw())))) return;
    // 2. se abren las dos válvulas: la manija gira
    if (!(await tween(380, (p) => ((S.open = p), draw())))) return;
    raiz.classList.add("agua");
    // 3. el agua recorre la red; el manómetro sube al pasar
    let psiOn = false;
    const recorrido = await tween(
      700,
      (p) => {
        S.water = p;
        if (!psiOn && p >= teeFrac) {
          psiOn = true;
          void tween(500, (k) => ((S.psi = 60 * k), draw()), out);
        }
        draw();
      },
      lin,
    );
    if (!recorrido) return;
    if (!(await tween(200, (p) => ((S.waterF = p), draw()), lin))) return;
    raiz.classList.add("vivo");
    // 4. se acciona el monomando y sale el chorro
    if (!(await tween(220, (p) => ((S.mando = -26 * p), draw())))) return;
    raiz.classList.add("grifo");
    await tween(1300, (p) => ((S.nivel = 16 * p), draw()), (t) => 1 - Math.pow(1 - t, 2));
  }

  async function reposo() {
    const g = ++gen;
    // `on` se queda hasta que la red se desarma (BannerPlano ya la quitó; el prototipo la quita al final).
    raiz.classList.add("on");
    raiz.classList.remove("grifo", "vivo", "agua");
    const s = { ...S };
    const claves = ["mando", "open", "psi", "nivel", "water", "waterF", "flex"] as const;
    if (!(await tween(320, (p) => (claves.forEach((c) => (S[c] = s[c] * (1 - p))), draw())))) return;
    const k0 = piezas.map((p) => p.k);
    if (!(await tween(240, (k) => piezas.forEach((p, i) => ponerPieza(p, Math.min(k0[i], 1 - k)))))) return;
    if (g === gen) raiz.classList.remove("on");
  }

  draw();

  return {
    encender: () => void activar(),
    apagar: () => void reposo(),
    destruir() {
      destruido = true;
      gen++;
      rafs.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      raiz.classList.remove("grifo", "vivo", "agua");
    },
  };
}

export default function BannerPlomeria({ nombre }: PropsBannerPropio) {
  const id = useId().replace(/:/g, "");
  const aguaG = `aguaG-${id}`,
    wblur = `wblur-${id}`,
    clipBowl = `bowl-${id}`;
  const s = styles;
  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#4fc3ff"
      crearMotor={crearMotor}
      decoracion="tubo"
      variables={
        {
          // El brillo azul sale con el agua (clase `agua`), no al activarse: lo pone .brilloAgua; el de BannerPlano, apagado.
          "--brillo-on": "0",
          "--etiqueta-pad": "2px 26px 0",
          "--etiqueta-sombra": "0 10px 24px -10px rgba(227, 38, 47, 0.6)",
        } as CSSProperties
      }
    >
      <div className={s.brilloAgua} aria-hidden />
      <svg viewBox="0 0 780 260" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={s.svg}>
        <defs>
          <linearGradient id={aguaG} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7fd6ff" />
            <stop offset="1" stopColor="#2ea6e6" />
          </linearGradient>
          <filter id={wblur} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <clipPath id={clipBowl}>
            <path d="M599 121Q601 149 640 149Q679 149 681 121Z" />
          </clipPath>
        </defs>

        <text data-p="pres" x="760" y="30" textAnchor="end">
          PRESIÓN 0 PSI
        </text>

        {/* muro / acometida */}
        <path className={s.cota} d="M18 150V240M18 156l-8 8M18 172l-8 8M18 188l-8 8M18 204l-8 8M18 220l-8 8M18 236l-8 8" />
        <text className={s.bp} x="24" y="230" style={{ fontSize: 7 }}>
          ACOMETIDA
        </text>

        {/* ===== red de tubería: plano punteado en reposo ===== */}
        <g className={s.gh}>
          {PIEZAS.map((p, i) =>
            p.tipo === "tubo" ? (
              p.d.map((d, j) => <path key={`${i}-${j}`} d={d} />)
            ) : p.tipo === "valvula" ? (
              <rect key={i} x={p.p[0] - 14} y={p.p[1] - 20} width="28" height="40" rx="7" />
            ) : p.tipo === "vastago" ? (
              <path key={i} d={VASTAGO} />
            ) : null,
          )}
        </g>
        <g>
          <path
            data-p="agua"
            d={CENTRO}
            fill="none"
            stroke="#4fb3ff"
            strokeWidth="20"
            opacity=".35"
            filter={`url(#${wblur})`}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
          <path data-p="agua" d={CENTRO} fill="none" stroke="#4fb3ff" strokeWidth="16" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
          <path className={s.flow} d={CENTRO} />
        </g>
        {/* ===== piezas reales: invisibles y corridas a la derecha hasta que el motor las arma ===== */}
        <g>
          {PIEZAS.map((p, i) => (
            <g
              key={i}
              data-pieza={p.tipo}
              className={s.pzTubo}
              transform="translate(90 0)"
              style={{ opacity: 0 }}
            >
              {p.tipo === "tubo" && p.d.map((d, j) => <path key={j} d={d} />)}
              {p.tipo === "valvula" && (
                <>
                  <rect x={p.p[0] - 14} y={p.p[1] - 20} width="28" height="40" rx="7" fill="#0e2847" stroke="#c3ccd8" strokeWidth="3.2" />
                  <path d={`M${p.p[0]} ${p.p[1] - 20}V${p.p[1] - 29}`} />
                  <g data-p="manija" data-x={p.p[0]} data-y={p.p[1] - 32}>
                    <path d={`M${p.p[0]} ${p.p[1] - 32}H${p.p[0] + 22}`} style={{ stroke: "#e3262f", strokeWidth: 4 }} />
                  </g>
                </>
              )}
              {p.tipo === "adaptador" && (
                <rect x={p.p[0] - 2} y={p.p[1] - 14} width="10" height="28" rx="3" fill="#cfd8e3" stroke="#c3ccd8" strokeWidth="2" />
              )}
              {p.tipo === "vastago" && <path d={`${VASTAGO}M${TEE_X - 9} 78H${TEE_X + 9}`} />}
            </g>
          ))}
        </g>

        {/* manguera flexible hasta el grifo */}
        <path className={s.plan} d={MANGUERA} />
        <path data-p="flex" className={s.rev} d={MANGUERA} stroke="#cfd8e3" strokeWidth="8" pathLength={1} strokeDasharray="1" strokeDashoffset="1" style={{ strokeLinecap: "round" }} />
        <path data-p="flex" className={s.rev} d={MANGUERA} stroke="#0a1f38" strokeWidth="4" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        <path data-p="waterF" className={s.rev} d={MANGUERA} stroke="#4fb3ff" strokeWidth="4" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        <path className={`${s.flow} ${s.flowF}`} d={MANGUERA} />
        <text className={s.bp} x="58" y="234" style={{ fontSize: 7 }}>
          VÁLVULA DE BOLA ½&quot;
        </text>

        {/* manómetro */}
        <g data-p="mano" transform="translate(250 56)" style={{ opacity: 0 }}>
          <circle r="20" className={`${s.fill} ${s.fCromo} ${s.ln}`} />
          <circle r="16" fill="#0a1f38" stroke="rgba(190,215,245,.55)" />
          <path className={s.cota} d={MARCAS} />
          <path d="M-9 9A13 13 0 0 1 -12 -4" stroke="#4fc3ff" strokeWidth="2" fill="none" opacity=".8" />
          <path d="M10 -8A13 13 0 0 1 11 7" stroke="#e3262f" strokeWidth="2" fill="none" opacity=".8" />
          <g data-p="aguja" transform="rotate(-120)">
            <path d="M0 0L0 -13" stroke="#e3262f" strokeWidth="1.8" strokeLinecap="round" />
          </g>
          <circle r="2.2" fill="#c3ccd8" />
          <text x="0" y="11" textAnchor="middle" style={{ fontSize: 5 }}>
            PSI
          </text>
        </g>
        <text className={s.bp} x="276" y="52" style={{ fontSize: 7 }}>
          MANÓMETRO
        </text>

        {/* cotas */}
        <g className={s.bp}>
          <text x="186" y="86" style={{ fontSize: 7 }}>
            TUBO PVC ½&quot; · AGUA FRÍA
          </text>
          <path className={s.cota} d="M150 246H526M150 241v10M526 241v10" />
          <path d="M154 246l-5 -3v6z" fill="#e3262f" />
          <text x="318" y="243">
            6.00 m
          </text>
          <text x="380" y="146" style={{ fontSize: 7 }}>
            NIPLE ½&quot;×4&quot;
          </text>
        </g>

        {/* ===== lavamanos de lujo: tope de mármol flotante + bowl de sobreponer + grifo alto oro cepillado ===== */}
        <g>
          <rect className={`${s.fill} ${s.fMarmol} ${s.ln}`} x="560" y="150" width="212" height="12" rx="2" />
          <path className={s.vetas} d="M572 154Q600 160 626 153T690 157T760 153M590 160Q622 156 650 160M700 152Q720 158 744 155" />
          <path className={s.cota} d="M566 162H766" style={{ opacity: 0.6 }} />
          <rect className={`${s.fill} ${s.fMadera} ${s.ln}`} x="576" y="164" width="128" height="30" rx="2" style={{ strokeWidth: 1.5 }} />
          <path className={s.listones} d="M592 166V192M608 166V192M624 166V192M640 166V192M656 166V192M672 166V192M688 166V192" />
          <path d="M628 178H652" stroke="#c9a45c" strokeWidth="2.5" strokeLinecap="round" />
          <rect className={s.led} x="566" y="162" width="200" height="3" rx="1.5" />
          <path className={`${s.fill} ${s.fLoza} ${s.ln}`} d="M598 120Q600 150 640 150Q680 150 682 120Z" />
          <g clipPath={`url(#${clipBowl})`}>
            <rect data-p="nivel" x="590" y="152" width="100" height="40" fill={`url(#${aguaG})`} opacity=".85" />
          </g>
          <ellipse className={`${s.fill} ${s.fLoza} ${s.ln}`} cx="640" cy="120" rx="42" ry="6" style={{ fillOpacity: 0 }} />
          <path className={s.brillo} d="M606 126Q610 142 626 146" />
          <g className={s.ondas}>
            <ellipse cx="652" cy="138" rx="18" ry="3" />
            <ellipse cx="652" cy="138" rx="18" ry="3" />
            <ellipse cx="652" cy="138" rx="18" ry="3" />
          </g>
          <ellipse cx="712" cy="150" rx="13" ry="3" className={`${s.fill} ${s.fOro} ${s.ln}`} style={{ strokeWidth: 1.5 }} />
          <rect className={`${s.fill} ${s.fOro} ${s.ln}`} x="706" y="72" width="12" height="78" rx="5" />
          <path className={s.cano} d="M712 74C712 44 652 44 652 70V80" />
          <path className={s.canoIn} d="M712 74C712 44 652 44 652 70V80" />
          <rect className={`${s.fill} ${s.fOro}`} x="647" y="78" width="10" height="5" rx="1.5" stroke="#c3ccd8" strokeWidth="1.2" />
          <g data-p="mando">
            <path d="M718 112L738 102" stroke="#a8843f" strokeWidth="4" strokeLinecap="round" />
            <circle cx="739" cy="101.5" r="3" fill="#e3262f" />
          </g>
          <g className={s.chorro}>
            <rect x="649" y="83" width="6" height="55" rx="3" fill={`url(#${aguaG})`} />
          </g>
          {/* reposo: una gota cae del grifo de vez en cuando */}
          <circle className={s.gota} cx="652" cy="86" r="2" fill="#4fc3ff" />
        </g>
        <g className={s.bp}>
          <text x="606" y="42" style={{ fontSize: 7 }}>
            GRIFO ALTO · ORO CEPILLADO
          </text>
          <text x="574" y="106" style={{ fontSize: 7 }}>
            BOWL DE SOBREPONER
          </text>
          <text x="606" y="216" style={{ fontSize: 7 }}>
            TOPE DE MÁRMOL FLOTANTE
          </text>
          <text x="440" y="222" style={{ fontSize: 7 }}>
            MANGUERA FLEXIBLE 40 cm
          </text>
        </g>
      </svg>
    </BannerPlano>
  );
}
