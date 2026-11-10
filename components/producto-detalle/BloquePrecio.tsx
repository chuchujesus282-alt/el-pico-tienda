import Precio from "@/components/ui/Precio";
import { formatearBs } from "@/lib/formato";
import type { Producto } from "@/types/catalogo";

const tasaVE = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Precio de la página de producto: la cifra manda, sin caja ni franja; en Bs (productos de Saint) y la nota debajo.
 * Lo usan la página (producto suelto) y CompraConVariantes (cambia con la medida elegida).
 */
export default function BloquePrecio({ producto }: { producto: Producto }) {
  return (
    // En el teléfono, más corto: el precio, los bolívares y nada más (la tasa y la nota, solo en PC).
    <div className="md:border-y md:border-gris-borde md:py-4">
      <Precio valor={producto.precio} tamano="grande" tono="logo" className="text-[2rem] tracking-tight tabular-nums md:text-5xl" />
      {/* Productos de Saint: también en bolívares (con IVA), con la tasa BCV que usó Saint. */}
      {producto.precioBs !== undefined && producto.tasa !== undefined && (
        <p className="mt-0.5 text-[15px] font-semibold text-texto tabular-nums md:mt-1 md:text-base">
          {formatearBs(producto.precioBs)}{" "}
          <span className="hidden text-[13px] font-normal text-gris-texto md:inline">· Tasa BCV {tasaVE.format(producto.tasa)} Bs/$</span>
          <span className="text-[13px] font-normal text-gris-texto md:hidden">· IVA incluido</span>
        </p>
      )}
      <p className="mt-1.5 hidden text-[13px] text-gris-texto md:block">
        {producto.precioBs !== undefined ? "Precio referencial, IVA incluido" : "Precio referencial en dólares"} · No cobramos en la web.
      </p>
    </div>
  );
}
