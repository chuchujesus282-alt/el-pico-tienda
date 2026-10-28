import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  titulo: ReactNode;
  /** Una línea bajo el título (opcional). */
  descripcion?: ReactNode;
  /** Número junto al título (ej. cuántos favoritos o direcciones); late cuando cambia. */
  contador?: number;
  /** Botón o enlace principal, a la derecha (abajo en el teléfono). */
  acciones?: ReactNode;
  /** Enlace para volver, arriba del título. */
  volver?: { href: string; texto: string };
  /** Algo más bajo la descripción (ej. los pasos de las calculadoras). */
  children?: ReactNode;
  className?: string;
};

/**
 * Título liviano de una página de servicio (favoritos, direcciones, cuenta, calculadoras, ubícanos): reemplaza al
 * banner azul de EncabezadoPagina donde persona B lo quitó. Sin caja: la raya roja inclinada de la marca se dibuja al
 * entrar (animate-trazo), el título en azul marino, una frase corta y la acción principal a la derecha.
 * Es el h1 de la página. Sirve en componentes de servidor y de cliente (no usa hooks).
 */
export default function TituloPagina({ titulo, descripcion, contador, acciones, volver, children, className = "" }: Props) {
  return (
    <header className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 ${className}`}>
      <div className="min-w-0">
        {volver && (
          <Link
            href={volver.href}
            className="group area-tactil mb-3 inline-flex items-center gap-1.5 rounded-boton text-sm font-semibold text-pico-azul/80 transition-colors hover:text-pico-azul"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 motion-safe:group-hover:-translate-x-1" aria-hidden />
            {volver.texto}
          </Link>
        )}
        <span className="mb-3 block h-1.5 w-12 origin-left -skew-x-[18deg] rounded-[2px] bg-pico-rojo motion-safe:animate-trazo" aria-hidden />
        <h1 className="flex flex-wrap items-center gap-3 text-[1.75rem] leading-tight font-bold tracking-tight text-pico-azul motion-safe:animate-aparecer md:text-4xl">
          {titulo}
          {contador !== undefined && contador > 0 && (
            <span
              key={contador}
              className="inline-flex h-8 min-w-8 items-center justify-center rounded-chip bg-pico-azul px-2.5 text-base font-bold text-pico-blanco tabular-nums shadow-tarjeta motion-safe:animate-latido md:h-9 md:min-w-9"
            >
              {contador}
            </span>
          )}
        </h1>
        {descripcion && (
          <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-gris-texto motion-safe:animate-aparecer motion-safe:[animation-delay:80ms] md:text-base">
            {descripcion}
          </p>
        )}
        {children && <div className="mt-4 motion-safe:animate-aparecer motion-safe:[animation-delay:140ms]">{children}</div>}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap gap-2 motion-safe:animate-aparecer motion-safe:[animation-delay:120ms]">{acciones}</div>}
    </header>
  );
}
