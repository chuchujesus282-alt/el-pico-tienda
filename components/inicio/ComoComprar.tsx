import { pasosCompra } from "./contenidoInicio";

/** Franja que explica el modelo de compra: no se cobra en la web, el pedido se cierra por WhatsApp. */
export default function ComoComprar() {
  return (
    <section
      aria-labelledby="como-comprar"
      className="flex flex-col gap-4 rounded-banner bg-pico-azul-claro p-5 md:p-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8"
    >
      <div className="lg:w-60 lg:shrink-0">
        <h2 id="como-comprar" className="text-xl font-extrabold tracking-tight text-pico-azul md:text-2xl">
          Así compras en El Pico
        </h2>
        <p className="mt-1 text-[13px] text-pico-azul/75">No cobramos en la web. Los precios son referenciales, en dólares.</p>
      </div>

      <ol className="grid flex-1 gap-3 md:grid-cols-3 md:gap-6">
        {pasosCompra.map((paso, i) => (
          <li key={paso.titulo} className="flex items-start gap-3">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-chip bg-pico-azul text-sm font-bold text-pico-blanco tabular-nums"
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-pico-azul">{paso.titulo}</p>
              <p className="text-[13px] leading-snug text-pico-azul/75">{paso.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
