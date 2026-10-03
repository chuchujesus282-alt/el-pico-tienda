import Link from "next/link";
import { Hammer } from "lucide-react";

/** Logo provisional de texto hasta tener el archivo oficial en public/. Pensado para fondo azul. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex shrink-0 items-center gap-2 text-pico-blanco ${className}`} aria-label="El Pico, ir al inicio">
      <span className="flex size-9 items-center justify-center rounded-boton bg-pico-rojo">
        <Hammer className="size-5" aria-hidden />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[10px] font-semibold tracking-[0.15em] text-pico-blanco/70 uppercase">Centro Ferretero</span>
        <span className="text-xl font-extrabold tracking-tight">El Pico</span>
      </span>
    </Link>
  );
}
