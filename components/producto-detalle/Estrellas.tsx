import { Star } from "lucide-react";

type Props = {
  /** De 0 a 5; admite decimales (4,3 pinta 4 estrellas y un 30 % de la quinta). */
  valor: number;
  className?: string;
};

/** Cinco estrellas de solo lectura. */
export default function Estrellas({ valor, className = "size-4" }: Props) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${valor.toLocaleString("es-VE")} de 5 estrellas`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const relleno = Math.max(0, Math.min(1, valor - i)) * 100;
        return (
          <span key={i} className="relative inline-flex" aria-hidden>
            <Star className={`${className} fill-gris-borde text-gris-borde`} strokeWidth={1.5} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${relleno}%` }}>
              <Star className={`${className} fill-estrella text-estrella`} strokeWidth={1.5} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
