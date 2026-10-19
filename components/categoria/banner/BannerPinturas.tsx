"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Montanas } from "@/components/layout/Logo";

/**
 * Banner de la categoría Pinturas (va en `EncabezadoPagina` con la prop `escena`). Misma idea que el de herramientas
 * del inicio: azul marino con el texto a la izquierda y, cortada en diagonal, una placa del color de turno. Sobre la
 * placa, un pequeño exhibidor: la lata REAL apoyada en el piso (con el charco de su chorreado) y otra detrás con el
 * color que viene, y la ficha del color con una brocha real apoyada.
 * - Solo: cada pocos segundos pasa al color siguiente (mientras el banner se ve; nunca con "reducir movimiento").
 *   Un rodillo real cruza la placa pintándola, la brocha repinta la ficha y la lata cambia.
 * - Clic / Enter / toque: pasa al color siguiente al instante (y el reloj vuelve a empezar).
 * - Mouse encima o foco con teclado: asoman herramientas reales por los bordes, la lata crece un poco y la brocha
 *   retoca la ficha. Con el foco del teclado dentro, los colores no pasan solos.
 * Fotos en public/banners/pinturas/ y public/herramientas/. Animaciones en banner.css.
 */

/** Lata de cada color. `codigo` y `hex` son la referencia de carta de colores que se lee en la ficha. */
const LATAS = [
  { id: "terracota", nombre: "Terracota", codigo: "1675 C", hex: "#A9431E", ancho: 699, alto: 700 },
  { id: "petroleo", nombre: "Petróleo", codigo: "3165 C", hex: "#00505C", ancho: 661, alto: 700 },
  { id: "azul", nombre: "Azul profundo", codigo: "2728 C", hex: "#0047BB", ancho: 632, alto: 700 },
  { id: "mostaza", nombre: "Mostaza", codigo: "1255 C", hex: "#AD841F", ancho: 611, alto: 700 },
] as const;
const CADA_MS = 5200;

/**
 * Herramientas que asoman por los bordes al pasar el mouse (desde 768px), como en el banner de herramientas. Nunca
 * sobre el título (arriba van del 30% en adelante, abajo del 28%: a 1280px el subtítulo llega al ~19%) ni sobre el exhibidor. `tam` en px a 1280px.
 */
const ASOMAN = [
  { foto: "destornillador", ancho: 640, alto: 575, borde: "arriba", en: 31, tam: 150, giro: 196 },
  { foto: "cuter", ancho: 640, alto: 532, borde: "arriba", en: 44, tam: 140, giro: 158 },
  { foto: "rodillo", ancho: 563, alto: 640, borde: "abajo", en: 28, tam: 150, giro: 20 },
  { foto: "brocha", ancho: 635, alto: 640, borde: "abajo", en: 41, tam: 135, giro: -30 },
  { foto: "cinta-metrica", ancho: 640, alto: 519, borde: "abajo", en: 66, tam: 125, giro: 10 },
] as const;

const lataDe = (n: number) => LATAS[((n % LATAS.length) + LATAS.length) % LATAS.length];
const colorDe = (n: number) => `var(--color-pintura-${lataDe(n).id})`;

export default function BannerPinturas() {
  const raiz = useRef<HTMLDivElement>(null);
  const [cambio, setCambio] = useState(0);
  const [tocado, setTocado] = useState(false);
  const [visible, setVisible] = useState(false);
  // Lo que oye el lector de pantalla: solo los cambios pedidos con clic (los automáticos no interrumpen).
  const [anuncio, setAnuncio] = useState("");
  const [espera, setEspera] = useState(0);
  const puntero = useRef("");
  const lata = lataDe(cambio);
  const siguiente = lataDe(cambio + 1);

  // Solo se cuenta el tiempo mientras el banner está en pantalla.
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Cambio automático. Depende de `cambio`: un clic reinicia el reloj.
  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => {
      // Con el foco del teclado dentro del encabezado, espera otra vuelta.
      if (raiz.current?.closest("header")?.matches(":has(:focus-visible)")) setEspera((e) => e + 1);
      else setCambio((c) => c + 1);
    }, CADA_MS);
    return () => window.clearTimeout(t);
  }, [cambio, visible, espera]);

  const variables = { "--pintura": colorDe(cambio), "--pintura-antes": colorDe(cambio - 1) } as CSSProperties;

  return (
    <div ref={raiz} className="bp absolute inset-0 overflow-hidden" data-activo={tocado || undefined} style={variables}>
      {/* Placa cortada en diagonal. Al cambiar de color, el nuevo entra detrás de un rodillo real que la cruza. */}
      <div className="bp-placa absolute -inset-y-6 -right-24 left-[60%] overflow-hidden shadow-tarjeta-hover md:left-[56%] xl:left-[55%]">
        <div className={`absolute inset-0 ${cambio > 0 ? "bg-(--pintura-antes)" : "bg-(--pintura)"}`} />
        {cambio > 0 && <div key={`capa-${cambio}`} className="bp-barrido absolute inset-0 bg-(--pintura)" />}
        {/* Luz de arriba, piso más oscuro abajo (el exhibidor se apoya ahí), cuadrícula y montañas de la marca. */}
        <div className="absolute inset-0 bg-[linear-gradient(170deg,color-mix(in_srgb,var(--color-pico-blanco)_16%,transparent)_0%,transparent_45%,color-mix(in_srgb,var(--color-pico-azul-oscuro)_55%,transparent)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-pico-azul-oscuro/35 to-transparent" />
        <div className="absolute inset-0 skew-x-12 bg-[linear-gradient(var(--color-pico-blanco)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-blanco)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.07]" />
        <Montanas className="absolute -right-6 -bottom-10 w-[115%] skew-x-12 fill-pico-blanco/[0.06]" />
        <div className="absolute top-[45%] left-[64%] aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_62%)] opacity-25" />
        {cambio > 0 && (
          <div key={`rodillo-${cambio}`} className="bp-pasada absolute inset-0">
            <Image
              src="/banners/pinturas/rodillo.webp"
              alt=""
              width={820}
              height={648}
              sizes="380px"
              className="absolute top-[4%] left-0 h-[95%] w-auto max-w-none translate-x-[-13%] skew-x-12 drop-shadow-2xl drop-shadow-pico-azul-oscuro/60"
            />
          </div>
        )}
      </div>
      {/* Franja del corte: la carta de colores, con filetes blancos. */}
      <div className="bp-placa absolute -inset-y-6 left-[calc(60%-1.1rem)] w-[1.1rem] border-x-2 border-pico-blanco/85 bg-[linear-gradient(to_bottom,var(--color-pintura-terracota)_0_25%,var(--color-pintura-petroleo)_25%_50%,var(--color-pintura-azul)_50%_75%,var(--color-pintura-mostaza)_75%_100%)] bg-[size:100%_96px] shadow-tarjeta-hover md:left-[calc(56%-1.1rem)] xl:left-[calc(55%-1.1rem)]" />

      {/* Herramientas que asoman por los bordes (desfocadas: el exhibidor es el foco). */}
      <div className="hidden [--escala:0.62] md:block lg:[--escala:0.82] xl:[--escala:1]">
        {ASOMAN.map((a, i) => (
          <span
            key={a.foto}
            className={`bp-asoma bp-asoma-${a.borde} absolute block`}
            style={{ left: `${a.en}%`, width: `calc(${a.tam}px * var(--escala))`, "--giro": `${a.giro}deg`, "--i": i } as CSSProperties}
          >
            <Image
              src={`/herramientas/${a.foto}.webp`}
              alt=""
              width={a.ancho}
              height={a.alto}
              sizes={`${a.tam}px`}
              className="h-auto w-full opacity-90 blur-[1.2px] drop-shadow-xl drop-shadow-pico-azul-oscuro/60"
            />
          </span>
        ))}
      </div>
      {/* Velo sobre la zona del texto cuando asoman las herramientas: el título siempre se lee. */}
      <div className="bp-velo absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-pico-azul-oscuro/55 via-pico-azul-oscuro/25 to-transparent" />

      <button
        type="button"
        aria-label={`Cambiar el color de la pintura (ahora ${lata.nombre})`}
        onPointerDown={(e) => (puntero.current = e.pointerType)}
        onClick={() => {
          if (puntero.current === "touch") setTocado(true);
          puntero.current = "";
          setCambio((c) => c + 1);
          const nueva = lataDe(cambio + 1);
          setAnuncio(`Pintura ${nueva.nombre}, ${nueva.codigo}`);
        }}
        className="absolute inset-y-0 right-0 left-[58%] cursor-pointer focus-visible:outline-none md:left-[54%]"
      >
        {/* Lata de atrás, con el color que viene (solo desde 1280px: antes no cabe). */}
        <span className="absolute right-[33%] bottom-[19%] hidden aspect-[20/21] h-[48%] xl:block">
          <span className="absolute -bottom-[5%] left-1/2 h-[10%] w-[70%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/50 blur-md" />
          {LATAS.map((l) => (
            <Image
              key={l.id}
              src={`/banners/pinturas/lata-${l.id}.webp`}
              alt=""
              width={l.ancho}
              height={l.alto}
              sizes="140px"
              className={`absolute inset-0 size-full object-contain object-bottom blur-[0.6px] brightness-[0.82] transition-opacity delay-300 duration-700 ${l.id === siguiente.id ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </span>

        {/* Ficha de color con la brocha apoyada (desde 768px). */}
        <span className="absolute top-[13%] right-[58%] hidden w-24 md:block xl:right-[63%] xl:w-[7.5rem]">
          <span className="bp-ficha block rounded-md bg-pico-blanco p-1.5 pb-2 text-left shadow-tarjeta-hover">
            <span className="relative block aspect-[4/3] overflow-hidden rounded-sm bg-(--pintura)">
              {cambio > 0 && (
                <>
                  <span className="absolute inset-0 bg-(--pintura-antes)" />
                  <span key={cambio} className="bp-mancha absolute inset-0 bg-(--pintura)" />
                </>
              )}
              {/* Brillo de pintura fresca. */}
              <span className="absolute inset-0 bg-gradient-to-br from-pico-blanco/25 via-transparent to-pico-azul-oscuro/20" />
            </span>
            <span className="mt-1.5 block text-[13px] leading-none font-bold whitespace-nowrap text-texto">{lata.codigo}</span>
            <span className="mt-1 block text-[9px] leading-tight whitespace-nowrap text-gris-texto">
              <span className="block font-semibold tracking-[0.1em] uppercase">{lata.nombre}</span>
              <span className="block tracking-wide">{lata.hex}</span>
            </span>
          </span>
          {/* Las cerdas (arriba a la izquierda de la foto) quedan sobre la muestra de la ficha. */}
          <span key={cambio} className={`${cambio > 0 ? "bp-pincelada" : ""} absolute top-[22%] left-[52%] block w-[95%]`}>
            <span className="bp-retoque block">
              <Image src="/herramientas/brocha.webp" alt="" width={635} height={640} sizes="112px" className="h-auto w-full drop-shadow-xl drop-shadow-pico-azul-oscuro/50" />
            </span>
          </span>
        </span>

        {/* Lata principal apoyada en el piso: sombra de contacto, charco donde caen los chorreados y un reflejo que
            recorre el metal de vez en cuando. Las cuatro están montadas: la nueva se funde sobre la anterior. */}
        <span className="absolute right-[6%] bottom-[5%] block aspect-[20/21] h-[58%] md:right-[7%] md:h-[74%] xl:right-[9%] xl:h-[76%]">
          <span className="absolute -bottom-[3%] left-[46%] h-[12%] w-[86%] -translate-x-1/2 rounded-[50%] bg-pico-azul-oscuro/55 blur-md" />
          <span className="absolute bottom-[-1%] left-[18%] h-[9%] w-[46%] rounded-[50%] bg-(--pintura) shadow-[inset_0_-2px_4px_rgb(0_0_0/0.35)] transition-colors delay-300 duration-700" />
          <span className="absolute bottom-[3.5%] left-[26%] h-[2.5%] w-[16%] rounded-[50%] bg-pico-blanco/45 blur-[1px]" />
          <span className="bp-lata absolute inset-0 block">
            {LATAS.map((l, i) => (
              <Image
                key={l.id}
                src={`/banners/pinturas/lata-${l.id}.webp`}
                alt=""
                width={l.ancho}
                height={l.alto}
                priority={i === 0}
                loading={i === 0 ? undefined : "eager"}
                sizes="(min-width: 1280px) 220px, (min-width: 768px) 190px, 120px"
                className={`absolute inset-0 size-full object-contain object-bottom drop-shadow-xl drop-shadow-pico-azul-oscuro/40 transition-opacity delay-300 duration-700 ${
                  l.id === lata.id ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            {/* Reflejo: una banda de luz recortada con la silueta de la lata de turno. */}
            <span
              className="absolute inset-0 overflow-hidden [mask-position:bottom] [mask-repeat:no-repeat] [mask-size:contain]"
              style={{ maskImage: `url(/banners/pinturas/lata-${lata.id}.webp)` }}
            >
              <span className="bp-reflejo absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-transparent via-pico-blanco/45 to-transparent" />
            </span>
          </span>
        </span>
      </button>

      <span className="sr-only" aria-live="polite">
        {anuncio}
      </span>
    </div>
  );
}
