import Link from "next/link";
import { ChevronRight, House } from "lucide-react";

type Props = {
  actual: string;
};

/** Inicio › Nombre de categoría. */
export default function Breadcrumb({ actual }: Props) {
  return (
    <nav aria-label="Ruta de navegación" className="text-[13px] text-gris-texto">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="inline-flex items-center gap-1 hover:text-logo-marino hover:underline">
            <House className="size-3.5" aria-hidden />
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
