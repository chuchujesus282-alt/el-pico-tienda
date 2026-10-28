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

/** Número pseudoaleatorio fijo (0..1): igual en el servidor y en el navegador, así no cambia al hidratar. */
export const azar = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/** 34 hojas de pasto bajo la etiqueta (prototipo banner-jardin-v1.html). */
const HOJAS_PASTO = Array.from({ length: 34 }, (_, i) => {
  const x = 4 + i * 8.8,
    h = 7 + azar(i, 1) * 9,
    l = azar(i, 2) * 4 - 2;
  const f = (n: number) => n.toFixed(2);
  return `M${f(x - 2)} 16Q${f(x + l)} ${f(16 - h)} ${f(x + l * 1.6)} ${f(16 - h - 1)}Q${f(x + 1)} ${f(16 - h * 0.5)} ${f(x + 2)} 16Z`;
});

type Props = {
  /** Nombre de la categoría: va en la ruta (Inicio › Pinturas) y es el título (h1) en la etiqueta roja. */
  nombre: string;
  /** aria-label de la sección. */
  ariaLabel: string;
  /** Color activo de arranque (`--c`). */
  colorInicial: string;
  /** Ilustración a la derecha (SVG con aria-hidden). */
  children: ReactNode;
  /** Crea el motor de la escena con la raíz del banner. */
  crearMotor: (raiz: HTMLElement) => Motor;
  /**
   * Lo que cuelga de la etiqueta roja al activarse: las 4 gotas del color activo (Pinturas), la cinta de seguridad
   * a rayas del color activo y azul tinta (Construcción) o el cable con chispa (Electricidad; la chispa corre con la
   * clase global `spark` y el cable se calienta con `lit`, las dos las pone su motor) o el pasto que brota (Hogar y
   * jardín) o la banda transportadora que avanza con el color activo (Vehículos) o las 5 casillas que se marcan
   * (Seguridad industrial; su motor les pone la clase global `ok` a las que tienen `data-casilla`) o la cinta métrica
   * que se extiende (Herramientas) o el tubo que se llena de agua con la clase global `agua` y gotea con `vivo`
   * (Plomería; las dos las pone su motor) o los 5 pines de cerradura que se alinean (Cerrajería: dorados con `on`,
   * a la misma altura y con la línea de corte verde con la clase global `abierto`, que pone su motor).
   */
  decoracion?: "gotas" | "cinta" | "cable" | "pasto" | "banda" | "casillas" | "metro" | "tubo" | "pines";
  /**
   * Variables CSS propias de cada banner (ver BannerPlano.module.css): --brillo, --brillo-on, --palabra-min/-vw/-max,
   * --palabra-movil-min/-vw/-max, --etiqueta-pad, --etiqueta-sombra. Sin ellas, los valores de Pinturas.
   */
  variables?: CSSProperties;
};

/**
 * Banner de categoría estilo "plano técnico" (familia de las tarjetas de categoría animadas): contenedor azul con
 * cuadrícula, columna de texto (ruta y el nombre de la categoría en la etiqueta roja con gotas; nada más, a propósito) e
 * ilustración a la derecha. Compacto a propósito: es el encabezado de una sección, no un anuncio (la ilustración se
 * escala para caber en su alto máximo).
 * Reposo = plano frío; activo = clase `on` y la escena corre su motor. Con mouse: activo mientras está encima. En el
 * teléfono (pantalla táctil sin mouse): se activa solo al verse la mitad del banner (pedido de persona B: casi nadie
 * lo toca) y un toque lo apaga o lo vuelve a prender.
 * Para otra categoría: su componente arma la ilustración y su motor, y monta este con sus textos.
 */
export default function BannerPlano({
  nombre,
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
    // Fuera de la pantalla vuelve a reposo. En el teléfono, al verse la mitad, arranca solo (en la PC, con el mouse).
    const tactil = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) apagar();
        else if (tactil && entrada.intersectionRatio >= 0.5) encender();
      },
      { threshold: [0, 0.5] },
    );

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
        <div className={styles.velo} aria-hidden />
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

          <h1 className={styles.titulo}>
            <span className={styles.etiqueta}>
              <span className={styles.etiquetaFondo} aria-hidden />
              <span className={styles.palabra}>{nombre}</span>
              {decoracion === "cinta" ? (
                <span className={styles.cinta} aria-hidden />
              ) : decoracion === "cable" ? (
                <span className={styles.cable} aria-hidden />
              ) : decoracion === "banda" ? (
                <span className={styles.banda} aria-hidden />
              ) : decoracion === "pines" ? (
                <span className={styles.pines} aria-hidden>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              ) : decoracion === "metro" ? (
                <span className={styles.metro} aria-hidden />
              ) : decoracion === "tubo" ? (
                <span className={styles.tubo} aria-hidden />
              ) : decoracion === "casillas" ? (
                <span className={styles.casillas} aria-hidden>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} data-casilla={i} />
                  ))}
                </span>
              ) : decoracion === "pasto" ? (
                <svg className={styles.pasto} viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden>
                  {HOJAS_PASTO.map((d, i) => (
                    <path key={i} d={d} style={{ transitionDelay: `${i * 18}ms` }} />
                  ))}
                </svg>
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
        </div>

        <div className={styles.ilustracion}>{children}</div>
      </section>
    </div>
  );
}
