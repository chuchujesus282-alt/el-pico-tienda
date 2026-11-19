"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { RUTA_CALCULADORAS } from "@/components/calculadoras/rutas";
import estilos from "./BannerCalculadorasInicio.module.css";
import { DURACION_ESCENA_MS, ESCENAS_CALCULADORAS, type EscenaCalculadora } from "./escenasCalculadoras";

// Banner de calculadoras del inicio, portado del prototipo banner-calculadoras.html. Tres escenas que rotan solas
// (datos en escenasCalculadoras.ts): en cada una se dibuja el plano (pared de bloques, malla de cabillas o pared que
// se pinta), cuenta el contador, la tarjeta marca los materiales uno a uno y se llena su barra; al terminar, brillo del
// botón y "Lista para pedir". Las pestañas eligen la escena (y siguen rotando desde ahí).
// - Arranca solo cuando el banner entra en pantalla.
// - Movimiento reducido: cada escena se muestra terminada, sin animar y sin rotar.
// - Al desmontarse se cancelan timers, requestAnimationFrame y el IntersectionObserver.
// El plano se dibuja con SVG creado aquí (no hay datos de usuario). El botón lleva a /calculadoras (RUTA_CALCULADORAS).

const NS = "http://www.w3.org/2000/svg";
// Caja del dibujo dentro del viewBox 0 0 340 190.
const X0 = 40,
  Y0 = 30,
  W = 260,
  H = 130;

/** Se lanza para cortar una escena en curso (otra pestaña, o el componente se fue). */
class Cancelado extends Error {}

export default function BannerCalculadorasInicio() {
  const raizRef = useRef<HTMLElement>(null);
  const dibujoRef = useRef<SVGGElement>(null);
  const cuerpoRef = useRef<HTMLDivElement>(null);
  const progresoRef = useRef<HTMLElement>(null);
  const tituloRef = useRef<HTMLSpanElement>(null);
  const etiquetaRef = useRef<HTMLElement>(null);
  const anchoRef = useRef<SVGTextElement>(null);
  const altoRef = useRef<SVGTextElement>(null);
  const contadorNombreRef = useRef<HTMLSpanElement>(null);
  const contadorValorRef = useRef<HTMLElement>(null);
  const pestanasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = raizRef.current;
    const dibujo = dibujoRef.current;
    const cuerpo = cuerpoRef.current;
    const progreso = progresoRef.current;
    const pestanas = [...(pestanasRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
    const [titulo, etiqueta, ancho, alto, contNombre, contValor] = [
      tituloRef.current,
      etiquetaRef.current,
      anchoRef.current,
      altoRef.current,
      contadorNombreRef.current,
      contadorValorRef.current,
    ];
    if (!raiz || !dibujo || !cuerpo || !progreso || !titulo || !etiqueta || !ancho || !alto || !contNombre || !contValor) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- tiempos cancelables ---------- */
    let ficha = 0; // cambia al empezar otra secuencia: la anterior se corta sola
    const timers = new Set<number>();
    const cuadros = new Set<number>();
    const esperar = (ms: number, f: number) =>
      new Promise<void>((ok, mal) => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          if (f === ficha) ok();
          else mal(new Cancelado());
        }, ms);
        timers.add(id);
      });
    const suave = (t: number) => 1 - Math.pow(1 - t, 3);
    const interpolar = (dur: number, fn: (e: number, k: number) => void, f: number) =>
      new Promise<void>((ok, mal) => {
        const t0 = performance.now();
        const paso = (ahora: number) => {
          if (f !== ficha) return mal(new Cancelado());
          // max 0: el tiempo del primer cuadro puede ser anterior a t0 (daba anchos negativos en el rodillo).
          const k = Math.max(0, Math.min(1, (ahora - t0) / dur));
          fn(suave(k), k);
          if (k < 1) {
            const id = requestAnimationFrame((t) => {
              cuadros.delete(id);
              paso(t);
            });
            cuadros.add(id);
          } else ok();
        };
        paso(t0);
      });
    const cortarTodo = () => {
      ficha++;
      timers.forEach(clearTimeout);
      timers.clear();
      cuadros.forEach(cancelAnimationFrame);
      cuadros.clear();
    };

    /* ---------- dibujo del plano ---------- */
    const crear = <K extends keyof SVGElementTagNameMap>(etq: K, attrs: Record<string, string | number>, clase = "") => {
      const e = document.createElementNS(NS, etq);
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
      if (clase) e.setAttribute("class", clase);
      dibujo.appendChild(e);
      return e;
    };
    const suelo = () => crear("line", { x1: 24, y1: 161, x2: 316, y2: 161 }, estilos.suelo);
    type Animar = (f: number, dur: number) => Promise<void>;

    const dibujarPared = (): Animar => {
      crear("rect", { x: X0, y: Y0, width: W, height: H }, estilos.contorno);
      const COLS = 8,
        FILAS = 6,
        bw = W / COLS,
        bh = H / FILAS,
        g = 2;
      const bloques: SVGRectElement[] = [];
      for (let r = FILAS - 1; r >= 0; r--) {
        const corrido = (FILAS - 1 - r) % 2 ? bw / 2 : 0;
        const piezas: number[] = corrido ? [corrido] : [];
        let resto = W - corrido;
        while (resto > 0.1) {
          const p = Math.min(bw, resto);
          piezas.push(p);
          resto -= p;
        }
        let x = X0;
        for (const p of piezas) {
          bloques.push(crear("rect", { x: x + g / 2, y: Y0 + r * bh + g / 2, width: p - g, height: bh - g, rx: 1.5 }, estilos.bloque));
          x += p;
        }
      }
      suelo();
      return async (f, dur) => {
        const paso = dur / bloques.length;
        for (const b of bloques) {
          b.classList.add(estilos.puesto);
          await esperar(paso, f);
        }
        bloques[bloques.length - 12].classList.add(estilos.marcado);
      };
    };

    const dibujarLosa = (): Animar => {
      crear("rect", { x: X0, y: Y0, width: W, height: H }, estilos.losa);
      const barras: SVGLineElement[] = [];
      const amarres: SVGCircleElement[] = [];
      const NX = 11,
        NY = 7,
        pad = 8;
      const fy = (j: number) => Y0 + pad + (j * (H - 2 * pad)) / (NY - 1);
      const fx = (i: number) => X0 + pad + (i * (W - 2 * pad)) / (NX - 1);
      for (let j = 0; j < NY; j++) {
        const b = crear("line", { x1: X0 + pad - 4, y1: fy(j), x2: X0 + W - pad + 4, y2: fy(j) }, estilos.barra);
        b.style.setProperty("--largo", String(W));
        barras.push(b);
      }
      for (let i = 0; i < NX; i++) {
        const b = crear("line", { x1: fx(i), y1: Y0 + pad - 4, x2: fx(i), y2: Y0 + H - pad + 4 }, estilos.barra);
        b.style.setProperty("--largo", String(H));
        barras.push(b);
      }
      for (let j = 0; j < NY; j++)
        for (let i = 0; i < NX; i++) {
          const rojo = (i === 5 && j === 3) || (i === 2 && j === 1) || (i === 8 && j === 5);
          amarres.push(crear("circle", { cx: fx(i), cy: fy(j), r: rojo ? 3.6 : 2 }, `${estilos.amarre}${rojo ? ` ${estilos.marcado}` : ""}`));
        }
      return async (f, dur) => {
        const p1 = (dur * 0.65) / barras.length;
        for (const b of barras) {
          b.classList.add(estilos.puesto);
          await esperar(p1, f);
        }
        const p2 = (dur * 0.35) / amarres.length;
        for (let k = 0; k < amarres.length; k++) {
          amarres[k].classList.add(estilos.puesto);
          if (k % 3 === 0) await esperar(p2 * 3, f);
        }
      };
    };

    const dibujarPintura = (): Animar => {
      crear("rect", { x: X0, y: Y0, width: W, height: H }, estilos.muro);
      const pintado = crear("rect", { x: X0, y: Y0, width: 0, height: H, mask: "url(#calc-mascara-pintura)" }, estilos.pintado);
      crear("rect", { x: 205, y: 52, width: 62, height: 46 }, estilos.hueco);
      crear("line", { x1: 236, y1: 52, x2: 236, y2: 98 }, estilos.huecoLinea);
      crear("line", { x1: 205, y1: 75, x2: 267, y2: 75 }, estilos.huecoLinea);
      crear("rect", { x: 72, y: 74, width: 44, height: 86 }, estilos.hueco);
      crear("circle", { cx: 108, cy: 118, r: 2, fill: "rgba(255,255,255,.7)" });
      suelo();
      const rodillo = crear("g", {}, estilos.rodillo);
      for (const [etq, attrs, clase] of [
        ["rect", { x: -6, y: -26, width: 12, height: 52, rx: 4 }, estilos.rodilloFelpa],
        ["rect", { x: -6, y: -26, width: 5, height: 52, rx: 2 }, estilos.rodilloPintura],
        ["path", { d: "M6 -22 h8 v26 h-4 v14" }, estilos.rodilloArmazon],
        ["rect", { x: 6, y: 18, width: 8, height: 26, rx: 3 }, estilos.rodilloMango],
      ] as const) {
        const e = document.createElementNS(NS, etq);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
        e.setAttribute("class", clase);
        rodillo.appendChild(e);
      }
      const mover = (x: number) => rodillo.setAttribute("transform", `translate(${x} 82)`);
      mover(X0);
      return async (f, dur) => {
        await interpolar(
          dur,
          (_e, k) => {
            const w = W * k;
            pintado.setAttribute("width", String(w));
            mover(X0 + w);
          },
          f,
        );
        rodillo.style.opacity = "0";
      };
    };

    const DIBUJOS: Record<EscenaCalculadora["dibujo"], () => Animar> = {
      pared: dibujarPared,
      losa: dibujarLosa,
      pintura: dibujarPintura,
    };

    /* ---------- tarjeta y pestañas ---------- */
    const llenarTarjeta = (esc: EscenaCalculadora) => {
      titulo.textContent = esc.titulo;
      etiqueta.textContent = esc.etiqueta;
      ancho.textContent = esc.ancho;
      alto.textContent = esc.alto;
      contNombre.textContent = esc.contador.nombre;
      contValor.textContent = `0${esc.contador.unidad}`;
      cuerpo.replaceChildren(
        ...esc.materiales.map((m) => {
          const fila = document.createElement("div");
          fila.className = estilos.fila;
          fila.innerHTML = `<svg class="${estilos.check}" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="10"/><path d="M6.5 11.5l3 3 6-6.5"/></svg>`;
          const nombre = document.createElement("div");
          nombre.className = estilos.nombre;
          const detalle = document.createElement("small");
          detalle.textContent = m.detalle;
          nombre.append(m.nombre, detalle);
          const valor = document.createElement("div");
          valor.className = estilos.valor;
          const num = document.createElement("span");
          num.textContent = "0";
          const unidad = document.createElement("small");
          unidad.textContent = m.unidad;
          valor.append(num, unidad);
          fila.append(nombre, valor);
          return fila;
        }),
      );
      return [...cuerpo.children] as HTMLDivElement[];
    };
    const marcarPestanas = (i: number) => {
      pestanas.forEach((p, k) => {
        p.classList.remove(estilos.pestanaActiva, estilos.pestanaHecha);
        p.setAttribute("aria-pressed", String(k === i));
        if (k < i) p.classList.add(estilos.pestanaHecha);
      });
      void pestanas[i]?.offsetWidth; // reinicia la barra de progreso
      pestanas[i]?.classList.add(estilos.pestanaActiva);
    };

    /* ---------- secuencia ---------- */
    const numero = (fila: HTMLDivElement) => fila.querySelector(`.${estilos.valor} span`) as HTMLSpanElement;
    const jugarEscena = async (i: number, f: number) => {
      const esc = ESCENAS_CALCULADORAS[i];
      raiz.classList.add(estilos.cambiando);
      await esperar(reduce ? 0 : 350, f);
      raiz.classList.remove(estilos.conCotas, estilos.lista);
      dibujo.replaceChildren();
      progreso.style.width = "0%";
      const animar = DIBUJOS[esc.dibujo]();
      const filas = llenarTarjeta(esc);
      marcarPestanas(i);
      raiz.classList.remove(estilos.cambiando);

      if (reduce) {
        raiz.classList.add(estilos.conCotas, estilos.lista);
        dibujo.querySelectorAll(`.${estilos.bloque}, .${estilos.barra}, .${estilos.amarre}`).forEach((e) => e.classList.add(estilos.puesto));
        dibujo.querySelector<SVGRectElement>(`.${estilos.pintado}`)?.setAttribute("width", String(W));
        dibujo.querySelector<SVGGElement>(`.${estilos.rodillo}`)?.setAttribute("opacity", "0");
        filas.forEach((fila, k) => {
          fila.classList.add(estilos.encendida, estilos.lista);
          numero(fila).textContent = String(esc.materiales[k].cantidad);
        });
        contValor.textContent = `${esc.contador.valor}${esc.contador.unidad}`;
        progreso.style.width = "100%";
        return;
      }

      await esperar(400, f);
      raiz.classList.add(estilos.conCotas);
      await esperar(700, f);

      const DIBUJO_MS = 1800;
      filas[0].classList.add(estilos.encendida);
      const n0 = numero(filas[0]);
      interpolar(
        DIBUJO_MS,
        (e) => {
          n0.textContent = String(Math.round(esc.materiales[0].cantidad * e));
          contValor.textContent = `${Math.round(esc.contador.valor * e)}${esc.contador.unidad}`;
        },
        f,
      ).catch(() => {});
      await animar(f, DIBUJO_MS);
      filas[0].classList.add(estilos.lista);
      progreso.style.width = "34%";
      await esperar(300, f);

      for (let k = 1; k < filas.length; k++) {
        const fila = filas[k];
        const num = numero(fila);
        const hasta = esc.materiales[k].cantidad;
        fila.classList.add(estilos.encendida);
        await interpolar(450, (e) => (num.textContent = String(Math.round(hasta * e))), f);
        fila.classList.add(estilos.lista);
        progreso.style.width = `${34 + k * 33}%`;
        await esperar(280, f);
      }
      raiz.classList.add(estilos.lista);
      await esperar(3000, f);
    };

    const rotar = async (desde: number) => {
      cortarTodo();
      const f = ficha;
      let i = desde;
      try {
        for (;;) {
          await jugarEscena(i, f);
          if (reduce) return;
          i = (i + 1) % ESCENAS_CALCULADORAS.length;
        }
      } catch (e) {
        if (!(e instanceof Cancelado)) throw e;
      }
    };

    const alElegir = pestanas.map((p, i) => {
      const fn = () => {
        raiz.classList.add(estilos.visto);
        void rotar(i);
      };
      p.addEventListener("click", fn);
      return fn;
    });

    // Arranca solo cuando el banner entra en pantalla.
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();
        raiz.classList.add(estilos.visto);
        void rotar(0);
      },
      { threshold: 0.3 },
    );
    observador.observe(raiz);

    return () => {
      observador.disconnect();
      cortarTodo();
      pestanas.forEach((p, i) => p.removeEventListener("click", alElegir[i]));
    };
  }, []);

  const primera = ESCENAS_CALCULADORAS[0];
  return (
    <section
      ref={raizRef}
      aria-label="Calculadoras de materiales"
      className={`my-4 md:my-6 ${estilos.banner}`}
      style={{ "--duracion": `${DURACION_ESCENA_MS}ms` } as CSSProperties}
    >
      <div>
        <p className={estilos.antetitulo}>
          <span className={estilos.punto} aria-hidden />
          Calculadoras gratis
        </p>
        <h2>
          <span className={`block ${estilos.tituloChico}`}>¿Cuánto material</span>
          <span className={estilos.tituloGrande}>
            <em>TE HACE FALTA?</em>
          </span>
        </h2>
        <p className={estilos.descripcion}>Pon las medidas y te decimos cuántos bloques, sacos y cabillas llevar. Lo agregas todo al pedido.</p>
        <div ref={pestanasRef} className={estilos.pestanas} role="group" aria-label="Ejemplos">
          {ESCENAS_CALCULADORAS.map((esc) => (
            <button key={esc.pestana} type="button" className={estilos.pestana} aria-pressed={false}>
              {esc.pestana}
              <span className={estilos.pista} aria-hidden>
                <span className={estilos.relleno} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Plano (se oculta en pantallas medianas). */}
      <div className={estilos.plano} aria-hidden>
        <div className={estilos.contador}>
          <span ref={contadorNombreRef}>{primera.contador.nombre}</span> <b ref={contadorValorRef}>0</b>
        </div>
        <svg viewBox="0 0 340 190">
          <defs>
            <linearGradient id="calc-barrido" x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset=".5" stopColor="#fff" stopOpacity=".25" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id="calc-mascara-pintura">
              <rect x="40" y="30" width="260" height="130" fill="#fff" />
              <rect x="205" y="52" width="62" height="46" fill="#000" />
              <rect x="72" y="74" width="44" height="86" fill="#000" />
            </mask>
          </defs>
          <g ref={dibujoRef} className={estilos.dibujo} />
          <rect className={estilos.barrido} x="40" y="30" width="40" height="130" fill="url(#calc-barrido)" />
          <g className={estilos.cotas}>
            <line className={estilos.trazo} style={{ "--largo": 260 } as CSSProperties} x1="40" y1="180" x2="300" y2="180" />
            <line x1="40" y1="174" x2="40" y2="186" />
            <line x1="300" y1="174" x2="300" y2="186" />
            <rect x="144" y="172" width="52" height="16" />
            <text ref={anchoRef} x="170" y="184" textAnchor="middle">
              {primera.ancho}
            </text>
            <line className={estilos.trazo} style={{ "--largo": 130 } as CSSProperties} x1="322" y1="30" x2="322" y2="160" />
            <line x1="316" y1="30" x2="328" y2="30" />
            <line x1="316" y1="160" x2="328" y2="160" />
            <rect x="314" y="76" width="16" height="38" />
            <text ref={altoRef} x="0" y="0" textAnchor="middle" transform="translate(326 95) rotate(-90)">
              {primera.alto}
            </text>
          </g>
        </svg>
      </div>

      {/* Tarjeta de materiales: la llena el efecto con los de la escena de turno. */}
      <div className={estilos.tarjeta}>
        <div className={estilos.cabeceraTarjeta}>
          <span ref={tituloRef}>{primera.titulo}</span>
          <small ref={etiquetaRef}>{primera.etiqueta}</small>
        </div>
        <div ref={cuerpoRef} className={estilos.cuerpoTarjeta} />
        <div className={estilos.pieTarjeta}>
          <div className={estilos.progreso} aria-hidden>
            <i ref={progresoRef} />
          </div>
          <span className={estilos.aviso}>✓ Lista para pedir</span>
        </div>
      </div>

      <div className={estilos.accion}>
        <Link href={RUTA_CALCULADORAS} className={estilos.boton}>
          Calcular mi obra
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
        <span className={estilos.nota}>Gratis y sin registrarte</span>
      </div>
    </section>
  );
}
