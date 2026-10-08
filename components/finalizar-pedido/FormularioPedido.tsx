"use client";

import { useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Banknote,
  Bike,
  CircleDollarSign,
  CalendarClock,
  Check,
  Landmark,
  Layers,
  MapPin,
  MessageCircle,
  Send,
  ShoppingCart,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import { tituloProducto } from "@/lib/formato";
import ImagenProducto from "@/components/producto/ImagenProducto";
import Precio from "@/components/ui/Precio";
import { registrarSenales } from "@/lib/recomendaciones/almacenPerfil";
import { enlaceWhatsApp, totalCarrito } from "@/lib/whatsapp";
import type { ItemCarrito } from "@/types/carrito";
import type { Direccion } from "@/types/cliente";
import Opcion from "./Opcion";
import {
  armarMensajeFinal,
  type FormaRetiro,
  FORMAS_RETIRO,
  METODOS_COMBINABLES,
  METODOS_PAGO,
  type MetodoPago,
} from "./pedido";

type Props = {
  /** "Comprar ahora": solo ese producto. Sin esto, el pedido es el carrito. */
  itemsDirectos: ItemCarrito[] | null;
  direcciones: Direccion[];
};

const iconosRetiro: Record<FormaRetiro, ReactNode> = {
  pickup: <Store className="size-4" aria-hidden />,
  delivery: <Bike className="size-4" aria-hidden />,
  flete: <Truck className="size-4" aria-hidden />,
};

const iconosPago: Record<MetodoPago, ReactNode> = {
  divisas: <Banknote className="size-4" aria-hidden />,
  "pago-movil": <Smartphone className="size-4" aria-hidden />,
  transferencia: <Landmark className="size-4" aria-hidden />,
  cashea: <CalendarClock className="size-4" aria-hidden />,
  zelle: <Send className="size-4" aria-hidden />,
  usdt: <CircleDollarSign className="size-4" aria-hidden />,
  combinado: <Layers className="size-4" aria-hidden />,
};

const sinSuscripcion = () => () => {};

/** Círculo de paso: número mientras falta, ✓ animado cuando está completo. */
function MarcaPaso({ numero, completo }: { numero: number; completo: boolean }) {
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-chip font-titulo text-sm font-bold transition-colors duration-300 ${
        completo ? "bg-logo-marino text-pico-blanco" : "border-2 border-logo-marino/30 bg-pico-blanco text-logo-marino"
      }`}
    >
      {completo ? <Check key="ok" className="size-4 motion-safe:animate-latido" strokeWidth={3} /> : numero}
    </span>
  );
}

/** Indicador de avance: Retiro → Pago → Enviar. */
function Pasos({ estados }: { estados: [boolean, boolean, boolean] }) {
  const nombres = ["Retiro", "Pago", "Enviar"];
  return (
    <ol className="mb-5 flex items-center rounded-banner border border-gris-borde bg-pico-blanco px-4 py-3 shadow-tarjeta md:px-6" aria-label="Avance del pedido">
      {nombres.map((nombre, i) => (
        <li key={nombre} className={`flex items-center ${i < nombres.length - 1 ? "flex-1" : ""}`}>
          <span className="flex items-center gap-2">
            <MarcaPaso numero={i + 1} completo={estados[i]} />
            <span className={`text-sm font-semibold ${estados[i] ? "text-logo-marino" : "text-gris-texto"}`}>{nombre}</span>
            <span className="sr-only">{estados[i] ? "(listo)" : "(pendiente)"}</span>
          </span>
          {i < nombres.length - 1 && (
            <span className="mx-3 h-1 flex-1 overflow-hidden rounded-chip bg-gris-fondo" aria-hidden>
              <span
                className="block h-full rounded-chip bg-logo-marino transition-[width] duration-500 ease-out"
                style={{ width: estados[i] ? "100%" : "0%" }}
              />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function Seccion({ numero, titulo, completo, children }: { numero: number; titulo: string; completo: boolean; children: ReactNode }) {
  return (
    <fieldset
      className={`rounded-banner border-2 bg-pico-blanco p-4 shadow-tarjeta transition-colors duration-300 motion-safe:animate-aparecer md:p-6 ${
        completo ? "border-logo-marino/25" : "border-transparent"
      }`}
      style={{ animationDelay: `${numero * 80}ms` }}
    >
      <legend className="sr-only">{titulo}</legend>
      <div className="mb-4 flex items-center gap-3" aria-hidden>
        <MarcaPaso numero={numero} completo={completo} />
        <h2 className="font-titulo text-xl font-bold text-logo-marino">{titulo}</h2>
      </div>
      {children}
    </fieldset>
  );
}

/** Destello que cruza el botón al pasar el mouse (igual que en la página de producto). */
function Brillo() {
  return (
    <span
      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-pico-blanco/25 transition-transform duration-700 ease-out motion-safe:group-hover:translate-x-[450%]"
      aria-hidden
    />
  );
}

/** Pantalla de cierre: forma de retiro + método de pago → mensaje armado por WhatsApp. */
export default function FormularioPedido({ itemsDirectos, direcciones }: Props) {
  const carrito = useCarrito();
  // El carrito vive en el navegador: hasta montar no se sabe si está vacío.
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);

  const [retiro, setRetiro] = useState<FormaRetiro | null>(null);
  const [direccionId, setDireccionId] = useState<string | null>(null);
  const [pago, setPago] = useState<MetodoPago | null>(null);
  const [combinados, setCombinados] = useState<MetodoPago[]>([]);

  const items = itemsDirectos ?? carrito.items;
  const unidades = items.reduce((suma, i) => suma + i.cantidad, 0);
  const necesitaDireccion = retiro === "delivery" || retiro === "flete";
  const direccion = direcciones.find((d) => d.id === direccionId) ?? null;

  const retiroListo = !!retiro && (!necesitaDireccion || !!direccion);
  const pagoListo = !!pago && (pago !== "combinado" || combinados.length >= 2);
  const listo = retiroListo && pagoListo && items.length > 0;

  const faltantes = [
    !retiro && "elige cómo retiras",
    necesitaDireccion && !direccion && "elige la dirección de entrega",
    !pago && "elige el método de pago",
    pago === "combinado" && combinados.length < 2 && "marca al menos dos métodos para el pago combinado",
  ].filter((f): f is string => !!f);

  const alternarCombinado = (valor: MetodoPago) =>
    setCombinados((actuales) =>
      actuales.includes(valor) ? actuales.filter((v) => v !== valor) : [...actuales, valor],
    );

  const etiquetaRetiro = FORMAS_RETIRO.find((f) => f.valor === retiro)?.etiqueta;
  const etiquetaPago =
    pago === "combinado"
      ? combinados.map((c) => METODOS_PAGO.find((m) => m.valor === c)?.etiqueta).join(" + ") || "Pago combinado"
      : METODOS_PAGO.find((m) => m.valor === pago)?.etiqueta;

  if (!itemsDirectos && !montado) {
    return <div className="h-96 animate-pulse rounded-banner bg-gris-borde" aria-hidden />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-banner border border-gris-borde bg-pico-blanco px-6 py-14 text-center shadow-tarjeta motion-safe:animate-aparecer">
        <span className="flex size-20 items-center justify-center rounded-chip bg-logo-marino-claro">
          <ShoppingCart className="size-10 text-logo-marino" strokeWidth={1.5} aria-hidden />
        </span>
        <p className="font-titulo text-2xl font-bold text-logo-marino">Tu carrito está vacío</p>
        <p className="text-[13px] text-gris-texto">Agrega productos del catálogo para armar tu pedido.</p>
        <Link
          href="/"
          className="group relative mt-2 inline-flex h-11 items-center gap-2 overflow-hidden rounded-boton bg-logo-rojo px-5 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-logo-rojo-oscuro hover:shadow-boton-hover motion-safe:hover:-translate-y-0.5"
        >
          <Brillo />
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <>
      <Pasos estados={[retiroListo, pagoListo, listo]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <Seccion numero={1} titulo="¿Cómo retiras?" completo={retiroListo}>
            <div className="grid gap-3 sm:auto-rows-fr sm:grid-cols-3">
              {FORMAS_RETIRO.map((forma) => (
                <Opcion
                  key={forma.valor}
                  tipo="radio"
                  nombre="retiro"
                  valor={forma.valor}
                  marcada={retiro === forma.valor}
                  alCambiar={() => setRetiro(forma.valor)}
                  icono={iconosRetiro[forma.valor]}
                  titulo={forma.etiqueta}
                  detalle={forma.detalle}
                />
              ))}
            </div>

            {necesitaDireccion && (
              <div className="mt-5 rounded-tarjeta bg-gris-fondo p-3 motion-safe:animate-aparecer md:p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-logo-marino">
                  <MapPin className="size-4" aria-hidden />
                  ¿A cuál de tus direcciones?
                </p>
                <div className="grid gap-3 md:auto-rows-fr md:grid-cols-2">
                  {direcciones.map((d) => (
                    <Opcion
                      key={d.id}
                      tipo="radio"
                      nombre="direccion"
                      valor={d.id}
                      marcada={direccionId === d.id}
                      alCambiar={() => setDireccionId(d.id)}
                      titulo={d.alias}
                      detalle={
                        <>
                          {d.direccion}, {d.zona}
                          {d.referencia && <span className="block">Ref.: {d.referencia}</span>}
                        </>
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </Seccion>

          <Seccion numero={2} titulo="Método de pago" completo={pagoListo}>
            {/* Seis métodos en filas parejas (2 o 3 por fila) y "Pago combinado" a lo ancho debajo. */}
            <div className="grid grid-cols-2 gap-2.5 sm:auto-rows-fr sm:gap-3 lg:grid-cols-3">
              {METODOS_PAGO.map((metodo) => (
                <Opcion
                  key={metodo.valor}
                  tipo="radio"
                  nombre="pago"
                  valor={metodo.valor}
                  marcada={pago === metodo.valor}
                  alCambiar={() => setPago(metodo.valor)}
                  icono={iconosPago[metodo.valor]}
                  titulo={metodo.etiqueta}
                  detalle={metodo.valor === "combinado" ? "Divide el total entre dos o más métodos." : undefined}
                  className={metodo.valor === "combinado" ? "col-span-full" : ""}
                />
              ))}
            </div>

            {pago === "combinado" && (
              <div className="mt-5 rounded-tarjeta bg-gris-fondo p-3 motion-safe:animate-aparecer md:p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-logo-marino">
                  <Layers className="size-4" aria-hidden />
                  ¿Cuáles vas a combinar?
                  <span className="font-normal text-gris-texto">(mínimo dos)</span>
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:auto-rows-fr sm:gap-3 lg:grid-cols-3">
                  {METODOS_COMBINABLES.map((metodo) => (
                    <Opcion
                      key={metodo.valor}
                      tipo="checkbox"
                      nombre="combinados"
                      valor={metodo.valor}
                      marcada={combinados.includes(metodo.valor)}
                      alCambiar={() => alternarCombinado(metodo.valor)}
                      icono={iconosPago[metodo.valor]}
                      titulo={metodo.etiqueta}
                    />
                  ))}
                </div>
              </div>
            )}
          </Seccion>
        </div>

        <aside
          aria-label="Resumen del pedido"
          className="overflow-hidden rounded-banner border border-gris-borde bg-pico-blanco shadow-tarjeta motion-safe:animate-aparecer lg:sticky lg:top-6"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center justify-between bg-logo-marino px-5 py-3">
            <h2 className="font-titulo text-lg font-bold text-pico-blanco">Tu pedido</h2>
            <span className="rounded-chip bg-pico-blanco/15 px-2.5 py-0.5 text-xs font-semibold text-pico-blanco">
              {unidades} {unidades === 1 ? "artículo" : "artículos"}
            </span>
          </div>

          <div className="p-5">
            {/* pt-2 deja espacio al globito de cantidad del primer producto (el scroll lo recortaba).
                Con más de 4 productos, la lista se desplaza y se desvanece abajo para indicar que hay más. */}
            <ul
              className={`-mx-1 max-h-[22rem] divide-y divide-gris-borde overflow-y-auto px-1 pt-2 ${
                items.length > 4 ? "pb-6 [mask-image:linear-gradient(to_bottom,black_85%,transparent)]" : ""
              }`}
            >
              {items.map(({ producto, cantidad }, i) => (
                <li
                  key={producto.id}
                  className="flex items-center gap-3 py-3 first:pt-1 motion-safe:animate-aparecer"
                  style={{ animationDelay: `${300 + Math.min(i, 6) * 60}ms` }}
                >
                  <span className="relative shrink-0">
                    <ImagenProducto src={producto.imagen} alt={producto.nombre} sizes="56px" className="size-14 rounded-tarjeta border border-gris-borde" />
                    <span className="absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center rounded-chip bg-logo-marino px-1 text-[11px] leading-5 font-bold text-pico-blanco tabular-nums">
                      {cantidad}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-texto">{tituloProducto(producto)}</p>
                    <p className="text-[12px] text-gris-texto">Cód. {producto.id}</p>
                  </div>
                  <Precio valor={producto.precio * cantidad} tamano="pequeno" tono="logo" className="shrink-0 font-titulo" />
                </li>
              ))}
            </ul>

            {(etiquetaRetiro || etiquetaPago) && (
              <dl className="mt-3 space-y-1.5 rounded-tarjeta bg-logo-marino-claro p-3 text-[13px] motion-safe:animate-aparecer">
                {etiquetaRetiro && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-gris-texto">Retiro</dt>
                    <dd className="text-right font-semibold text-logo-marino">
                      {etiquetaRetiro}
                      {direccion && ` · ${direccion.alias}`}
                    </dd>
                  </div>
                )}
                {etiquetaPago && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-gris-texto">Pago</dt>
                    <dd className="text-right font-semibold text-logo-marino">{etiquetaPago}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="mt-4 flex items-end justify-between border-t border-gris-borde pt-4">
              <span className="text-sm font-semibold text-logo-marino">Total referencial</span>
              <Precio valor={totalCarrito(items)} tamano="grande" tono="logo" className="font-titulo md:text-3xl" />
            </div>

            <div className="mt-4">
              {listo ? (
                <a
                  key="activo"
                  href={enlaceWhatsApp(armarMensajeFinal({ items, retiro: retiro!, direccion, pago: pago!, combinados }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  // Señal más fuerte del perfil de "Te puede interesar": lo que el cliente pidió.
                  onClick={() => registrarSenales(items.map((i) => ({ tipo: "whatsapp", id: i.producto.id })))}
                  className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-boton bg-logo-rojo text-base font-semibold text-pico-blanco transition duration-200 hover:bg-logo-rojo-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino motion-safe:animate-latido motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]"
                >
                  <Brillo />
                  <MessageCircle className="size-5 transition-transform motion-safe:group-hover:-rotate-12" aria-hidden />
                  Enviar pedido por WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-boton bg-gris-borde text-base font-semibold text-gris-texto"
                >
                  <MessageCircle className="size-5" aria-hidden />
                  Enviar pedido por WhatsApp
                </button>
              )}
              {!listo && (
                <p className="mt-2 text-center text-[13px] text-gris-texto" aria-live="polite">
                  Para continuar, {faltantes.join(" y ")}.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
