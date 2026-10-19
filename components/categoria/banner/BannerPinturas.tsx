"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Montanas } from "@/components/layout/Logo";

/**
 * Banner de la categoría Pinturas (va en `EncabezadoPagina` con la prop `escena`). Misma idea que el de herramientas
 * del inicio: azul marino con el texto a la izquierda y, cortada en diagonal, una placa del color de la pintura de
 * turno con una lata REAL flotando. En el corte, una franja con la carta de colores. Junto a la lata, la ficha del
 * color y una brocha real apoyada en ella.
 * - Mouse encima (o foco con teclado): la placa se corre un poco, la lata crece, la brocha retoca la ficha y asoma un
 *   rodillo real por abajo.
 * - Clic (o Enter/Espacio; en el teléfono, el toque): pasa al color siguiente. La brocha da una pasada sobre la ficha
 *   y la deja del color nuevo, la placa cambia y la lata del color nuevo aparece sobre la anterior.
 * - Movimiento reducido: todo queda quieto; el clic solo cambia el color.
 * Fotos en public/banners/pinturas/ (latas) y public/herramientas/ (brocha, rodillo). Animaciones en banner.css.
 */

/** Lata de cada color. `codigo` y `hex` son la referencia de carta de colores que se lee en la ficha. */
const LATAS = [
  { id: "terracota", nombre: "Terracota", codigo: "1675 C", hex: "#A9431E", ancho: 699, alto: 700 },
  { id: "petroleo", nombre: "Petróleo", codigo: "3165 C", hex: "#00505C", ancho: 661, alto: 700 },
  { id: "azul", nombre: "Azul profundo", codigo: "2728 C", hex: "#0047BB", ancho: 632, alto: 700 },
  { id: "mostaza", nombre: "Mostaza", codigo: "1255 C", hex: "#AD841F", ancho: 611, alto: 700 },
] as const;

const color = (i: number) => `var(--color-pintura-${LATAS[i % LATAS.length].id})`;

export default function BannerPinturas() {
  const [clics, setClics] = useState(0);
  const [tocado, setTocado] = useState(false);
  const puntero = useRef("");
  const actual = clics % LATAS.length;
  const lata = LATAS[actual];

  const variables = { "--pintura": color(clics), "--pintura-antes": color(clics + LATAS.length - 1) } as CSSProperties;

  return (
    <div className="bp absolute inset-0 overflow-hidden" data-activo={tocado || undefined} style={variables}>
      {/* Placa del color de la pintura, cortada en diagonal como la placa amarilla del banner de herramientas. */}
      <div className="bp-placa absolute -inset-y-6 -right-24 left-[60%] overflow-hidden bg-(--pintura) shadow-tarjeta-hover md:left-[56%] xl:left-[55%]">
        <div className="absolute inset-0 bg-gradient-to-br from-pico-blanco/10 via-transparent to-pico-azul-oscuro/45" />
        <div className="absolute inset-0 skew-x-12 bg-[linear-gradient(var(--color-pico-blanco)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-blanco)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.07]" />
        <Montanas className="absolute -right-6 -bottom-10 w-[115%] skew-x-12 fill-pico-blanco/[0.06]" />
        {/* Luz suave detrás de la lata. */}
        <div className="absolute top-1/2 left-[62%] aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_62%)] opacity-25" />
      </div>
      {/* Franja del corte: la carta de colores (los cuatro de las latas), con filetes blancos. */}
      <div className="bp-placa absolute -inset-y-6 left-[calc(60%-1.1rem)] w-[1.1rem] border-x-2 border-pico-blanco/85 bg-[linear-gradient(to_bottom,var(--color-pintura-terracota)_0_25%,var(--color-pintura-petroleo)_25%_50%,var(--color-pintura-azul)_50%_75%,var(--color-pintura-mostaza)_75%_100%)] bg-[size:100%_96px] shadow-tarjeta-hover md:left-[calc(56%-1.1rem)] xl:left-[calc(55%-1.1rem)]" />

      {/* Rodillo real que asoma por abajo, junto al corte, al pasar el mouse. */}
      <span className="bp-rodillo absolute bottom-0 left-[49%] hidden w-24 md:block xl:left-[50%] xl:w-28">
        <Image src="/herramientas/rodillo.webp" alt="" width={563} height={640} sizes="112px" className="h-auto w-full opacity-90 blur-[1px] drop-shadow-xl drop-shadow-pico-azul-oscuro/60" />
      </span>

      <button
        type="button"
        aria-label={`Cambiar el color de la pintura (ahora ${lata.nombre})`}
        onPointerDown={(e) => (puntero.current = e.pointerType)}
        onClick={() => {
          if (puntero.current === "touch") setTocado(true);
          puntero.current = "";
          setClics((c) => c + 1);
        }}
        className="absolute inset-y-0 right-0 left-[58%] cursor-pointer focus-visible:outline-none md:left-[54%]"
      >
        {/* Ficha de color con la brocha apoyada (desde 768px). */}
        <span className="absolute top-[15%] right-[60%] hidden w-24 md:block xl:right-[52%] xl:w-28">
          <span className="bp-ficha block rounded-md bg-pico-blanco p-1.5 pb-2 text-left shadow-tarjeta-hover">
            <span className="relative block aspect-[4/3] overflow-hidden rounded-sm bg-(--pintura)">
              {clics > 0 && (
                <>
                  <span className="absolute inset-0 bg-(--pintura-antes)" />
                  <span key={clics} className="bp-mancha absolute inset-0 bg-(--pintura)" />
                </>
              )}
            </span>
            <span className="mt-1.5 block text-[13px] leading-none font-bold text-texto">{lata.codigo}</span>
            <span className="mt-1 block text-[10px] leading-none tracking-wide text-gris-texto">{lata.hex}</span>
          </span>
          {/* Las cerdas (arriba a la izquierda de la foto) quedan sobre la muestra de la ficha. */}
          <span key={clics} className={`${clics > 0 ? "bp-pincelada" : ""} absolute top-[22%] left-[52%] block w-[95%]`}>
            <span className="bp-retoque block">
              <Image src="/herramientas/brocha.webp" alt="" width={635} height={640} sizes="112px" className="h-auto w-full drop-shadow-xl drop-shadow-pico-azul-oscuro/50" />
            </span>
          </span>
        </span>

        {/* Lata real flotando, con su sombra en el piso. Las cuatro están montadas: la de turno se funde sobre la anterior. */}
        <span className="absolute right-[6%] bottom-[7%] block aspect-[20/21] h-[60%] md:top-[8%] md:right-[7%] md:bottom-auto md:h-[84%] xl:right-[8%]">
          <span className="absolute -bottom-[6%] left-1/2 h-[9%] w-[60%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/45 blur-xl" />
          <span className="bp-lata block size-full motion-safe:animate-levitar">
            {LATAS.map((l, i) => (
              <Image
                key={l.id}
                src={`/banners/pinturas/lata-${l.id}.webp`}
                alt=""
                width={l.ancho}
                height={l.alto}
                priority={i === 0}
                loading={i === 0 ? undefined : "eager"}
                sizes="(min-width: 1280px) 240px, (min-width: 768px) 210px, 120px"
                className={`absolute inset-0 size-full object-contain object-bottom drop-shadow-2xl drop-shadow-pico-azul-oscuro/50 transition-opacity duration-700 motion-reduce:transition-none ${
                  i === actual ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </span>
        </span>
      </button>

      <span className="sr-only" aria-live="polite">
        {clics > 0 ? `Pintura ${lata.nombre}, ${lata.codigo}` : ""}
      </span>
    </div>
  );
}
