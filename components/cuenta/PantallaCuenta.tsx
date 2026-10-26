import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Montanas } from "@/components/layout/Logo";
import Contenedor from "@/components/ui/Contenedor";

/**
 * Marco de las pantallas cortas de la cuenta (recuperar la contraseña, elegir una nueva, confirmar el correo):
 * pantalla completa como /crear-cuenta, con las montañas, el título y una columna centrada.
 * Las rutas van en components/layout/pantallaCompleta.ts.
 */
export default function PantallaCuenta({
  titulo,
  descripcion,
  volver = { href: "/iniciar-sesion", texto: "Volver a iniciar sesión" },
  children,
}: {
  titulo: string;
  descripcion: ReactNode;
  volver?: { href: string; texto: string };
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-pico-blanco">
      <Contenedor className="flex w-full flex-1 flex-col pt-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:pb-16">
        <Link
          href={volver.href}
          className="area-tactil inline-flex items-center gap-1 self-start text-[15px] font-semibold text-pico-azul underline-offset-4 hover:underline"
        >
          <ChevronLeft className="size-5" aria-hidden />
          {volver.texto}
        </Link>

        <div className="mx-auto my-auto w-full max-w-lg pt-8">
          <div className="text-center">
            <Montanas className="mx-auto h-14 w-auto fill-pico-rojo motion-safe:animate-caer md:h-16" />
            <h1 className="mt-6 text-3xl font-bold text-balance text-pico-azul motion-safe:animate-aparecer [animation-delay:120ms] md:text-4xl">
              {titulo}
            </h1>
            <p className="mt-4 text-base text-pretty text-gris-texto motion-safe:animate-aparecer [animation-delay:190ms]">{descripcion}</p>
          </div>

          {children && <div className="mt-8 motion-safe:animate-aparecer [animation-delay:260ms] md:mt-10">{children}</div>}
        </div>
      </Contenedor>
    </div>
  );
}
