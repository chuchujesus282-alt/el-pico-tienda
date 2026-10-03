import Image from "next/image";
import { Wrench } from "lucide-react";

type Props = {
  src: string | null;
  alt: string;
  /** Atributo sizes de next/image según dónde se muestre. */
  sizes: string;
  className?: string;
};

/** Imagen cuadrada de producto; sin imagen muestra el placeholder gris con una herramienta. */
export default function ImagenProducto({ src, alt, sizes, className = "" }: Props) {
  return (
    <div className={`relative aspect-square overflow-hidden bg-pico-blanco ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} className="object-contain p-3" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gris-fondo text-gris-texto/50">
          <Wrench className="h-1/3 w-1/3" strokeWidth={1.5} aria-hidden />
          <span className="sr-only">{alt} (sin imagen)</span>
        </div>
      )}
    </div>
  );
}
