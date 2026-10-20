"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

// Banner "Renueva tus espacios" del carrusel del inicio (viene de la rama `prueba/animacion-herramientas`).
// Pared blanca y un rodillo real que pinta una franja gruesa de izquierda a derecha y luego se retira. Cada vez que el cliente
// pasa el cursor, el rodillo da otra pasada con un color nuevo (terracota, petróleo, azul, mostaza) y el sello
// "ESPACIOS" del título toma ese color. En el celular cambia solo cada pocos segundos mientras se ve.
// Abajo, en la base de la pared y donde arranca la franja, UNA lata abierta del color de turno (cambia con cada
// pasada, como si el rodillo saliera de ella). Fotos HD generadas con Higgsfield (public/banners/pinturas/).
// Solo la monta BannerInicio cuando banner.id === "pinturas".

const COLORES = [
  { nombre: "Terracota", var: "var(--color-pintura-terracota)", lata: "terracota" },
  { nombre: "Petróleo", var: "var(--color-pintura-petroleo)", lata: "petroleo" },
  { nombre: "Azul profundo", var: "var(--color-pintura-azul)", lata: "azul" },
  { nombre: "Mostaza", var: "var(--color-pintura-mostaza)", lata: "mostaza" },
];
const CADA_MS_MOVIL = 3800;

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
  const anterior = pasada > 0 ? COLORES[(pasada - 1) % COLORES.length] : null;

  // El sello "ESPACIOS" del título (en BannerInicio) toma el color de la pintura.
  useEffect(() => {
    const banner = capa.current?.closest("a");
    if (banner && actual) banner.style.setProperty("--color-sello", actual.var);
  }, [actual]);

  return (
    <div ref={capa} className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Pared recién frisada: blanco cálido con una textura de llana muy suave. */}
      <div className="absolute inset-0 bg-gradient-to-br from-pico-blanco via-pico-blanco to-gris-fondo" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,var(--color-gris-borde)_0%,transparent_45%),radial-gradient(ellipse_at_80%_80%,var(--color-gris-borde)_0%,transparent_40%)] opacity-60" />

      {/* La franja de pintura. container-type: size permite medir el rodillo en cqh/cqw de la franja. */}
      <div className="absolute top-[20%] right-[3%] left-[54%] h-[52%] [container-type:size] md:top-[16%] md:left-[50%] md:h-[56%]">
        {anterior && <Franja color={anterior.var} />}
        {actual && (
          <div key={pasada} className="absolute inset-0 motion-safe:animate-pintar">
            <Franja color={actual.var} />
            <span className="absolute top-[10%] left-[5%] text-[10px] font-bold tracking-[0.25em] text-pico-blanco/90 uppercase md:text-xs">
              {actual.nombre}
            </span>
          </div>
        )}

        {/* El rodillo: su cilindro (≈10% del ancho de la foto) va justo en el borde de lo pintado. */}
        {visible && actual && (
          <span
            key={`r${pasada}`}
            className="absolute top-[-9.5cqh] left-0 block h-[119cqh] opacity-0 motion-safe:animate-pasada-rodillo"
            style={{ "--desde": "-15cqh", "--hasta": "calc(100cqw - 15cqh)" } as CSSProperties}
          >
            <Image
              src="/banners/pinturas/rodillo.webp"
              alt=""
              width={820}
              height={648}
              sizes="(min-width: 1536px) 420px, (min-width: 1024px) 26vw, 32vw"
              className="h-full w-auto max-w-none drop-shadow-xl drop-shadow-pico-azul-oscuro/30"
            />
          </span>
        )}
      </div>

      {/* La lata del color de turno, en la base de la pared al inicio de la franja (cortada por el borde de abajo).
          Con cada pasada entra la lata nueva. Se precargan las cuatro para que el cambio no parpadee. Desde tableta
          (en el celular chocaría con los controles del carrusel). */}
      {visible && actual && (
        <span
          key={`lata-${pasada}`}
          className="absolute -bottom-[7%] left-[41%] hidden w-[15%] max-w-[15rem] motion-safe:animate-aparecer md:block"
        >
          <Image
            src={`/banners/pinturas/lata-${actual.lata}.webp`}
            alt=""
            width={700}
            height={700}
            sizes="(min-width: 1536px) 240px, 15vw"
            className="h-auto w-full drop-shadow-2xl drop-shadow-pico-azul-oscuro/35"
          />
        </span>
      )}
      {visible && (
        <span className="hidden">
          {COLORES.map((c) => (
            <Image key={c.lata} src={`/banners/pinturas/lata-${c.lata}.webp`} alt="" width={700} height={700} sizes="15vw" loading="eager" />
          ))}
        </span>
      )}
    </div>
  );
}

/** Franja de pintura con la textura del rodillo: vetas horizontales y bordes un poco irregulares. */
function Franja({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-0 rounded-[0.6rem_2.2rem_0.9rem_1.8rem/1.6rem_0.7rem_2rem_0.8rem] shadow-tarjeta-hover"
      style={{ backgroundColor: color }}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_5px,var(--color-pico-blanco)_5px,var(--color-pico-blanco)_6px)] opacity-[0.07]" />
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-pico-blanco/15 via-transparent to-pico-azul-oscuro/15" />
    </div>
  );
}
