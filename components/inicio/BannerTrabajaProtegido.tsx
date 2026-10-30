"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { EscenaCasco, PlanoCasco, useCascoQueCae } from "@/components/tarjetas-categoria/casco";
import { plexMono } from "@/components/tarjetas-categoria/fuentes";
import styles from "./BannerTrabajaProtegido.module.css";

// Banner "Trabaja protegido", versión de LÍNEA: el casco es un ícono de línea en SVG animado con JavaScript propio
// (sin librerías). Portado TAL CUAL del prototipo aprobado banner-trabaja-protegido.html. El dibujo, el plano y la
// física (G, TOP, Y0, LIFE, DROPS, objState(), helmetKick(), startBob, flotación) están en
// components/tarjetas-categoria/casco.tsx, compartidos con la tarjeta de categoría CategoryCardSeguridad; aquí solo
// va el contenedor (texto, botón y su CSS).
// Al pasar el mouse (o con el foco del teclado) caen un bloque, un martillo y una llave inglesa sobre el casco, que se
// hunde y se balancea en cada golpe; los objetos rebotan y salen por abajo a la derecha. Corre UNA vez por entrada y
// siempre termina; no se rebobina.
// Diferencias con el prototipo, acordadas: todo el banner es un <Link> a la categoría y el botón es solo el indicador
// (en el teléfono anima el toque que desplaza la página y el toque quieto entra, como las tarjetas de categoría, ver
// tactil.ts); título más grande (44px); con el BANNER de 560px o menos (no la pantalla: en el inicio va en media
// columna) la ilustración queda al lado, más chica, y el texto a la escala de Tornillería, para medir lo mismo que ese
// banner (el prototipo la subía arriba); llena el ancho de quien lo contiene (el prototipo medía hasta 620px); sin
// window.__demo ni el texto de ayuda de arriba.

type Props = {
  titulo?: string;
  descripcion?: string;
  textoBoton?: string;
  href?: string;
};

/** "Cascos, guantes… en cada obra." → "cascos, guantes… en cada obra" (para el aria-label). */
function enFrase(texto: string) {
  const sinPunto = texto.trim().replace(/\.$/, "");
  return sinPunto.charAt(0).toLowerCase() + sinPunto.slice(1);
}

export default function BannerTrabajaProtegido({
  titulo = "Trabaja protegido",
  descripcion = "Cascos, guantes, botas y mascarillas de seguridad industrial.",
  textoBoton = "Ver seguridad",
  href = "#seguridad",
}: Props) {
  // Id único para el clipPath: no choca con otros SVG de la página.
  const idClip = `domeClip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const bannerRef = useRef<HTMLAnchorElement>(null);
  const casco = useRef<SVGGElement>(null);
  const golpe = useRef<SVGGElement>(null);
  const bloque = useRef<SVGGElement>(null);
  const martillo = useRef<SVGGElement>(null);
  const llave = useRef<SVGGElement>(null);
  useCascoQueCae({ contenedor: bannerRef, casco, golpe, objetos: [bloque, martillo, llave] });

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
            <PlanoCasco />
          </svg>

          <svg className={styles.scene} viewBox="0 0 280 290" preserveAspectRatio="xMidYMid meet">
            <EscenaCasco idClip={idClip} casco={casco} golpe={golpe} bloque={bloque} martillo={martillo} llave={llave} />
          </svg>
        </div>
      </Link>
    </div>
  );
}
