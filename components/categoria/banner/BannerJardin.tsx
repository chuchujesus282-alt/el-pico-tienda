"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Banner de la categoría Hogar y jardín (va en `EncabezadoPagina` con la prop `escena`). Misma familia que los demás:
 * azul marino con el título a la izquierda y, cortado en diagonal, un césped vivo dibujado en canvas: miles de hojas de
 * grama (cada una con su largo, grosor y tono) que se mecen con ráfagas de viento, con luz de tarde que entra de arriba.
 * Una pala real está clavada entre la grama (las hojas de adelante tapan su base) y una manguera fuera de cuadro riega:
 * gotas con gravedad que caen en arco y salpican al tocar la grama.
 * - Clic / Enter / toque: cierra o abre el agua.
 * - Mouse encima o foco con teclado: sopla más viento y el chorro sale con más fuerza.
 * - "Reducir movimiento": un cuadro quieto (sin viento ni agua corriendo). Fuera de pantalla no dibuja.
 * Colores desde los tokens `grama*` y `agua` de globals.css. Pala en public/banners/jardin/.
 */

type Hoja = { x: number; y: number; alto: number; ancho: number; color: string; fase: number; inclina: number };
type Gota = { x: number; y: number; vx: number; vy: number; suelo: number; vida: number; chispa: boolean };

const PALA = { src: "/banners/jardin/pala.webp", ancho: 230, alto: 547 };

/** Lee un token de color (#rrggbb) como [r, g, b]. */
function rgb(nombre: string): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  const n = parseInt(v.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mezcla = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const css = (c: number[], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** Número pseudoaleatorio fijo por semilla (el césped se ve igual en cada carga). */
function semilla(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function BannerJardin() {
  const raiz = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const [abierta, setAbierta] = useState(true);
  const [tocado, setTocado] = useState(false);
  const puntero = useRef("");
  const estado = useRef({ abierta: true, activo: 0 });

  useEffect(() => {
    estado.current.abierta = abierta;
  }, [abierta]);

  useEffect(() => {
    const canvas = lienzo.current;
    const cont = raiz.current;
    if (!canvas || !cont) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const grama = rgb("--color-grama");
    const claro = rgb("--color-grama-claro");
    const oscuro = rgb("--color-grama-oscuro");
    const agua = rgb("--color-agua");
    const sol = rgb("--color-amarillo-obra");
    const noche = rgb("--color-pico-azul-oscuro");

    const pala = new Image();
    pala.src = PALA.src;

    let W = 0;
    let H = 0;
    let hojas: Hoja[] = [];
    let setos: { x: number; y: number; r: number; c: number[] }[] = [];
    let palaBase = 0; // índice de la primera hoja que va delante de la pala
    let palaCaja = { x: 0, y: 0, w: 0, h: 0 };
    const gotas: Gota[] = [];

    const armar = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Hojas de atrás (horizonte) hacia adelante: más grandes, más oscuras y más saturadas abajo.
      const azar = semilla(7);
      const cuantas = Math.min(2600, Math.round((W * H) / 45));
      const horizonte = H * 0.3;
      hojas = [];
      for (let i = 0; i < cuantas; i++) {
        const p = Math.pow(azar(), 0.8); // 0 = fondo, 1 = frente
        const y = horizonte + p * (H - horizonte) + 6;
        const escala = 0.35 + p * 1.15;
        const tono = mezcla(mezcla(grama, claro, azar() * 0.7), oscuro, (1 - p) * 0.25 + azar() * 0.35);
        hojas.push({
          x: azar() * (W + 40) - 20,
          y,
          alto: (14 + azar() * 22) * escala * (H / 230),
          ancho: (1.4 + azar() * 1.8) * escala,
          color: css(tono),
          fase: azar() * Math.PI * 2,
          inclina: (azar() - 0.5) * 0.5,
        });
      }
      hojas.sort((a, b) => a.y - b.y);
      setos = [];
      for (let x = -20; x < W + 40; x += 26 + azar() * 22) {
        const r = H * (0.12 + azar() * 0.1);
        setos.push({ x, y: H * (0.27 + azar() * 0.06), r, c: mezcla(oscuro, grama, azar() * 0.45) });
      }

      // Pala: clavada a un tercio del ancho; la base de la hoja queda a ~82% del alto (la tapan las hojas de adelante).
      const ph = H * 0.78;
      const pw = (ph * PALA.ancho) / PALA.alto;
      const base = H * 0.88;
      palaCaja = { x: W * 0.3 - pw / 2, y: base - ph, w: pw, h: ph };
      palaBase = hojas.findIndex((h) => h.y > base - 4);
      if (palaBase < 0) palaBase = hojas.length;
    };

    const dibujarHoja = (h: Hoja, t: number, viento: number) => {
      // Ráfaga: una onda que recorre el césped de derecha a izquierda, más un temblor propio de cada hoja.
      const rafaga = Math.sin(t * 0.9 - h.x * 0.012) * 0.5 + 0.5;
      const doblez = (h.inclina + (rafaga * 0.55 + Math.sin(t * 2.3 + h.fase) * 0.12) * viento) * h.alto;
      const tipX = h.x - doblez;
      const tipY = h.y - h.alto * (1 - Math.min(0.35, Math.abs(doblez) / h.alto) * 0.5);
      ctx.beginPath();
      ctx.moveTo(h.x - h.ancho, h.y);
      ctx.quadraticCurveTo(h.x - h.ancho * 0.4, h.y - h.alto * 0.55, tipX, tipY);
      ctx.quadraticCurveTo(h.x + h.ancho * 0.4, h.y - h.alto * 0.55, h.x + h.ancho, h.y);
      ctx.fillStyle = h.color;
      ctx.fill();
    };

    const fondo = () => {
      // Cielo de tarde: cálido arriba a la derecha, azulado hacia el corte; se funde con el verde hacia abajo.
      const g = ctx.createLinearGradient(W * 0.8, 0, W * 0.2, H);
      g.addColorStop(0, css(mezcla(sol, [255, 255, 255], 0.45)));
      g.addColorStop(0.3, css(mezcla(claro, sol, 0.3)));
      g.addColorStop(0.55, css(mezcla(grama, oscuro, 0.2)));
      g.addColorStop(1, css(oscuro));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // Seto lejano, desenfocado (manchas suaves de verde oscuro a lo largo del horizonte).
      for (const m of setos) {
        const r = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        r.addColorStop(0, css(m.c, 0.9));
        r.addColorStop(0.6, css(m.c, 0.55));
        r.addColorStop(1, css(m.c, 0));
        ctx.fillStyle = r;
        ctx.fillRect(m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
      }
      // Bruma de luz entre el seto y el césped.
      const b = ctx.createLinearGradient(0, H * 0.22, 0, H * 0.45);
      b.addColorStop(0, css(mezcla(claro, sol, 0.4), 0));
      b.addColorStop(0.5, css(mezcla(claro, sol, 0.4), 0.25));
      b.addColorStop(1, css(mezcla(claro, sol, 0.4), 0));
      ctx.fillStyle = b;
      ctx.fillRect(0, H * 0.22, W, H * 0.23);
    };

    const luz = () => {
      // Luz de tarde que baña desde arriba a la derecha y penumbra abajo a la izquierda.
      const l = ctx.createRadialGradient(W * 0.9, -H * 0.1, 0, W * 0.9, -H * 0.1, W * 0.9);
      l.addColorStop(0, css(sol, 0.28));
      l.addColorStop(1, css(sol, 0));
      ctx.fillStyle = l;
      ctx.fillRect(0, 0, W, H);
      const p = ctx.createLinearGradient(0, H, W * 0.5, H * 0.4);
      p.addColorStop(0, css(noche, 0.45));
      p.addColorStop(1, css(noche, 0));
      ctx.fillStyle = p;
      ctx.fillRect(0, 0, W, H);
    };

    const regar = (dt: number, fuerza: number) => {
      // La boquilla está fuera de cuadro, arriba a la derecha; las gotas salen en abanico.
      if (estado.current.abierta) {
        // Un chorro: muchas gotas con poca dispersión (se lee continuo); la boquilla oscila apenas, como en la mano.
        const nuevas = Math.round((260 + fuerza * 160) * dt);
        const pulso = Math.sin(t * 0.7) * 0.06;
        for (let i = 0; i < nuevas; i++) {
          const v = (1 + (Math.random() - 0.5) * 0.08) * (1 + fuerza * 0.12);
          gotas.push({
            x: W + 6,
            y: H * 0.1 + (Math.random() - 0.5) * 3,
            vx: -(W * 0.5) * v * (1 + pulso),
            vy: -H * (0.55 + (Math.random() - 0.5) * 0.06),
            suelo: H * (0.62 + Math.random() * 0.2),
            vida: 1,
            chispa: false,
          });
        }
      }
      const g = H * 2.6;
      for (let i = gotas.length - 1; i >= 0; i--) {
        const d = gotas[i];
        d.vy += g * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.chispa) d.vida -= dt * 2.2;
        if (!d.chispa && d.y > d.suelo && d.vy > 0) {
          // Al tocar la grama: se deshace en 2–3 salpicaduras que saltan poco.
          for (let k = 0; k < 2 + (Math.random() < 0.4 ? 1 : 0); k++) {
            gotas.push({ x: d.x, y: d.y, vx: (Math.random() - 0.5) * 70, vy: -40 - Math.random() * 60, suelo: Infinity, vida: 0.6, chispa: true });
          }
          gotas.splice(i, 1);
          continue;
        }
        if (d.vida <= 0 || d.x < -20) gotas.splice(i, 1);
      }
      for (const d of gotas) {
        if (d.chispa) {
          ctx.fillStyle = css(agua, Math.max(0, d.vida) * 0.8);
          ctx.fillRect(d.x, d.y, 1.4, 1.4);
        } else {
          // Cada gota es un trazo corto en la dirección en que va (se lee como agua en movimiento).
          const largo = 0.02;
          ctx.strokeStyle = css(agua, 0.55);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.vx * largo, d.y - d.vy * largo);
          ctx.stroke();
        }
      }
    };

    let t = 0;
    let previo = performance.now();
    let cuadro = 0;
    let visible = true;

    const pintar = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - previo) / 1000);
      previo = ahora;
      t += dt;
      // El estado activo sube y baja suave (viento y chorro).
      const activo = cont.closest("header")?.matches(":hover, :has(:focus-visible)") || cont.dataset.activo ? 1 : 0;
      estado.current.activo += (activo - estado.current.activo) * Math.min(1, dt * 3);
      const fuerza = estado.current.activo;
      const viento = 0.55 + fuerza * 0.6;

      ctx.clearRect(0, 0, W, H);
      fondo();
      for (let i = 0; i < palaBase; i++) dibujarHoja(hojas[i], t, viento);
      if (pala.complete && pala.naturalWidth) {
        ctx.save();
        ctx.shadowColor = css(noche, 0.45);
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 4;
        ctx.drawImage(pala, palaCaja.x, palaCaja.y, palaCaja.w, palaCaja.h);
        ctx.restore();
      }
      for (let i = palaBase; i < hojas.length; i++) dibujarHoja(hojas[i], t, viento);
      if (!reducido) regar(dt, fuerza);
      luz();
      if (!reducido && visible) cuadro = requestAnimationFrame(pintar);
    };

    const arrancar = () => {
      cancelAnimationFrame(cuadro);
      previo = performance.now();
      cuadro = requestAnimationFrame(pintar);
    };

    armar();
    pala.onload = () => (reducido ? pintar(performance.now()) : undefined);
    arrancar();

    const ro = new ResizeObserver(() => {
      armar();
      if (reducido) pintar(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reducido) arrancar();
    });
    io.observe(cont);
    return () => {
      cancelAnimationFrame(cuadro);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={raiz} className="bp absolute inset-0 overflow-hidden" data-activo={tocado || undefined}>
      {/* Césped vivo, cortado en diagonal; el canvas va contrarrestando el sesgo de la placa (no se deforma). */}
      <div className="bp-placa absolute -inset-y-6 -right-24 left-[56%] overflow-hidden shadow-tarjeta-hover md:left-[51%] xl:left-[49%]">
        <canvas ref={lienzo} className="absolute inset-y-0 -left-16 right-0 h-full w-[calc(100%+4rem)] skew-x-12" aria-hidden />
      </div>
      {/* Borde del corte: listón de madera. */}
      <div className="bp-placa bj-liston absolute -inset-y-6 left-[calc(56%-0.55rem)] w-[1.1rem] md:left-[calc(51%-0.55rem)] xl:left-[calc(49%-0.55rem)]" />

      <button
        type="button"
        aria-label={abierta ? "Cerrar el agua" : "Abrir el agua"}
        aria-pressed={abierta}
        onPointerDown={(e) => (puntero.current = e.pointerType)}
        onClick={() => {
          if (puntero.current === "touch") setTocado(true);
          puntero.current = "";
          setAbierta((a) => !a);
        }}
        className="absolute inset-y-0 right-0 left-[55%] cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-pico-blanco md:left-[50%]"
      />

      <span className="sr-only" aria-live="polite">
        {abierta ? "" : "Agua cerrada"}
      </span>
    </div>
  );
}
