import GrillaProductos from "@/components/producto/GrillaProductos";
import Contenedor from "@/components/ui/Contenedor";

/** Estado "cargando": misma distribución que la página, con esqueletos de ProductCard. */
export default function CargandoCategoria() {
  return (
    <>
      {/* Misma franja azul del encabezado de la página. */}
      <div className="h-40 animate-pulse bg-pico-azul md:h-52" aria-hidden />
      <Contenedor className="py-6 md:py-10">
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
        <div className="hidden h-80 animate-pulse rounded-banner bg-gris-borde lg:block" aria-hidden />
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
    </>
  );
}
