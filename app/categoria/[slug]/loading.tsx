import GrillaProductos from "@/components/producto/GrillaProductos";
import Contenedor from "@/components/ui/Contenedor";

/** Estado "cargando": misma distribución que la página, con esqueletos de ProductCard. */
export default function CargandoCategoria() {
  return (
    <Contenedor className="py-6 md:py-8">
      <div className="animate-pulse" aria-hidden>
        <div className="h-4 w-40 rounded bg-gris-borde" />
        <div className="mt-4 h-32 rounded-banner bg-gris-borde md:h-44 lg:h-52" />
        <div className="mt-8 mb-4 h-7 w-56 rounded bg-gris-borde md:mt-12" />
      </div>
      <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-6">
        <div className="hidden h-80 animate-pulse rounded-tarjeta bg-gris-borde lg:block" aria-hidden />
        <div>
          <div className="mb-4 flex justify-end">
            <div className="h-10 w-48 animate-pulse rounded-boton bg-gris-borde" aria-hidden />
          </div>
          <GrillaProductos productos={[]} cargando />
          <p className="sr-only" role="status">
            Cargando productos…
          </p>
        </div>
      </div>
    </Contenedor>
  );
}
