import { Bolt, Drill, Hammer, PaintRoller, Ruler, Wrench } from "lucide-react";

// Centro del margen lateral libre: (ancho de pantalla − Contenedor de 96rem) / 4, menos medio ícono (4rem).
const izquierda = "left-[calc((100vw-96rem)/4-4rem)]";
const derecha = "right-[calc((100vw-96rem)/4-4rem)]";
// Cada ícono se mece muy despacio (animate-deriva), con retrasos distintos para que no vayan a la par.
const trazo = "absolute size-32 text-pico-azul/10 motion-safe:animate-deriva";

/**
 * Herramientas en trazo fino, muy tenues, en los márgenes laterales del fondo (mismo estilo de línea que
 * los íconos de los banners). Solo en pantallas muy anchas (desde 1800px), donde sobra margen a los lados;
 * en el resto no se dibujan. Decorativo: no recibe clics ni lo leen los lectores de pantalla.
 */
export default function FondoHerramientas() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-[1] hidden min-[1800px]:block" aria-hidden>
      <Wrench className={`${trazo} ${izquierda} top-[20%]`} strokeWidth={1} />
      <Ruler className={`${trazo} ${izquierda} top-[48%] [animation-delay:-5s]`} strokeWidth={1} />
      <PaintRoller className={`${trazo} ${izquierda} top-[76%] [animation-delay:-9s]`} strokeWidth={1} />
      <Hammer className={`${trazo} ${derecha} top-[30%] [animation-delay:-3s]`} strokeWidth={1} />
      <Bolt className={`${trazo} ${derecha} top-[58%] [animation-delay:-7s]`} strokeWidth={1} />
      <Drill className={`${trazo} ${derecha} top-[84%] [animation-delay:-11s]`} strokeWidth={1} />
    </div>
  );
}
