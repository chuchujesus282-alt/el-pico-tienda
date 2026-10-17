"use client";

import { useState } from "react";
import Image from "next/image";
import { Montanas } from "@/components/layout/Logo";

type Props = {
  src: string | null;
  alt: string;
  /** Atributo sizes de next/image según dónde se muestre. */
  sizes: string;
  /** Se descarga de inmediato: solo para la imagen principal que se ve al abrir la página (LCP). */
  prioritario?: boolean;
  className?: string;
};

/**
 * Foto de producto en un marco uniforme: cuadrado, fondo blanco que se funde a azul muy claro, la foto
 * entera (object-contain) con el mismo margen y un filete fino interior. Las fotos con fondo blanco o
 * recuadros se funden con el marco (mix-blend-multiply), así la grilla se ve pareja aunque las fotos no lo sean.
 * Mientras carga, la silueta de las montañas del logo con un brillo que pasa; luego la foto aparece suave.
 */
export default function ImagenProducto({ src, alt, sizes, prioritario = false, className = "" }: Props) {
  const [cargada, setCargada] = useState(false);

  return (
    <div className={`relative aspect-square overflow-hidden bg-gradient-to-b from-pico-blanco to-pico-azul-claro/60 ${className}`}>
      {src ? (
        <>
          {!cargada && <Esqueleto />}
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            loading={prioritario ? "eager" : undefined}
            fetchPriority={prioritario ? "high" : undefined}
            onLoad={() => setCargada(true)}
            // Si la foto ya estaba en caché y cargó antes de que la página despertara, onLoad no llega: se revisa aquí.
            ref={(img) => {
              if (img?.complete && img.naturalWidth > 0) setCargada(true);
            }}
            className={`object-contain p-[8%] mix-blend-multiply transition-opacity duration-500 ease-(--curva-suave) ${cargada ? "opacity-100" : "opacity-0"}`}
          />
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-pico-azul/25">
          <Montanas className="h-1/4 w-auto fill-current" />
          <span className="sr-only">{alt} (sin imagen)</span>
        </div>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-pico-azul/8 ring-inset" aria-hidden />
    </div>
  );
}

/** Silueta del logo con un brillo que la cruza (quieto con "reducir movimiento"). */
function Esqueleto() {
  return (
    <span className="absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
      <Montanas className="h-1/4 w-auto fill-pico-azul/10" />
      <span className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-pico-blanco/70 to-transparent motion-safe:animate-brillo" />
    </span>
  );
}
