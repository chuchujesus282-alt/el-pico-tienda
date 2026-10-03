import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variante = "primario" | "secundario";

type PropsBase = {
  variante?: Variante;
  anchoCompleto?: boolean;
  className?: string;
  children: ReactNode;
};

type PropsBoton = PropsBase & Omit<ComponentProps<"button">, keyof PropsBase> & { href?: undefined };
type PropsEnlace = PropsBase & Omit<ComponentProps<typeof Link>, keyof PropsBase> & { href: string };

const estilos: Record<Variante, string> = {
  primario: "bg-pico-rojo text-pico-blanco hover:bg-pico-rojo-oscuro",
  secundario:
    "border border-pico-azul text-pico-azul bg-pico-blanco hover:bg-pico-azul hover:text-pico-blanco",
};

function clases({ variante = "primario", anchoCompleto, className }: PropsBase) {
  return [
    "inline-flex h-10 items-center justify-center gap-2 rounded-boton px-4 text-sm font-semibold",
    "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul",
    "disabled:cursor-not-allowed disabled:opacity-50",
    estilos[variante],
    anchoCompleto ? "w-full" : "",
    className ?? "",
  ].join(" ");
}

/** Botón de la tienda. Con `href` se comporta como enlace. */
export default function Boton(props: PropsBoton | PropsEnlace) {
  const { variante, anchoCompleto, className, children, ...resto } = props;
  const clase = clases({ variante, anchoCompleto, className, children });

  if (resto.href !== undefined) {
    return (
      <Link {...(resto as Omit<PropsEnlace, keyof PropsBase>)} className={clase}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" {...(resto as Omit<PropsBoton, keyof PropsBase>)} className={clase}>
      {children}
    </button>
  );
}
