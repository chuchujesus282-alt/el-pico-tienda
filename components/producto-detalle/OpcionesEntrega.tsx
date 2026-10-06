import { Bike, Store, Truck } from "lucide-react";

const opciones = [
  { icono: Bike, titulo: "Delivery", texto: "Te lo llevamos a tu casa u obra." },
  { icono: Truck, titulo: "Fletes", texto: "Para pedidos grandes y materiales pesados." },
  { icono: Store, titulo: "Pick-up en tienda", texto: "Retira tu pedido cuando esté listo." },
];

/** Formas de entrega. Zonas y costos se coordinan por WhatsApp (no inventar tiempos ni tarifas). */
export default function OpcionesEntrega() {
  return (
    <section aria-labelledby="titulo-entrega" className="rounded-banner bg-pico-azul-claro p-4 md:p-5">
      <h2 id="titulo-entrega" className="text-sm font-bold text-pico-azul">
        ¿Cómo lo recibes?
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
        {opciones.map(({ icono: Icono, titulo, texto }) => (
          <li key={titulo} className="flex items-start gap-3 sm:flex-col sm:gap-2 md:flex-row md:gap-3 lg:flex-col lg:gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-chip bg-pico-azul text-pico-blanco">
              <Icono className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-pico-azul">{titulo}</p>
              <p className="text-[13px] leading-snug text-pico-azul/75">{texto}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] text-pico-azul/75">Zonas y costos de envío se coordinan por WhatsApp.</p>
    </section>
  );
}
