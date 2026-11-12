"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import estilos from "./SeguridadVisible.module.css";

// Escena del banner "Trabaja VISIBLE" (Seguridad industrial) del carrusel central. La monta BannerInicio cuando
// banner.id === "seguridad-visible"; el título, la descripción y el botón son los de BannerInicio (como Herramientas
// y Pinturas). Fotos del dueño en public/banners/seguridad/ (1832×858, las dos coinciden píxel a píxel).
//
// - Sin interacción: solo la foto base, sin efectos.
// - Al entrar el puntero: la escena se apaga con un parpadeo (560 ms) y una "linterna" sigue al cursor con un leve
//   retraso; dentro del círculo se ve la foto iluminada (brillan las franjas reflectivas).
// - Al salir: la oscuridad se desvanece en 380 ms. En táctil se enciende al tocar y sigue el dedo.
// - Movimiento reducido: sin parpadeo ni retraso, solo un fundido corto.
// Lógica, máscaras y tiempos: tal cual el prototipo aprobado por persona A (no cambiarlos sin acordarlo).

const DIR = "/banners/seguridad";

const FLICKER: Keyframe[] = [
  { opacity: 0 },
  { opacity: 0.9, offset: 0.14 },
  { opacity: 0.3, offset: 0.26 },
  { opacity: 0.96, offset: 0.44 },
  { opacity: 0.6, offset: 0.54 },
  { opacity: 1 },
];

export default function SeguridadVisible({ prioritario = false }: { prioritario?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const oscuridadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = ref.current;
    const dark = oscuridadRef.current;
    // Todo el banner es el enlace (BannerInicio): ahí se escuchan el puntero y se pone la clase `encendida`, que
    // también le da el resplandor a la placa del título.
    const enlace = sb?.closest("a");
    if (!sb || !dark || !enlace) return;

    // Placa blanca con la palabra en azul oscuro, como la de Pinturas.
    enlace.style.setProperty("--color-sello", "var(--color-pico-blanco)");
    enlace.style.setProperty("--color-sello-texto", "var(--color-pico-azul)");
    // El scroll vertical sigue funcionando en táctil; el gesto horizontal lo usa el carrusel para pasar.
    enlace.style.touchAction = "pan-y";

    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0,
      raf = 0;
    let anim: Animation | null = null;
    let tipoPuntero = "";
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const encendida = () => enlace.classList.contains(estilos.encendida);

    const fade = (frames: Keyframe[], ms: number) => {
      anim?.cancel();
      anim = dark.animate(frames, { duration: ms, fill: "forwards", easing: "linear" });
    };
    const aim = (e: PointerEvent) => {
      const r = sb.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    const paint = () => {
      sb.style.setProperty("--mouse-x", `${cx.toFixed(1)}px`);
      sb.style.setProperty("--mouse-y", `${cy.toFixed(1)}px`);
    };
    const tick = () => {
      const k = calm ? 1 : 0.22;
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      paint();
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const on = (e: PointerEvent) => {
      tipoPuntero = e.pointerType;
      aim(e);
      if (encendida()) return;
      cx = tx;
      cy = ty;
      paint();
      enlace.classList.add(estilos.encendida);
      fade(calm ? [{ opacity: 0 }, { opacity: 1 }] : FLICKER, calm ? 250 : 560);
    };
    const off = () => {
      if (!encendida()) return;
      const cur = parseFloat(getComputedStyle(dark).opacity) || 0;
      enlace.classList.remove(estilos.encendida);
      fade([{ opacity: cur }, { opacity: 0 }], 380);
    };
    const move = (e: PointerEvent) => {
      if (!encendida()) return;
      aim(e);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    // Al cambiar de diapositiva queda apagado al instante (sin la clase y sin oscuridad).
    const apagarYa = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      anim?.cancel();
      anim = null;
      enlace.classList.remove(estilos.encendida);
    };
    // En táctil, tocar el banner enciende la linterna en vez de navegar; el botón "Ver seguridad" sí navega. Con
    // mouse, todo el banner sigue siendo el enlace, como los demás.
    const clic = (e: MouseEvent) => {
      if (tipoPuntero !== "touch" && tipoPuntero !== "pen") return;
      if ((e.target as Element | null)?.closest("[data-boton-banner]")) return;
      e.preventDefault();
    };

    const diapositiva = enlace.closest('[aria-roledescription="diapositiva"]');
    const observador = new MutationObserver(() => {
      if (!diapositiva?.hasAttribute("data-activa")) apagarYa();
    });
    if (diapositiva) observador.observe(diapositiva, { attributes: true, attributeFilter: ["data-activa"] });

    enlace.addEventListener("pointerenter", on);
    enlace.addEventListener("pointerdown", on);
    enlace.addEventListener("pointermove", move);
    enlace.addEventListener("pointerleave", off);
    enlace.addEventListener("pointercancel", off);
    enlace.addEventListener("click", clic);
    return () => {
      observador.disconnect();
      apagarYa();
      enlace.removeEventListener("pointerenter", on);
      enlace.removeEventListener("pointerdown", on);
      enlace.removeEventListener("pointermove", move);
      enlace.removeEventListener("pointerleave", off);
      enlace.removeEventListener("pointercancel", off);
      enlace.removeEventListener("click", clic);
    };
  }, []);

  return (
    // Capas de abajo hacia arriba: foto base, degradado para el texto, oscuridad con el hueco de la linterna y foto
    // iluminada recortada en el mismo lugar. El título y el botón (BannerInicio) van después, por encima de todo.
    <div ref={ref} className={`pointer-events-none absolute inset-0 overflow-hidden bg-pico-azul-oscuro ${estilos.escena}`}>
      <Image
        src={`${DIR}/seguridad_base_apagada.webp`}
        alt="Casco, chaleco reflectivo, lentes, guantes y protectores auditivos"
        fill
        unoptimized // las dos fotos deben coincidir píxel a píxel: se sirven tal cual, sin recomprimir
        loading={prioritario ? "eager" : undefined}
        fetchPriority={prioritario ? "high" : undefined}
        draggable={false}
        className={`object-cover object-center ${estilos.foto}`}
      />
      {/* Degradado oscuro a la izquierda para que el texto se lea (más ancho en el teléfono, donde el texto ocupa más). */}
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-pico-azul-oscuro)_72%,transparent)_0%,color-mix(in_srgb,var(--color-pico-azul-oscuro)_45%,transparent)_40%,transparent_80%)] md:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-pico-azul-oscuro)_72%,transparent)_0%,color-mix(in_srgb,var(--color-pico-azul-oscuro)_45%,transparent)_24%,transparent_46%)]"
        aria-hidden
      />
      <div ref={oscuridadRef} className={`absolute inset-0 ${estilos.oscuridad}`} aria-hidden />
      <Image
        src={`${DIR}/seguridad_nueva_iluminada.webp`}
        alt=""
        aria-hidden
        fill
        unoptimized
        draggable={false}
        className={`object-cover object-center ${estilos.foto} ${estilos.iluminada}`}
      />
    </div>
  );
}
