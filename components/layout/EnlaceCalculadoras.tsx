"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import IconoCalculadora from "@/components/icons/pico/IconoCalculadora";
import { claseAccionHeader, estaEn } from "./accionHeader";

/** "Calculadoras" del header: queda marcado mientras estás en /calculadoras o en una calculadora. */
export default function EnlaceCalculadoras() {
  const activo = estaEn(usePathname(), "/calculadoras");
  return (
    <Link href="/calculadoras" aria-current={activo ? "page" : undefined} className={`flex ${claseAccionHeader(activo)}`}>
      <IconoCalculadora className="size-7" />
      <span className="sr-only lg:not-sr-only">Calculadoras</span>
    </Link>
  );
}
