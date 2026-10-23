"use client";

import { useId } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerPinturas.module.css";

/**
 * Banner de la categoría Pinturas, estilo "plano técnico" (familia de las tarjetas de categoría animadas). Diseño en
 * docs del pedido "banner-pinturas-v1"; el prototipo HTML no estaba en el proyecto, así que la geometría sigue las
 * medidas escritas del pedido.
 * Reposo: muro rayado, ficha en contorno, galones vacíos. Activo (mouse encima; en táctil, al tocar): el rodillo barre
 * el muro de izquierda a derecha pintándolo del color de turno, y los colores pasan en ciclo (COLORES).
 * La estructura (contenedor, texto, etiqueta con gotas, reposo/activo) es BannerPlano; aquí solo el dibujo y su motor.
 */

const COLORES = [
  { nombre: "Terracota", pantone: "1675 C", hex: "#A9431E" },
  { nombre: "Petróleo", pantone: "3165 C", hex: "#00505C" },
  { nombre: "Azul profundo", pantone: "2728 C", hex: "#0047BB" },
  { nombre: "Mostaza", pantone: "1255 C", hex: "#AD841F" },
] as const;
const color = (n: number) => COLORES[n % COLORES.length];

// Recorrido del rodillo (eje del cilindro) sobre el muro: x40 → x510.
const X0 = 40;
const X1 = 510;
// Tiempos del ciclo (ms).
const VUELTA = 450; // vuelve al inicio antes de cada barrido
const PAUSA = 250;
const BARRIDO = 1500;
const ESPERA = 1100; // con el color fijo, antes del siguiente
const VUELTA_SALIR = 600;
const FUNDIDO = 600; // lo que tarda en desvanecerse la pintura al salir (opacity de .pintura)
const CADA_REDUCIDO = 2200; // con "reducir movimiento": solo cambia el color

const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function crearMotor(raiz: HTMLElement): Motor {
  const pieza = (n: string) => raiz.querySelector<SVGElement>(`[data-p="${n}"]`)!;
  const rodillo = pieza("rodillo"),
    capa = pieza("capa"),
    base = pieza("base"),
    siguiente = pieza("siguiente"),
    codigo = pieza("codigo"),
    nombre = pieza("nombre"),
    hex = pieza("hex");
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let x = X0,
    i = 0,
    activo = false,
    corriendo = false,
    destruido = false,
    raf = 0,
    timer = 0,
    intervalo = 0;
  let despertar: (() => void) | null = null;

  const ponerX = (v: number) => {
    x = v;
    rodillo.setAttribute("transform", `translate(${v.toFixed(2)} 0)`);
  };
  const ponerCapa = (ancho: number) => capa.setAttribute("width", Math.max(0, ancho).toFixed(2));
  const pintarBase = (c: string) => base.setAttribute("fill", c);

  /** El color de turno: --c (rodillo, capa, ficha, gotas, brillo), los textos de la ficha y el galón chico (el siguiente). */
  function elegir(n: number) {
    const c = color(n);
    raiz.style.setProperty("--c", c.hex);
    codigo.textContent = `PANTONE ${c.pantone}`;
    nombre.textContent = c.nombre;
    hex.textContent = c.hex;
    siguiente.setAttribute("fill", color(n + 1).hex);
  }

  /** Espera que se corta si el banner se prende o se apaga. */
  function esperar(ms: number) {
    return new Promise<void>((listo) => {
      const fin = () => {
        clearTimeout(timer);
        despertar = null;
        listo();
      };
      timer = window.setTimeout(fin, ms);
      despertar = fin;
    });
  }

  /** Lleva el rodillo a `hasta` en `dur` ms. `parar` lo corta a medio camino (el barrido no lo lleva: siempre termina). */
  function mover(hasta: number, dur: number, parar?: () => boolean, alPaso?: (v: number) => void) {
    return new Promise<void>((listo) => {
      const desde = x,
        t0 = performance.now();
      const paso = (t: number) => {
        if (destruido || parar?.()) return listo();
        const k = Math.min(1, (t - t0) / dur);
        const v = desde + (hasta - desde) * easeInOutCubic(k);
        ponerX(v);
        alPaso?.(v);
        if (k < 1) raf = requestAnimationFrame(paso);
        else listo();
      };
      raf = requestAnimationFrame(paso);
    });
  }

  function reiniciar() {
    pintarBase("transparent");
    ponerCapa(0);
    i = 0;
    elegir(0);
  }

  async function correr() {
    if (corriendo) return;
    corriendo = true;
    while (!destruido) {
      if (activo) {
        elegir(i);
        if (x !== X0) {
          await mover(X0, VUELTA, () => !activo);
          if (!activo) continue;
        }
        await esperar(PAUSA);
        if (!activo || destruido) continue;
        await mover(X1, BARRIDO, undefined, (v) => ponerCapa(v - X0));
        if (destruido) break;
        // El color queda de base y la capa vuelve a cero para el siguiente.
        pintarBase(color(i).hex);
        ponerCapa(0);
        i++;
        if (!activo) continue;
        await esperar(ESPERA);
        continue;
      }
      // Salir: el rodillo vuelve (se corta si se vuelve a prender), la pintura se desvanece y todo se reinicia.
      if (x !== X0) {
        await mover(X0, VUELTA_SALIR, () => activo);
        if (activo) continue;
      }
      await esperar(FUNDIDO);
      if (activo) continue;
      if (!destruido) reiniciar();
      break;
    }
    corriendo = false;
  }

  // ---------- con "reducir movimiento": sin barrido, solo cambia el color ----------
  function encenderReducido() {
    clearTimeout(timer);
    base.style.transition = "opacity 0.6s ease, fill 0.6s ease";
    elegir(i);
    pintarBase(color(i).hex);
    intervalo = window.setInterval(() => {
      i++;
      elegir(i);
      pintarBase(color(i).hex);
    }, CADA_REDUCIDO);
  }
  function apagarReducido() {
    clearInterval(intervalo);
    timer = window.setTimeout(() => {
      base.style.transition = "";
      reiniciar();
    }, FUNDIDO);
  }

  return {
    encender() {
      activo = true;
      if (reducido) return encenderReducido();
      despertar?.();
      void correr();
    },
    apagar() {
      activo = false;
      if (reducido) return apagarReducido();
      despertar?.();
    },
    destruir() {
      destruido = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      clearInterval(intervalo);
    },
  };
}

/** Rayado del piso: trazos cortos cada 14 unidades. */
const RAYADO_PISO = Array.from({ length: 53 }, (_, k) => `M${30 + k * 14} 240 l-8 10`).join(" ");

export default function BannerPinturas({ nombre, texto, kicker }: PropsBannerPropio) {
  const id = useId().replace(/:/g, "");
  const rayado = `rayado-${id}`;
  const c0 = COLORES[0];

  return (
    <BannerPlano
      nombre={nombre}
      kicker={kicker}
      texto={texto}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial={c0.hex}
      crearMotor={crearMotor}
    >
      <svg viewBox="0 0 780 260" aria-hidden focusable="false" className={styles.svg}>
        <defs>
          <pattern id={rayado} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="9" className={styles.trama} />
          </pattern>
        </defs>

        {/* ---------- muro ---------- */}
        <rect x="40" y="34" width="470" height="192" fill={`url(#${rayado})`} className={styles.rayado} />
        <rect data-p="base" x="40" y="34" width="470" height="192" fill="transparent" className={`${styles.pintura} ${styles.base}`} />
        <rect data-p="capa" x="40" y="34" width="0" height="192" className={`${styles.pintura} ${styles.conColor}`} />
        <rect x="40" y="34" width="470" height="192" className={styles.muroBorde} />
        <path d="M34 48V28h14M496 28h20v20M34 212v20h14M516 212v20h-20" className={styles.linea} />
        <text x="66" y="54" className={styles.etiquetaMuro}>
          MURO A · ACABADO MATE
        </text>

        {/* Cotas del muro: 4.70 m arriba (flechas rojas) y 2.40 m a la izquierda. */}
        <g className={styles.cota}>
          <path d="M40 16H248M302 16H510M40 10v12M510 10v12" />
          <path d="M40 16l9-3.5v7zM510 16l-9-3.5v7z" className={styles.flecha} />
          <text x="275" y="19.5" textAnchor="middle">
            4.70 m
          </text>
          <path d="M16 34V110M16 150V226M10 34h12M10 226h12" />
          <text x="20" y="130" textAnchor="middle" transform="rotate(-90 20 130)" dy="-1">
            2.40 m
          </text>
        </g>

        {/* ---------- piso ---------- */}
        <path d="M20 240H770" className={styles.linea} />
        <path d={RAYADO_PISO} className={styles.pisoRayado} />

        {/* ---------- ficha de color ---------- */}
        <g transform="translate(540 22) rotate(-5)">
          <rect width="104" height="96" rx="3" className={styles.ficha} />
          <rect x="8" y="8" width="88" height="44" rx="2" className={styles.chipBorde} />
          <rect x="8" y="8" width="88" height="44" rx="2" className={`${styles.pintura} ${styles.conColor}`} />
          <text data-p="codigo" x="8" y="66" className={`${styles.fichaTexto} ${styles.fichaCodigo}`}>
            PANTONE {c0.pantone}
          </text>
          <text data-p="nombre" x="8" y="79" className={`${styles.fichaTexto} ${styles.fichaNombre}`}>
            {c0.nombre}
          </text>
          <text data-p="hex" x="8" y="90" className={styles.fichaTexto}>
            {c0.hex}
          </text>
        </g>

        {/* ---------- brocha ---------- */}
        <g transform="translate(736 18) rotate(30)">
          <rect x="-5" y="0" width="10" height="40" rx="4" className={styles.mango} />
          <rect x="-9" y="40" width="18" height="16" rx="1.5" className={styles.linea} />
          <path d="M-9 46h18M-9 51h18" className={styles.lineaFina} />
          <path d="M-10 56h20l1 30h-22z" className={styles.cerdas} />
          <path d="M-10.5 74h21l.5 12h-22z" className={`${styles.pintura} ${styles.conColor}`} />
        </g>

        {/* ---------- galón grande (con su cota) y tapa apoyada ---------- */}
        <g className={styles.cota}>
          <path d="M640 120H730M640 114v12M730 114v12" />
          <text x="685" y="113" textAnchor="middle">
            Ø 18 cm
          </text>
        </g>
        <path d="M644 150Q685 118 726 150" className={styles.linea} />
        <rect x="642" y="168" width="86" height="70" className={`${styles.pintura} ${styles.conColor}`} />
        <path
          d="M650 152v13a3 3 0 0 0 6 0v-13zM674 152v22a3 3 0 0 0 6 0v-22zM708 152v9a3 3 0 0 0 6 0v-9z"
          className={`${styles.pintura} ${styles.conColor}`}
        />
        <rect x="640" y="150" width="90" height="90" rx="4" className={styles.linea} />
        <rect x="636" y="145" width="98" height="7" rx="2" className={styles.linea} />
        <path d="M640 160H730M640 230H730" className={styles.lineaFina} />
        <text x="685" y="206" textAnchor="middle" className={styles.galonTexto}>
          GALÓN 3.78 L
        </text>
        <g transform="translate(628 240) rotate(-14)">
          <rect x="-5" y="-48" width="10" height="48" rx="3" className={styles.linea} />
          <path d="M0 -44V-4" className={styles.lineaFina} />
        </g>

        {/* ---------- galón chico: el color que viene ---------- */}
        <rect data-p="siguiente" x="744" y="204" width="30" height="34" fill={COLORES[1].hex} className={styles.pintura} />
        <rect x="742" y="196" width="34" height="44" rx="3" className={styles.linea} />
        <rect x="739" y="192" width="40" height="5" rx="2" className={styles.linea} />

        {/* ---------- rodillo (se mueve con translate; su eje en x=0) ---------- */}
        <g data-p="rodillo" transform={`translate(${X0} 0)`}>
          <rect x="-14" y="28" width="28" height="204" rx="7" className={`${styles.pintura} ${styles.conColor}`} />
          <rect x="-14" y="28" width="28" height="204" rx="7" className={styles.linea} />
          <path d="M-6 36V224M6 36V224" className={styles.lineaFina} />
          <path d="M0 28V20H24V130L40 150" className={styles.linea} />
          <path d="M0 232V238H24V130" className={styles.linea} />
          <rect x="34" y="146" width="12" height="52" rx="5" transform="rotate(-34 40 150)" className={styles.mango} />
        </g>
      </svg>
    </BannerPlano>
  );
}
