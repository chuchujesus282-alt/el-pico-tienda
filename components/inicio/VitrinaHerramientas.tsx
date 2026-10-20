"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Montanas } from "@/components/layout/Logo";
import type { CSSProperties } from "react";

// Vitrina del banner "Herramientas de TODO TIPO" del carrusel del inicio: un muro de recuadros inclinados con el
// ángulo del filete de la marca (-12°, el mismo del sello del título), cada uno con una herramienta real y el
// trabajo para el que sirve. Prueba el surtido y orienta al que no sabe el nombre de lo que busca. Solo la monta
// BannerInicio cuando banner.id === "herramientas".
// Fotos de public/herramientas/ (también las usan los banners de categoría de persona B).
//
// - Al llegar la diapositiva, los recuadros entran en cascada (una sola vez por llegada). Sin JS o con movimiento
//   reducido se ven quietos en su sitio.
// - Teléfono: 4 recuadros (2×2), sin nombre del trabajo (el texto no cabe). Tableta: 6 (3×2). Desde 1024px: 8 (4×2).
// - Las fotos no se descargan hasta que el banner es la diapositiva actual y se ve en pantalla.

type Herramienta = {
  foto: string;
  ancho: number;
  alto: number;
  trabajo: string;
  /** Desde qué ancho aparece (el orden está pensado para que cada cuadrícula quede completa). */
  desde?: "md" | "lg";
};

// Orden de lectura de la cuadrícula de 4×2. Con 3 columnas (sin las "lg") y con 2 (sin "md" ni "lg") también
// quedan filas completas: 3×2 y 2×2.
const HERRAMIENTAS: Herramienta[] = [
  { foto: "cinta-metrica", ancho: 640, alto: 519, trabajo: "Medir" },
  { foto: "serrucho", ancho: 640, alto: 507, trabajo: "Cortar", desde: "md" },
  { foto: "taladro", ancho: 515, alto: 640, trabajo: "Perforar" },
  { foto: "esmeril", ancho: 640, alto: 308, trabajo: "Pulir", desde: "lg" },
  { foto: "nivel", ancho: 640, alto: 580, trabajo: "Nivelar", desde: "lg" },
  { foto: "martillo", ancho: 640, alto: 602, trabajo: "Clavar" },
  { foto: "destornillador", ancho: 640, alto: 575, trabajo: "Atornillar", desde: "md" },
  { foto: "llave-ajustable", ancho: 640, alto: 606, trabajo: "Ajustar" },
];

const VISIBILIDAD = { md: "hidden md:block", lg: "hidden lg:block" } as const;

const RETRASO_MS = 60;

export default function VitrinaHerramientas() {
  const capa = useRef<HTMLDivElement>(null);
  // cargar: ya se puede descargar las fotos. oculta: la diapositiva no es la actual; al volver a serlo, los
  // recuadros entran en cascada. Arranca en false: sin JS (o antes de hidratar) la vitrina se ve completa.
  const [cargar, setCargar] = useState(false);
  const [oculta, setOculta] = useState(false);

  useEffect(() => {
    const el = capa.current;
    if (!el) return;
    // Las diapositivas del carrusel están apiladas en la misma celda, solo transparentes: el IntersectionObserver
    // las da por visibles aunque no sean la actual. Por eso también se mira data-activa (lo pone CarruselBanners).
    const diapositiva = el.closest('[aria-roledescription="diapositiva"]');
    const esActual = () => !diapositiva || diapositiva.hasAttribute("data-activa");
    let enPantalla = false;
    let cuadro = 0;

    const revisar = () => {
      cancelAnimationFrame(cuadro);
      if (!esActual()) {
        setOculta(true);
        return;
      }
      if (enPantalla) setCargar(true);
      // Un cuadro después, para que el navegador pinte primero el estado oculto y la entrada se anime.
      cuadro = requestAnimationFrame(() => setOculta(false));
    };

    const observador = new IntersectionObserver(
      ([entrada]) => {
        enPantalla = entrada.isIntersecting;
        if (enPantalla && esActual()) setCargar(true);
      },
      { threshold: 0.4 },
    );
    observador.observe(el);
    const cambios = new MutationObserver(revisar);
    if (diapositiva) cambios.observe(diapositiva, { attributes: true, attributeFilter: ["data-activa"] });
    if (!esActual()) setOculta(true);
    return () => {
      observador.disconnect();
      cambios.disconnect();
      cancelAnimationFrame(cuadro);
    };
  }, []);

  return (
    <div ref={capa} className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Las montañas del logo, muy tenues, detrás de la vitrina. */}
      <Montanas className="absolute -right-[8%] -bottom-[28%] w-[70%] fill-pico-blanco/[0.04] md:w-[55%]" />

      {/* El muro se inclina entero con el ángulo del filete; cada foto se endereza por dentro. Se aparta de las
          flechas del carrusel (desde 768px) y deja la mitad izquierda al texto. */}
      {/* Anchos medidos contra el sello "TODO TIPO" (que crece 8% al pasar el mouse): 375px → 31%, 768px → 34%,
          1024px → 38%; desde 1280px el título deja más aire. */}
      <div className="absolute top-1/2 right-[4%] w-[31%] -translate-y-1/2 sm:right-[5%] sm:w-[36%] md:right-[10%] md:w-[34%] lg:right-[7%] lg:w-[38%] xl:w-[42%] xl:max-w-[40rem]">
        <ul className="grid -skew-x-12 grid-cols-2 gap-1.5 md:grid-cols-3 md:gap-2.5 lg:grid-cols-4 lg:gap-3">
          {HERRAMIENTAS.map((h, i) => (
            <li
              key={h.foto}
              style={{ "--retraso": `${i * RETRASO_MS}ms` } as CSSProperties}
              className={`${h.desde ? VISIBILIDAD[h.desde] : ""} transition-[opacity,translate] ease-(--curva-suave) motion-reduce:transition-none ${
                oculta
                  ? "translate-y-3 opacity-0 duration-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
                  : "translate-y-0 opacity-100 duration-700 [transition-delay:var(--retraso)]"
              }`}
            >
              <div className="relative aspect-square overflow-hidden rounded-sm bg-gradient-to-b from-pico-blanco to-pico-azul-claro shadow-tarjeta">
                {/* Filete rojo arriba, como el de las tarjetas de producto. */}
                <span className="absolute inset-x-0 top-0 z-10 h-1 bg-pico-rojo" />
                <div className="absolute inset-0 skew-x-12 scale-110">
                  {cargar && (
                    <Image
                      src={`/herramientas/${h.foto}.webp`}
                      alt=""
                      width={h.ancho}
                      height={h.alto}
                      sizes="(min-width: 1536px) 150px, (min-width: 1024px) 120px, (min-width: 768px) 90px, 64px"
                      className="absolute inset-0 size-full object-contain p-[16%] pb-[24%] drop-shadow-md drop-shadow-pico-azul-oscuro/25 md:pb-[30%]"
                    />
                  )}
                </div>
                {/* El trabajo para el que sirve: placa azul al pie del recuadro (desde tableta). */}
                <span className="absolute inset-x-0 bottom-0 hidden bg-pico-azul py-1 text-center md:block lg:py-1.5">
                  <span className="block skew-x-12 text-[10px] leading-none font-bold tracking-[0.12em] text-pico-blanco uppercase lg:text-[11px] 2xl:text-xs">
                    {h.trabajo}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
