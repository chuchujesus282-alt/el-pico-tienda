"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { EscenaCasco, PlanoCasco, useCascoQueCae } from "./casco";
import { plexMono } from "./fuentes";
import styles from "./CategoryCardSeguridad.module.css";

// Tarjeta de categoría "Seguridad industrial", versión de LÍNEA: el casco es un ícono de línea en SVG animado con
// JavaScript propio (sin librerías). Portada TAL CUAL del prototipo aprobado tarjeta-seguridad-industrial.html. El
// casco, el plano y la física son los del banner del inicio (casco.tsx, compartido con BannerTrabajaProtegido); aquí
// va la tarjeta: cuadrícula, raya roja, título, descripción y "Ver categoría →", con el mismo CSS que las otras.
// Plano y escena van dentro de un grupo con translate(20 -32), como el prototipo, para que el casco no choque con el
// título. Al pasar el mouse (o con el foco del teclado) caen el bloque, el martillo y la llave; corre UNA vez por
// entrada y siempre termina aunque el mouse salga; no se rebobina.
// Diferencias con el prototipo, las mismas que en las otras tarjetas: toda la tarjeta es un <Link> que sí navega (en
// el teléfono anima el toque que desplaza la página, ver tactil.ts) y la cuadrícula se difumina bajo el texto; el
// plano no usa preserveAspectRatio="none" (a 320:420 se ve igual; así no se estira con el alto de 470 del inicio);
// sin el texto de ayuda de arriba.

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

/** "Cascos, guantes, botas y mascarillas." → "cascos, guantes, botas y mascarillas" (para el aria-label). */
function enFrase(texto: string) {
  const sinPunto = texto.trim().replace(/\.$/, "");
  return sinPunto.charAt(0).toLowerCase() + sinPunto.slice(1);
}

export default function CategoryCardSeguridad({
  titulo = "Seguridad industrial",
  descripcion = "Cascos, guantes, botas y mascarillas.",
  href = "#seguridad",
  escalar = false,
}: Props) {
  // Id único para el clipPath: no choca con otros SVG de la página (el banner del casco puede estar en la misma).
  const idClip = `domeClip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const cardRef = useRef<HTMLAnchorElement>(null);
  const casco = useRef<SVGGElement>(null);
  const golpe = useRef<SVGGElement>(null);
  const bloque = useRef<SVGGElement>(null);
  const martillo = useRef<SVGGElement>(null);
  const llave = useRef<SVGGElement>(null);
  useCascoQueCae({ contenedor: cardRef, casco, golpe, objetos: [bloque, martillo, llave] }, styles.on);

  const tarjeta = (
    <Link
      ref={cardRef}
      href={href}
      aria-label={`${titulo}: ${enFrase(descripcion)}`}
      className={`${styles.card} ${escalar ? styles.escalable : ""} ${plexMono.variable}`}
    >
      <svg className={styles.blueprint} viewBox="0 0 320 420" aria-hidden="true">
        <g transform="translate(20 -32)">
          <PlanoCasco />
        </g>
      </svg>

      <svg className={styles.scene} viewBox="0 0 320 420" aria-hidden="true">
        <g transform="translate(20 -32)">
          <EscenaCasco idClip={idClip} casco={casco} golpe={golpe} bloque={bloque} martillo={martillo} llave={llave} />
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
