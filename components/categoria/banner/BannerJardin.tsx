"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Banner de la categoría Hogar y jardín (va en `EncabezadoPagina` con la prop `escena`). Misma familia que los demás:
 * azul marino con el título a la izquierda y, cortado en diagonal, un jardín vivo dibujado en canvas: un seto nítido al
 * fondo y miles de hojas de grama (cada una con su largo, grosor y tono) que se mecen con ráfagas de viento, con luz de
 * tarde. En la grama, un rollo de manguera cuya punta alzada riega con un chorro (gotas con gravedad que salpican) y una
 * pala real clavada en la tierra. Pala y manguera se dibujan en su profundidad: las hojas de adelante las tapan.
 * - Clic / Enter / toque: cierra o abre el agua.
 * - Mouse encima o foco con teclado: sopla más viento, el chorro sale con más fuerza y la pala sale de la tierra
 *   (sube, se inclina y suelta terrones); al soltar vuelve a clavarse.
 * - "Reducir movimiento": un cuadro quieto. Fuera de pantalla no dibuja.
 * Colores desde los tokens `grama*`, `agua`, `amarillo-obra`, `tablero-oscuro` y `pico-azul-oscuro`. Pala en
 * public/banners/jardin/.
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

/** Número pseudoaleatorio fijo por semilla (el jardín se ve igual en cada carga). */
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
    const tierra = rgb("--color-tablero-oscuro");
    const blanco = [255, 255, 255];
    const naranja = mezcla(sol, rgb("--color-pico-rojo"), 0.45);

    const pala = new Image();
    pala.src = PALA.src;

    let W = 0;
    let H = 0;
    let hojas: Hoja[] = [];
    let palaCaja = { x: 0, y: 0, w: 0, h: 0 };
    let rollo = { x: 0, y: 0, rx: 0, ry: 0, g: 0 };
    let boquilla = { x: 0, y: 0 };
    let palaAlzada = 0;
    const gotas: Gota[] = [];
    const terrones: Gota[] = [];
    const fondoCache = document.createElement("canvas");

    /** Cielo y seto: se dibujan una vez (cuando cambia el tamaño) en un canvas aparte y se copian en cada cuadro. */
    const pintarFondo = (azar: () => number, dpr: number) => {
      fondoCache.width = Math.round(W * dpr);
      fondoCache.height = Math.round(H * dpr);
      const f = fondoCache.getContext("2d");
      if (!f) return;
      f.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = f.createLinearGradient(W * 0.8, 0, W * 0.2, H);
      g.addColorStop(0, css(mezcla(sol, blanco, 0.45)));
      g.addColorStop(0.3, css(mezcla(claro, sol, 0.3)));
      g.addColorStop(0.55, css(mezcla(grama, oscuro, 0.2)));
      g.addColorStop(1, css(oscuro));
      f.fillStyle = g;
      f.fillRect(0, 0, W, H);
      // Seto nítido: hojitas (elipses giradas) con el contorno de arriba irregular; las de arriba reciben luz.
      const tope = (x: number) => H * (0.13 + 0.05 * Math.sin(x * 0.021) + 0.03 * Math.sin(x * 0.067 + 1.7));
      const paso = Math.max(3, W / 260);
      for (let x = -10; x < W + 10; x += paso) {
        const arriba = tope(x);
        for (let y = arriba; y < H * 0.42; y += paso * 1.1) {
          const prof = (y - arriba) / (H * 0.42 - arriba);
          const c = mezcla(mezcla(grama, claro, (1 - prof) * 0.55 * azar()), oscuro, prof * 0.6 + azar() * 0.25);
          f.fillStyle = css(c);
          f.beginPath();
          f.ellipse(x + (azar() - 0.5) * paso, y + (azar() - 0.5) * paso, paso * (0.9 + azar() * 0.7), paso * (0.5 + azar() * 0.4), azar() * Math.PI, 0, Math.PI * 2);
          f.fill();
        }
      }
      // Base del seto en sombra, donde empieza el césped.
      const b = f.createLinearGradient(0, H * 0.3, 0, H * 0.46);
      b.addColorStop(0, css(oscuro, 0));
      b.addColorStop(1, css(oscuro, 0.85));
      f.fillStyle = b;
      f.fillRect(0, H * 0.3, W, H * 0.7);
    };

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
      pintarFondo(azar, dpr);

      // Pala: clavada a un tercio del ancho; la base de la hoja queda escondida entre las hojas de adelante.
      const ph = H * 0.78;
      const pw = (ph * PALA.ancho) / PALA.alto;
      const base = H * 0.88;
      // En el teléfono la placa es angosta: la pala va más al centro y el rollo más a la derecha.
      const angosta = W < 420;
      palaCaja = { x: W * (angosta ? 0.5 : 0.32) - pw / 2, y: base - ph, w: pw, h: ph };
      // Rollo de manguera tirado en la grama, a la derecha (g = grosor del tubo).
      const rx = Math.min(W * 0.11, H * 0.32);
      rollo = { x: W * (angosta ? 0.84 : 0.72), y: H * 0.8, rx, ry: rx * 0.3, g: Math.max(5, H * 0.032) };
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

    /** Tubo de manguera: verde con franja naranja y trenzado, sombreado (oscuro abajo, brillo arriba). */
    const tubo = (trazar: () => void, g: number) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const capas: [number[], number, number, number][] = [
        [oscuro, 1, 0, 1],
        [grama, 0.78, -0.08, 1],
        [mezcla(grama, claro, 0.5), 0.42, -0.2, 0.9],
        [mezcla(claro, blanco, 0.5), 0.14, -0.3, 0.7],
      ];
      for (const [c, k, dy, a] of capas) {
        ctx.save();
        ctx.translate(0, dy * g);
        ctx.strokeStyle = css(c, a);
        ctx.lineWidth = g * k;
        trazar();
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = css(naranja, 0.85);
      ctx.lineWidth = g * 0.16;
      ctx.translate(0, g * 0.18);
      trazar();
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.setLineDash([1.2, 2.6]);
      ctx.strokeStyle = css(oscuro, 0.35);
      ctx.lineWidth = g * 0.6;
      trazar();
      ctx.stroke();
      ctx.restore();
    };

    /** Rollo de manguera en la grama y su punta alzada con la boquilla; devuelve la boca de la boquilla. */
    const manguera = () => {
      const { x, y, rx, ry, g } = rollo;
      for (let k = 0; k < 4; k++) {
        const r = rx - k * g * 0.25;
        tubo(() => {
          ctx.beginPath();
          ctx.ellipse(x, y - k * g * 0.62, r, ry - k * g * 0.08, 0, 0, Math.PI * 2);
        }, g);
      }
      // Punta que sale del rollo y sube hacia la izquierda.
      const fin = { x: x - rx * 1.05 + g * 1.6, y: y - H * 0.36 + g * 0.5 };
      tubo(() => {
        ctx.beginPath();
        ctx.moveTo(x + rx * 0.4, y - 3 * g * 0.62 - ry * 0.8);
        ctx.bezierCurveTo(x + rx * 0.2, y - H * 0.42, x - rx * 0.3, y - H * 0.4, fin.x, fin.y);
      }, g);
      // Boquilla: casquillo naranja y pico oscuro, apuntando a la izquierda y un poco hacia arriba.
      const ang = Math.PI - 0.35;
      ctx.save();
      ctx.translate(fin.x, fin.y);
      ctx.rotate(ang);
      const cas = ctx.createLinearGradient(0, -g * 0.7, 0, g * 0.7);
      cas.addColorStop(0, css(mezcla(naranja, blanco, 0.35)));
      cas.addColorStop(0.5, css(naranja));
      cas.addColorStop(1, css(mezcla(naranja, oscuro, 0.6)));
      ctx.fillStyle = cas;
      ctx.beginPath();
      ctx.roundRect(-g * 0.4, -g * 0.72, g * 1.4, g * 1.44, g * 0.25);
      ctx.fill();
      const pico = ctx.createLinearGradient(0, -g * 0.5, 0, g * 0.5);
      pico.addColorStop(0, css(mezcla(noche, blanco, 0.35)));
      pico.addColorStop(1, css(noche));
      ctx.fillStyle = pico;
      ctx.beginPath();
      ctx.roundRect(g * 0.95, -g * 0.48, g * 1.25, g * 0.96, g * 0.2);
      ctx.fill();
      ctx.restore();
      const largo = g * 2.2;
      return { x: fin.x + Math.cos(ang) * largo, y: fin.y + Math.sin(ang) * largo };
    };

    const luz = () => {
      // Luz de tarde que baña desde arriba a la derecha y penumbra abajo a la izquierda.
      const l = ctx.createRadialGradient(W * 0.9, -H * 0.1, 0, W * 0.9, -H * 0.1, W * 0.9);
      l.addColorStop(0, css(sol, 0.24));
      l.addColorStop(1, css(sol, 0));
      ctx.fillStyle = l;
      ctx.fillRect(0, 0, W, H);
      const p = ctx.createLinearGradient(0, H, W * 0.5, H * 0.4);
      p.addColorStop(0, css(noche, 0.4));
      p.addColorStop(1, css(noche, 0));
      ctx.fillStyle = p;
      ctx.fillRect(0, 0, W, H);
    };

    const regar = (dt: number, fuerza: number, t: number) => {
      // Un chorro desde la boquilla: muchas gotas con poca dispersión (se lee continuo), que oscila apenas.
      if (estado.current.abierta) {
        const nuevas = Math.round((260 + fuerza * 160) * dt);
        const pulso = Math.sin(t * 0.7) * 0.06;
        for (let i = 0; i < nuevas; i++) {
          const v = (1 + (Math.random() - 0.5) * 0.08) * (1 + fuerza * 0.15);
          gotas.push({
            x: boquilla.x,
            y: boquilla.y + (Math.random() - 0.5) * 2,
            vx: -(W * 0.38) * v * (1 + pulso),
            vy: -H * (0.62 + (Math.random() - 0.5) * 0.06) * v,
            suelo: H * (0.62 + Math.random() * 0.22),
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
          ctx.strokeStyle = css(agua, 0.55);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.vx * 0.02, d.y - d.vy * 0.02);
          ctx.stroke();
        }
      }
    };

    /** Pala (sube e inclina según cuánto salió de la tierra) y los terrones que suelta. */
    const dibujarPala = (dt: number) => {
      if (!pala.complete || !pala.naturalWidth) return;
      const sube = palaAlzada * H * 0.1;
      ctx.save();
      ctx.translate(palaCaja.x + palaCaja.w / 2, palaCaja.y + palaCaja.h - sube);
      ctx.rotate(-palaAlzada * 0.14);
      ctx.shadowColor = css(noche, 0.45);
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 6;
      ctx.shadowOffsetY = 4;
      ctx.drawImage(pala, -palaCaja.w / 2, -palaCaja.h, palaCaja.w, palaCaja.h);
      ctx.restore();
      for (let i = terrones.length - 1; i >= 0; i--) {
        const d = terrones[i];
        d.vy += H * 2.2 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vida -= dt * 1.4;
        if (d.vida <= 0) {
          terrones.splice(i, 1);
          continue;
        }
        ctx.fillStyle = css(tierra, d.vida);
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.6 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
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
      // El estado activo sube y baja suave (viento, chorro y pala).
      const activo = cont.closest("header")?.matches(":hover, :has(:focus-visible)") || cont.dataset.activo ? 1 : 0;
      estado.current.activo += (activo - estado.current.activo) * Math.min(1, dt * 3);
      const fuerza = estado.current.activo;
      const viento = 0.55 + fuerza * 0.6;

      // La pala sale de la tierra al activarse: al pasar el umbral, saltan terrones.
      const antes = palaAlzada;
      palaAlzada += (fuerza - palaAlzada) * Math.min(1, dt * 5);
      if (!reducido && antes < 0.15 && palaAlzada >= 0.15) {
        for (let k = 0; k < 14; k++) {
          terrones.push({
            x: palaCaja.x + palaCaja.w * (0.3 + Math.random() * 0.4),
            y: palaCaja.y + palaCaja.h * 0.97,
            vx: (Math.random() - 0.5) * 120,
            vy: -60 - Math.random() * 110,
            suelo: Infinity,
            vida: 1,
            chispa: true,
          });
        }
      }

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(fondoCache, 0, 0, W, H);
      // Pala y manguera van en su profundidad: las hojas que están delante las tapan.
      const capas = [
        { y: palaCaja.y + palaCaja.h - 4, dibujar: () => dibujarPala(dt) },
        { y: rollo.y + rollo.ry * 0.6, dibujar: () => (boquilla = manguera()) },
      ].sort((a, b) => a.y - b.y);
      let c = 0;
      for (const h of hojas) {
        while (c < capas.length && h.y > capas[c].y) capas[c++].dibujar();
        dibujarHoja(h, t, viento);
      }
      while (c < capas.length) capas[c++].dibujar();
      if (!reducido) regar(dt, fuerza, t);
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
      {/* Jardín vivo, cortado en diagonal; el canvas va contrarrestando el sesgo de la placa (no se deforma). */}
      <div className="bp-placa absolute -inset-y-6 -right-24 left-[56%] overflow-hidden shadow-tarjeta-hover md:left-[51%] xl:left-[49%]">
        <canvas ref={lienzo} className="absolute inset-y-0 -left-16 right-0 h-full w-[calc(100%+4rem)] skew-x-12" aria-hidden />
        <div className="bp-funde absolute inset-y-0 left-0" />
      </div>

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
