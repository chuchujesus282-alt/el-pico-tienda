"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

// Banner "Renueva tus espacios" del carrusel del inicio (viene de la rama `prueba/animacion-herramientas`).
// TODO el banner es la pared pintada del color de turno. Cada vez que el cliente pasa el cursor, un rodillo real del
// alto del banner, con la felpa teñida del color nuevo, cruza de lado a lado y lo repinta entero (terracota,
// petróleo, azul, mostaza). El nombre del color va gigante y translúcido abajo a la derecha, cortado por el borde, y
// una lata abierta de ese color se apoya abajo a la derecha. El sello del título pasa a blanco con la palabra en el
// color de la pintura. En el celular cambia solo cada pocos segundos mientras se ve.
// Fotos HD generadas con Higgsfield (public/banners/pinturas/). Solo la monta BannerInicio cuando banner.id === "pinturas".

const COLORES = [
  { nombre: "Terracota", var: "var(--color-pintura-terracota)", lata: "terracota" },
  { nombre: "Petróleo", var: "var(--color-pintura-petroleo)", lata: "petroleo" },
  { nombre: "Azul profundo", var: "var(--color-pintura-azul)", lata: "azul" },
  { nombre: "Mostaza", var: "var(--color-pintura-mostaza)", lata: "mostaza" },
];
const CADA_MS_MOVIL = 3800;

/** Rodillo: alto (en cqh del banner) y centro del cilindro dentro de la foto (≈11,5% de su ancho; la foto es 820×648). */
const ALTO_RODILLO = 112;
const CENTRO_CILINDRO = ALTO_RODILLO * (820 / 648) * 0.115;

export default function PinturaEnMovimiento() {
  const capa = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // -1: todavía sin pintar. Cada pasada suma 1; el color es pasada % COLORES.length.
  const [pasada, setPasada] = useState(-1);

  useEffect(() => {
    const el = capa.current;
    const banner = el?.closest("a");
    if (!el || !banner) return;
    const tactil = window.matchMedia("(hover: none)").matches;
    let intervalo: ReturnType<typeof setInterval> | undefined;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        setVisible((v) => v || entrada.isIntersecting);
        clearInterval(intervalo);
        if (!entrada.isIntersecting) return;
        // Primera pasada al verse; en el celular (sin cursor) sigue pintando sola mientras el banner esté a la vista.
        setPasada((p) => (p < 0 ? 0 : p));
        if (tactil) intervalo = setInterval(() => setPasada((p) => p + 1), CADA_MS_MOVIL);
      },
      { threshold: 0.6 },
    );
    const otraPasada = () => setPasada((p) => p + 1);
    observador.observe(el);
    banner.addEventListener("mouseenter", otraPasada);
    return () => {
      observador.disconnect();
      clearInterval(intervalo);
      banner.removeEventListener("mouseenter", otraPasada);
    };
  }, []);

  const actual = pasada >= 0 ? COLORES[pasada % COLORES.length] : null;
  // Lo que había antes de esta pasada (al principio, el último color: así la primera pasada ya cambia algo).
  const anterior = pasada > 0 ? COLORES[(pasada - 1) % COLORES.length] : COLORES[COLORES.length - 1];

  // El sello del título (en BannerInicio) va blanco con "ESPACIOS" en el color de la pintura.
  useEffect(() => {
    const banner = capa.current?.closest("a");
    if (!banner) return;
    banner.style.setProperty("--color-sello", "var(--color-pico-blanco)");
    banner.style.setProperty("--color-sello-texto", (actual ?? anterior).var);
  }, [actual, anterior]);

  return (
    <div ref={capa} className="pointer-events-none absolute inset-0 [container-type:size]" aria-hidden>
      {/* La pared: el color de antes y, encima, el nuevo, que se descubre de izquierda a derecha detrás del rodillo. */}
      <div className="absolute inset-0" style={{ backgroundColor: anterior.var }} />
      {actual && (
        <div
          key={pasada}
          className="absolute inset-0 motion-safe:animate-pintar"
          style={{ backgroundColor: actual.var }}
        />
      )}

      {/* Textura de rodillo (vetas finas), luz arriba a la izquierda y sombra abajo: se lee como pintura fresca. */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_5px,var(--color-pico-blanco)_5px,var(--color-pico-blanco)_6px)] opacity-[0.06]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,var(--color-pico-blanco)_0%,transparent_55%)] opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-t from-pico-azul-oscuro/20 via-transparent to-transparent" />

      {/* El nombre del color, gigante y translúcido, arriba a la derecha y cortado por el borde de arriba (abajo
          está la lata y a la izquierda el título y el botón). */}
      {actual && (
        <span
          key={`n${pasada}`}
          className="absolute -top-[7cqh] -right-[1cqw] text-[30cqh] leading-none font-bold tracking-[-0.04em] whitespace-nowrap text-pico-blanco/15 uppercase motion-safe:animate-aparecer"
        >
          {actual.nombre}
        </span>
      )}

      {/* Velo azul a la izquierda: el título, el texto y el botón blancos siempre se leen, sea cual sea el color. */}
      {/* Suave a propósito: más oscuro, el azul ensucia los colores cálidos (terracota y mostaza se vuelven marrón). */}
      <div className="absolute inset-y-0 left-0 w-[85%] bg-gradient-to-r from-pico-azul-oscuro/35 to-transparent md:w-[55%]" />

      {/* La lata del color de turno, grande, apoyada abajo a la derecha (desde tableta). Se precargan las cuatro. */}
      {visible && actual && (
        <span
          key={`lata-${pasada}`}
          className="absolute right-[6%] -bottom-[10%] hidden w-[22%] max-w-[22rem] motion-safe:animate-aparecer md:block lg:right-[9%]"
        >
          <Image
            src={`/banners/pinturas/lata-${actual.lata}.webp`}
            alt=""
            width={700}
            height={700}
            sizes="(min-width: 1536px) 352px, 22vw"
            className="h-auto w-full drop-shadow-2xl drop-shadow-pico-azul-oscuro/60"
          />
        </span>
      )}
      {visible && (
        <span className="hidden">
          {COLORES.map((c) => (
            <Image key={c.lata} src={`/banners/pinturas/lata-${c.lata}.webp`} alt="" width={700} height={700} sizes="22vw" loading="eager" />
          ))}
        </span>
      )}

      {/* El rodillo, del alto del banner, cruza de lado a lado con el centro del cilindro justo en el borde de lo
          pintado. La felpa va teñida del color nuevo (capa con mix-blend-multiply sobre el cilindro). */}
      {visible && actual && (
        <span
          key={`r${pasada}`}
          className="absolute left-0 block opacity-0 motion-safe:animate-pasada-rodillo"
          style={
            {
              top: `${(100 - ALTO_RODILLO) / 2}cqh`,
              height: `${ALTO_RODILLO}cqh`,
              "--desde": `-${CENTRO_CILINDRO}cqh`,
              "--hasta": `calc(100cqw - ${CENTRO_CILINDRO}cqh)`,
            } as CSSProperties
          }
        >
          <Image
            src="/banners/pinturas/rodillo.webp"
            alt=""
            width={820}
            height={648}
            sizes="(min-width: 1536px) 640px, 50vw"
            className="h-full w-auto max-w-none drop-shadow-2xl drop-shadow-pico-azul-oscuro/50"
          />
          <span
            className="absolute top-[3%] bottom-[2%] left-[0.5%] w-[22%] rounded-[45%/6%] mix-blend-multiply"
            style={{ backgroundColor: actual.var }}
          />
        </span>
      )}
    </div>
  );
}
