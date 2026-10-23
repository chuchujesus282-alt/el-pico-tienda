"use client";

import Link from "next/link";
import { ChevronRight, House, Search } from "lucide-react";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { plexMono } from "@/components/tarjetas-categoria/fuentes";
import styles from "./BannerPlano.module.css";

/**
 * Lo que cada banner hace al activarse. BannerPlano pone y quita la clase global `on` en la raíz y avisa aquí; la
 * escena mueve sus piezas y cambia `--c` (el color activo, que también usan las gotas y el brillo).
 */
export type Motor = {
  encender: () => void;
  apagar: () => void;
  /** Al desmontar: cancela rAF y timers. */
  destruir: () => void;
};

type Props = {
  /** Nombre de la categoría: va en la ruta (Inicio › Pinturas) y es el título (h1) en la etiqueta roja. */
  nombre: string;
  /** Texto chico en mono sobre el título (ej. "LÁMINA 06 · ACABADOS"). */
  kicker: string;
  texto: string;
  /** aria-label de la sección. */
  ariaLabel: string;
  /** Color activo de arranque (`--c`). */
  colorInicial: string;
  /** Ilustración a la derecha (SVG con aria-hidden). */
  children: ReactNode;
  /** Crea el motor de la escena con la raíz del banner. */
  crearMotor: (raiz: HTMLElement) => Motor;
  /**
   * Lo que cuelga de la etiqueta roja al activarse: las 4 gotas del color activo (Pinturas) o la cinta de seguridad
   * a rayas del color activo y azul tinta (Construcción).
   */
  decoracion?: "gotas" | "cinta";
  /**
   * Variables CSS propias de cada banner (ver BannerPlano.module.css): --brillo, --brillo-on, --palabra-min/-vw/-max,
   * --palabra-movil-min/-vw/-max, --etiqueta-pad, --etiqueta-sombra. Sin ellas, los valores de Pinturas.
   */
  variables?: CSSProperties;
};

/**
 * Banner de categoría estilo "plano técnico" (familia de las tarjetas de categoría animadas): contenedor azul con
 * cuadrícula, columna de texto (ruta, kicker, nombre de la categoría en la etiqueta roja con gotas, subtítulo) e
 * ilustración a la derecha. Compacto a propósito: es el encabezado de una sección, no un anuncio (la ilustración se
 * escala para caber en su alto máximo).
 * Reposo = plano frío; activo (mouse encima; en táctil, al tocar) = clase `on` y la escena corre su motor.
 * Para otra categoría: su componente arma la ilustración y su motor, y monta este con sus textos.
 */
export default function BannerPlano({
  nombre,
  kicker,
  texto,
  ariaLabel,
  colorInicial,
  children,
  crearMotor,
  decoracion = "gotas",
  variables,
}: Props) {
  const raizRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;
    const motor = crearMotor(raiz);
    let activo = false;
    const encender = () => {
      if (activo) return;
      activo = true;
      raiz.classList.add("on");
      motor.encender();
    };
    const apagar = () => {
      if (!activo) return;
      activo = false;
      raiz.classList.remove("on");
      motor.apagar();
    };

    // Mouse: encima = activo. Táctil: cada toque fuera de un enlace prende/apaga.
    const onEnter = (e: PointerEvent) => e.pointerType === "mouse" && encender();
    const onLeave = (e: PointerEvent) => e.pointerType === "mouse" && apagar();
    let ultimoTipo = "";
    const onDown = (e: PointerEvent) => (ultimoTipo = e.pointerType);
    const onClick = (e: MouseEvent) => {
      if (ultimoTipo === "mouse" || (e.target as Element).closest("a")) return;
      if (activo) apagar();
      else encender();
    };
    // Fuera de la pantalla vuelve a reposo.
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) apagar();
    });

    raiz.addEventListener("pointerenter", onEnter);
    raiz.addEventListener("pointerleave", onLeave);
    raiz.addEventListener("pointerdown", onDown);
    raiz.addEventListener("click", onClick);
    observador.observe(raiz);
    return () => {
      raiz.removeEventListener("pointerenter", onEnter);
      raiz.removeEventListener("pointerleave", onLeave);
      raiz.removeEventListener("pointerdown", onDown);
      raiz.removeEventListener("click", onClick);
      observador.disconnect();
      motor.destruir();
      raiz.classList.remove("on");
    };
  }, [crearMotor]);

  return (
    <div className="mx-auto w-full max-w-pagina px-pagina pt-4 md:pt-6">
      <section
        ref={raizRef}
        aria-label={ariaLabel}
        className={`${styles.banner} ${plexMono.variable}`}
        style={{ ...variables, "--c": colorInicial } as CSSProperties}
      >
        <div className={styles.brillo} aria-hidden />

        {/* Lupa solo en el teléfono, como en EncabezadoPagina: ahí el buscador del header no sale. */}
        <Link href="/buscar" aria-label="Buscar productos" className={styles.lupa}>
          <Search className="size-5" aria-hidden />
        </Link>

        <div className={styles.texto}>
          <nav aria-label="Ruta de navegación" className={styles.ruta}>
            <ol>
              <li>
                <Link href="/">
                  <House className="size-3.5" aria-hidden />
                  Inicio
                </Link>
              </li>
              <li aria-current="page">
                <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                <span>{nombre}</span>
              </li>
            </ol>
          </nav>

          <p className={styles.kicker}>{kicker}</p>

          <h1 className={styles.titulo}>
            <span className={styles.etiqueta}>
              <span className={styles.etiquetaFondo} aria-hidden />
              <span className={styles.palabra}>{nombre}</span>
              {decoracion === "cinta" ? (
                <span className={styles.cinta} aria-hidden />
              ) : (
                <span className={styles.gotas} aria-hidden>
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              )}
            </span>
          </h1>

          <p className={styles.subtitulo}>{texto}</p>
        </div>

        <div className={styles.ilustracion}>{children}</div>
      </section>
    </div>
  );
}
