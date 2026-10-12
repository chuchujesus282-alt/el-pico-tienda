import Link from "next/link";
import type { ResumenOpiniones } from "@/types/opiniones";
import Estrellas from "./Estrellas";

type Props = {
  resumen: ResumenOpiniones;
  /** A dónde lleva al tocarlo (sección de calificaciones o página de opiniones). */
  href: string;
};

/** Estrellas + promedio + cantidad de opiniones, bajo el título del producto. */
export default function ResumenEstrellas({ resumen, href }: Props) {
  return (
    <Link
      href={href}
      className="group inline-flex w-fit items-center gap-2 rounded-boton text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-logo-marino"
    >
      <Estrellas valor={resumen.promedio} className="size-[18px] transition-transform group-hover:scale-110" />
      {resumen.total > 0 ? (
        <>
          <span className="font-titulo font-bold text-logo-marino">{resumen.promedio.toLocaleString("es-VE")}</span>
          <span className="text-gris-texto underline-offset-2 group-hover:text-logo-marino group-hover:underline">
            ({resumen.total} {resumen.total === 1 ? "opinión" : "opiniones"})
          </span>
        </>
      ) : (
        <span className="text-gris-texto underline-offset-2 group-hover:text-logo-marino group-hover:underline">
          Sin opiniones todavía
        </span>
      )}
    </Link>
  );
}
