import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  actual: string;
};

/** Inicio › Nombre de categoría. */
export default function Breadcrumb({ actual }: Props) {
  return (
    <nav aria-label="Ruta de navegación" className="text-[13px] text-gris-texto">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="hover:text-pico-azul hover:underline">
            Inicio
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="size-3.5" />
        </li>
        <li aria-current="page" className="font-medium text-texto">
          {actual}
        </li>
      </ol>
    </nav>
  );
}
