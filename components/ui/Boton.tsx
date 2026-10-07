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
  primario: "bg-pico-rojo text-pico-blanco hover:bg-pico-rojo-oscuro hover:shadow-boton-hover",
  secundario:
    "border-2 border-pico-azul text-pico-azul bg-pico-blanco hover:bg-pico-azul hover:text-pico-blanco hover:shadow-boton-hover",
};

function clases({ variante = "primario", anchoCompleto, className }: PropsBase) {
  return [
    "group/boton relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-boton px-4 text-sm font-semibold",
    "transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    estilos[variante],
    anchoCompleto ? "w-full" : "",
    className ?? "",
  ].join(" ");
}

/** Destello que cruza el botón rojo al pasar el mouse. */
function Brillo() {
  return (
    <span
      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-pico-blanco/25 transition-transform duration-700 ease-out motion-safe:group-hover/boton:translate-x-[450%]"
      aria-hidden
    />
  );
}

/** Botón de la tienda. Con `href` se comporta como enlace. */
export default function Boton(props: PropsBoton | PropsEnlace) {
  const { variante, anchoCompleto, className, children, ...resto } = props;
  const clase = clases({ variante, anchoCompleto, className, children });
  const brillo = (variante ?? "primario") === "primario" ? <Brillo /> : null;

  if (resto.href !== undefined) {
    return (
      <Link {...(resto as Omit<PropsEnlace, keyof PropsBase>)} className={clase}>
        {brillo}
        {children}
      </Link>
    );
  }
  return (
    <button type="button" {...(resto as Omit<PropsBoton, keyof PropsBase>)} className={clase}>
      {brillo}
      {children}
    </button>
  );
}
