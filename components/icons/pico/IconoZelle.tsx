import type { PropsIcono } from "./IconoBase";

/**
 * Zelle: logo oficial (descargado de zelle.com/press, en public/pagos/). En reposo se pinta con el color
 * del texto (máscara, como un ícono más); elegido, sale el logo morado oficial sobre una pastilla blanca.
 */
export default function IconoZelle({ className = "size-7", titulo }: PropsIcono) {
  return (
    <span
      className={`icono-pico logo-pago relative inline-block shrink-0 ${className}`}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      <span
        className="logo-pago-mono absolute inset-0 bg-current transition-opacity duration-300"
        style={{
          maskImage: "url(/pagos/zelle-blanco.png)",
          WebkitMaskImage: "url(/pagos/zelle-blanco.png)",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
      <span className="logo-pago-color absolute -inset-x-1 inset-y-[22%] flex items-center justify-center rounded-md bg-pico-blanco px-0.5 opacity-0 transition-opacity duration-300">
        {/* eslint-disable-next-line @next/next/no-img-element -- logo oficial pequeño; no hace falta optimizarlo */}
        <img src="/pagos/zelle-morado.png" alt="" className="h-full w-auto object-contain" />
      </span>
    </span>
  );
}
