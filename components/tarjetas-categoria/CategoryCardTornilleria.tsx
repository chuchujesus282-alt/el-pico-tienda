"use client";

import Link from "next/link";
import { useRef } from "react";
import { plexMono } from "./fuentes";
import { COLORES_AZUL, EscenaTornillo, PlanoTornillo, useTornilloQueSeAtornilla } from "./tornillo";
import styles from "./CategoryCardTornilleria.module.css";

// Tarjeta de categoría "Tornillería", versión de LÍNEA: un tornillo en SVG animado con JavaScript propio (sin
// librerías). Portada TAL CUAL del prototipo aprobado tarjeta-tornilleria-vertical.html. El tornillo, el plano y la
// animación son los del banner del inicio (tornillo.tsx, compartido con BannerTornilleria), con los colores de la
// tarjeta azul (COLORES_AZUL: trazos #c3ccd8, rellenos #0e2847); aquí va la tarjeta: cuadrícula, raya roja, título,
// descripción y "Ver categoría →", con el mismo CSS que las otras.
// Plano y escena van dentro de un grupo con translate(20 -32), como el prototipo. Al pasar el mouse (o con el foco del
// teclado) el tornillo se inclina, aparece el aro y se atornilla 3 vueltas; al salir se desatornilla y vuelve de lado.
// Diferencias con el prototipo, las mismas que en las otras tarjetas: toda la tarjeta es un <Link> que sí navega (en
// el teléfono anima el toque que desplaza la página y el toque quieto entra, ver tactil.ts) y la cuadrícula se
// difumina bajo el texto; el plano no usa preserveAspectRatio="none" (a 320:420 se ve igual; así no se estira con el
// alto de 470 del inicio); sin el texto de ayuda de arriba.

type Props = {
  titulo?: string;
  descripcion?: string;
  href?: string;
  /**
   * Llena el ancho de quien la contiene y escala TODO en proporción (ej. una columna del inicio). Sin ella mide
   * 320×420, como el prototipo.
   */
  escalar?: boolean;
};

/** "Tornillos, tuercas, anclajes y fijaciones." → "tornillos, tuercas, anclajes y fijaciones" (para el aria-label). */
function enFrase(texto: string) {
  const sinPunto = texto.trim().replace(/\.$/, "");
  return sinPunto.charAt(0).toLowerCase() + sinPunto.slice(1);
}

export default function CategoryCardTornilleria({
  titulo = "Tornillería",
  descripcion = "Tornillos, tuercas, anclajes y fijaciones.",
  href = "#tornilleria",
  escalar = false,
}: Props) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const tornillo = useRef<SVGGElement>(null);
  const lateral = useRef<SVGGElement>(null);
  const frente = useRef<SVGGElement>(null);
  const ranura = useRef<SVGGElement>(null);
  const aro = useRef<SVGGElement>(null);
  const giro = useRef<SVGGElement>(null);
  useTornilloQueSeAtornilla({ contenedor: cardRef, tornillo, lateral, frente, ranura, aro, giro }, styles.on);

  const tarjeta = (
    <Link
      ref={cardRef}
      href={href}
      aria-label={`${titulo}: ${enFrase(descripcion)}`}
      className={`${styles.card} ${escalar ? styles.escalable : ""} ${plexMono.variable}`}
    >
      <svg className={styles.blueprint} viewBox="0 0 320 420" aria-hidden="true">
        <g transform="translate(20 -32)">
          <PlanoTornillo colores={COLORES_AZUL} />
        </g>
      </svg>

      <svg className={styles.scene} viewBox="0 0 320 420" aria-hidden="true">
        <g transform="translate(20 -32)">
          <EscenaTornillo
            colores={COLORES_AZUL}
            tornillo={tornillo}
            lateral={lateral}
            frente={frente}
            ranura={ranura}
            aro={aro}
            giro={giro}
          />
        </g>
      </svg>

      <div className={styles.copy}>
        <div className={styles.rule} />
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
        <div className={styles.cta}>
          Ver categoría <span>→</span>
        </div>
      </div>
    </Link>
  );

  // Para escalar, el ancho de referencia (100cqw) es el de este contenedor.
  return escalar ? <div className={styles.contenedor}>{tarjeta}</div> : tarjeta;
}
