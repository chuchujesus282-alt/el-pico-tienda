"use client";

import { useEffect, useRef } from "react";
import { DESCRIPCION_GRIFERIA, elegirEscenaGriferia } from "@/lib/escenaGriferia";
import type { Escena3D, Estado } from "./griferia3d/comun";
import estilos from "./GriferiaAgua.module.css";

// Escena del banner "Agua a tu MEDIDA" (Grifería) del carrusel central, con el mismo patrón que SeguridadVisible: la
// monta BannerInicio cuando banner.id === "griferia-agua"; el título (sello [data-sello]), la descripción
// ([data-descripcion-banner]) y el botón ([data-boton-banner]) son los de BannerInicio. Prototipo: banner-griferia.html.
//
// - Dos escenas 3D (Three.js): ducha y lavamanos. Se alternan cada día con la fecha LOCAL del visitante
//   (lib/escenaGriferia.ts; ?escena=ducha|lavamanos para revisarlas). Solo se descarga la del día (import dinámico).
// - El render (WebGL) se crea solo con la diapositiva activa y se libera entero (dispose) cuando deja de estarlo.
// - Solo dibuja mientras el agua corre o cambia: con el agua cerrada queda una imagen quieta.
// - Mouse: al entrar se abre el agua; a la izquierda sale fría y a la derecha caliente (pomos, luz, vapor, etiqueta de
//   temperatura y el sello del título, que se vuelve azul con agua fría). Al salir se cierra.
// - Táctil: se abre sola al verse; tocar o arrastrar cambia la temperatura y NO navega (solo el botón).
// - Movimiento reducido: los cambios son instantáneos y el agua no se anima.

const CARGAS = {
  ducha: () => import("./griferia3d/ducha"),
  lavamanos: () => import("./griferia3d/lavamanos"),
};

export default function GriferiaAgua() {
  const ref = useRef<HTMLDivElement>(null);
  const zonaRef = useRef<HTMLDivElement>(null);
  const frioRef = useRef<HTMLDivElement>(null);
  const frio2Ref = useRef<HTMLDivElement>(null);
  const calidoRef = useRef<HTMLDivElement>(null);
  const calido2Ref = useRef<HTMLDivElement>(null);
  const neblinaRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = ref.current;
    const zona = zonaRef.current;
    const [frio, frio2, calido, calido2, neblina, chip] = [frioRef, frio2Ref, calidoRef, calido2Ref, neblinaRef, chipRef].map((r) => r.current);
    // Todo el banner es el enlace (BannerInicio): ahí se escucha el puntero.
    const enlace = raiz?.closest("a");
    if (!raiz || !zona || !frio || !frio2 || !calido || !calido2 || !neblina || !chip || !enlace) return;

    const nombre = elegirEscenaGriferia(new URLSearchParams(window.location.search).get("escena"));
    const descripcion = enlace.querySelector("[data-descripcion-banner]");
    if (descripcion) descripcion.textContent = DESCRIPCION_GRIFERIA[nombre];
    const sello = enlace.querySelector<HTMLElement>("[data-sello]");
    enlace.classList.add(estilos.conAgua);
    enlace.style.touchAction = "pan-y"; // el gesto horizontal lo usa el carrusel para pasar
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sinHover = window.matchMedia("(hover: none)").matches;

    // Se descarga ya el código de la escena del día (sin crear nada): al activarse la diapositiva entra rápido.
    const modulo = CARGAS[nombre]();

    const st: Estado = { abierta: false, apertura: 0, obj: 0.5, act: 0.5 };
    let escena: Escena3D | null = null;
    let lienzo: HTMLCanvasElement | null = null;
    let vivo = true;
    let raf = 0;
    let tAnt = 0;
    let tipoPuntero = "";
    let espera = 0;

    const diapositiva = enlace.closest('[aria-roledescription="diapositiva"]');
    const activa = () => diapositiva?.hasAttribute("data-activa") ?? true;

    const ui = () => {
      const f = Math.max(0, (0.5 - st.act) * 2) * st.apertura;
      const c = Math.max(0, (st.act - 0.5) * 2) * st.apertura;
      frio.style.opacity = frio2.style.opacity = String(f);
      calido.style.opacity = calido2.style.opacity = String(c);
      neblina.style.opacity = String(Math.max(0, (st.act - 0.5) / 0.5) * st.apertura);
      if (st.abierta && st.act < 0.42) enlace.style.setProperty("--color-sello", "rgb(31 111 214)");
      else enlace.style.removeProperty("--color-sello");
      if (sello) {
        const tono = st.act > 0.5 ? "255 120 40" : "60 140 255";
        const fuerza = (Math.abs(st.act - 0.5) * 0.9 * st.apertura).toFixed(2);
        sello.style.boxShadow = `var(--shadow-boton-hover), 0 0 28px rgb(${tono} / ${fuerza})`;
      }
      const texto = st.act < 0.4 ? "FRÍA" : st.act > 0.6 ? "CALIENTE" : "TIBIA";
      chip.innerHTML = `${texto} · <b>${Math.round(14 + st.act * 36)}°C</b>`;
      chip.style.borderColor = `rgb(${st.act > 0.5 ? "255 140 70" : "110 170 255"} / ${(0.3 + Math.abs(st.act - 0.5)).toFixed(2)})`;
    };
    const ubicarChip = () => {
      if (!escena) return;
      const p = escena.etiqueta();
      chip.style.left = `${zona.offsetLeft + ((p.x + 1) / 2) * zona.clientWidth + 8}px`;
      chip.style.top = `${((1 - p.y) / 2) * zona.clientHeight}px`;
    };

    const bucle = (t: number) => {
      const dt = Math.min(0.05, (t - tAnt) / 1000);
      tAnt = t;
      st.act += (st.obj - st.act) * (reduce ? 1 : 0.08);
      st.apertura += ((st.abierta ? 1 : 0) - st.apertura) * (reduce ? 1 : 0.1);
      ui();
      const corre = st.apertura > 0.01 && !reduce;
      if (escena) {
        escena.actualizar(st);
        if (corre) escena.avanzar(dt, t);
        escena.dibujar();
        ubicarChip();
      }
      const transicion = Math.abs(st.obj - st.act) > 0.002 || Math.abs((st.abierta ? 1 : 0) - st.apertura) > 0.003;
      raf = transicion || corre ? requestAnimationFrame(bucle) : 0;
    };
    const arrancar = () => {
      if (raf) return;
      tAnt = performance.now();
      raf = requestAnimationFrame(bucle);
    };

    const encuadrar = () => {
      if (!escena) return;
      escena.encuadrar(zona.clientWidth, zona.clientHeight, raiz.clientWidth < 700);
      escena.dibujar();
      ubicarChip();
    };
    const alCambiarTamano = new ResizeObserver(encuadrar);
    alCambiarTamano.observe(zona);

    // Crea el render solo con la diapositiva activa (en un lienzo nuevo: el anterior perdió su contexto WebGL).
    const crear = async () => {
      if (escena) return;
      const { crearEscena } = await modulo;
      if (!vivo || escena || !activa()) return;
      lienzo = document.createElement("canvas");
      lienzo.className = estilos.lienzo;
      zona.prepend(lienzo);
      escena = crearEscena(lienzo);
      escena.actualizar(st);
      encuadrar();
    };
    const liberar = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(espera);
      escena?.liberar();
      escena = null;
      lienzo?.remove();
      lienzo = null;
      st.abierta = false;
      st.apertura = 0;
      st.obj = st.act = 0.5;
      raiz.classList.remove(estilos.activo);
      ui();
    };

    const agua = (abierta: boolean) => {
      st.abierta = abierta;
      raiz.classList.toggle(estilos.activo, abierta);
      if (!abierta) st.obj = 0.5;
      arrancar();
    };
    const mover = (v: number) => {
      st.obj = Math.max(0, Math.min(1, v));
      arrancar();
    };
    // Posición horizontal → temperatura (izquierda fría, derecha caliente), sobre la zona de la escena.
    const desdeX = (e: PointerEvent) => {
      const r = zona.getBoundingClientRect();
      const movil = raiz.clientWidth < 700;
      return (e.clientX - r.left - r.width * (movil ? 0.1 : 0.45)) / (r.width * (movil ? 0.8 : 0.5));
    };
    const entrar = (e: PointerEvent) => {
      tipoPuntero = e.pointerType;
      if (e.pointerType !== "mouse") return;
      agua(true);
      mover(desdeX(e));
    };
    const moverPuntero = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.buttons) mover(desdeX(e));
    };
    const presionar = (e: PointerEvent) => {
      tipoPuntero = e.pointerType;
      if (e.pointerType === "mouse" || (e.target as Element | null)?.closest("[data-boton-banner]")) return;
      agua(true);
      mover(desdeX(e));
    };
    const salir = (e: PointerEvent) => {
      if (e.pointerType === "mouse") agua(false);
    };
    const clic = (e: MouseEvent) => {
      if (tipoPuntero !== "touch" && tipoPuntero !== "pen") return;
      if ((e.target as Element | null)?.closest("[data-boton-banner]")) return;
      e.preventDefault();
    };

    const alCambiarDiapositiva = () => {
      if (!activa()) return liberar();
      void crear();
      if (sinHover) {
        clearTimeout(espera);
        espera = window.setTimeout(() => agua(true), 900);
      }
    };
    const observador = new MutationObserver(alCambiarDiapositiva);
    if (diapositiva) observador.observe(diapositiva, { attributes: true, attributeFilter: ["data-activa"] });
    ui();
    if (activa()) alCambiarDiapositiva();

    enlace.addEventListener("pointerenter", entrar);
    enlace.addEventListener("pointermove", moverPuntero);
    enlace.addEventListener("pointerdown", presionar);
    enlace.addEventListener("pointerleave", salir);
    enlace.addEventListener("click", clic);
    return () => {
      vivo = false;
      observador.disconnect();
      alCambiarTamano.disconnect();
      liberar();
      enlace.classList.remove(estilos.conAgua);
      enlace.removeEventListener("pointerenter", entrar);
      enlace.removeEventListener("pointermove", moverPuntero);
      enlace.removeEventListener("pointerdown", presionar);
      enlace.removeEventListener("pointerleave", salir);
      enlace.removeEventListener("click", clic);
    };
  }, []);

  return (
    // Capas: lienzo 3D (lo crea el efecto) con los tintes frío/cálido y la neblina encima, la etiqueta de temperatura
    // y el velo de lectura. El título y el botón (BannerInicio) van después, por encima de todo.
    <div ref={ref} className={`pointer-events-none absolute inset-0 overflow-hidden ${estilos.escena}`} aria-hidden>
      <div ref={zonaRef} className={estilos.zona}>
        <div ref={frioRef} className={`${estilos.tinte} ${estilos.frio}`} />
        <div ref={frio2Ref} className={`${estilos.tinte} ${estilos.frio2}`} />
        <div ref={calidoRef} className={`${estilos.tinte} ${estilos.calido}`} />
        <div ref={calido2Ref} className={`${estilos.tinte} ${estilos.calido2}`} />
        <div ref={neblinaRef} className={estilos.neblina} />
      </div>
      <div ref={chipRef} className={estilos.chip} />
      <div className={estilos.lectura} />
    </div>
  );
}
