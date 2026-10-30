"use client";

import Link from "next/link";
import { useRef } from "react";
import { plexMono } from "@/components/tarjetas-categoria/fuentes";
import { COLORES_CLARO, EscenaTornillo, PlanoTornillo, useTornilloQueSeAtornilla } from "@/components/tarjetas-categoria/tornillo";
import styles from "./BannerTornilleria.module.css";

// Banner "Tornillería de todas las medidas", versión de LÍNEA: un tornillo en SVG animado con JavaScript propio (sin
// librerías). Portado TAL CUAL del prototipo aprobado banner-tornilleria.html. El dibujo, el plano y la animación
// (state(t), SIDE, FRONT, T_TILT, T_SCREW, T_END, TURNS, curvas, flotación) están en
// components/tarjetas-categoria/tornillo.tsx, compartidos con la tarjeta CategoryCardTornilleria (allí en azul); aquí
// va el contenedor y los colores claros (COLORES_CLARO).
// Al pasar el mouse (o con el foco del teclado) el tornillo se inclina hacia el usuario, aparece el aro y se atornilla
// dando 3 vueltas; es reversible: al salir se desatornilla y vuelve a verse de lado, flotando. En el teléfono, desplazar
// la página con el dedo sobre el banner lo anima (animarAlDesplazar).
// Diferencias con el prototipo: llena el ancho y el alto de quien lo contiene (ver el CSS); TODO el banner es un <Link>
// a la categoría y el botón es solo el indicador (como el banner del casco, BannerTrabajaProtegido: un toque en
// cualquier parte lleva a Tornillería); al pasar el mouse la raya roja se alarga y el botón sube con su sombra (mismos
// efectos que el casco); con el BANNER de 560px o menos
// el tornillo queda al lado y el texto a la escala del banner del casco (el prototipo subía la ilustración con la
// PANTALLA ≤560px), sin window.__demo ni el texto de ayuda de arriba.

type Props = {
  titulo?: string;
  descripcion?: string;
  textoBoton?: string;
  href?: string;
};

/** "Tornillos, tuercas, anclajes y fijaciones." → "tornillos, tuercas, anclajes y fijaciones" (para el aria-label). */
function enFrase(texto: string) {
  const sinPunto = texto.trim().replace(/\.$/, "");
  return sinPunto.charAt(0).toLowerCase() + sinPunto.slice(1);
}

export default function BannerTornilleria({
  titulo = "Tornillería de todas las medidas",
  descripcion = "Tornillos, tuercas, anclajes y fijaciones.",
  textoBoton = "Ver tornillería",
  href = "#tornilleria",
}: Props) {
  const bannerRef = useRef<HTMLAnchorElement>(null);
  const tornillo = useRef<SVGGElement>(null);
  const lateral = useRef<SVGGElement>(null);
  const frente = useRef<SVGGElement>(null);
  const ranura = useRef<SVGGElement>(null);
  const aro = useRef<SVGGElement>(null);
  const giro = useRef<SVGGElement>(null);
  useTornilloQueSeAtornilla({ contenedor: bannerRef, tornillo, lateral, frente, ranura, aro, giro });

  return (
    <div className={styles.contenedor}>
      <Link
        ref={bannerRef}
        href={href}
        aria-label={`${titulo}: ${enFrase(descripcion)}`}
        className={`${styles.banner} ${plexMono.variable}`}
      >
        <div className={styles.copy}>
          <div className={styles.rule} />
          <h2>{titulo}</h2>
          <p>{descripcion}</p>
          <span className={styles.btn}>
            {textoBoton}
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M6 3l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        <div className={styles.art} aria-hidden="true">
          <svg className={styles.blueprint} viewBox="0 0 280 290" preserveAspectRatio="xMidYMid meet">
            <PlanoTornillo colores={COLORES_CLARO} />
          </svg>

          <svg viewBox="0 0 280 290" preserveAspectRatio="xMidYMid meet">
            <EscenaTornillo
              colores={COLORES_CLARO}
              tornillo={tornillo}
              lateral={lateral}
              frente={frente}
              ranura={ranura}
              aro={aro}
              giro={giro}
            />
          </svg>
        </div>
      </Link>
    </div>
  );
}
