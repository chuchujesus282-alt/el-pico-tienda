"use client";

import { useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import {
  Banknote,
  Bike,
  Bitcoin,
  CalendarClock,
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
import Boton from "@/components/ui/Boton";
import Precio from "@/components/ui/Precio";
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
  pickup: <Store className="size-5" aria-hidden />,
  delivery: <Bike className="size-5" aria-hidden />,
  flete: <Truck className="size-5" aria-hidden />,
};

const iconosPago: Record<MetodoPago, ReactNode> = {
  divisas: <Banknote className="size-5" aria-hidden />,
  "pago-movil": <Smartphone className="size-5" aria-hidden />,
  transferencia: <Landmark className="size-5" aria-hidden />,
  cashea: <CalendarClock className="size-5" aria-hidden />,
  zelle: <Send className="size-5" aria-hidden />,
  binance: <Bitcoin className="size-5" aria-hidden />,
  combinado: <Layers className="size-5" aria-hidden />,
};

const sinSuscripcion = () => () => {};

function Seccion({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-tarjeta border border-gris-borde bg-pico-blanco p-4 shadow-tarjeta md:p-5">
      <legend className="sr-only">{titulo}</legend>
      <div className="mb-3 flex items-center gap-3" aria-hidden>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-chip bg-pico-azul text-sm font-bold text-pico-blanco">
          {numero}
        </span>
        <h2 className="text-lg font-bold text-pico-azul">{titulo}</h2>
      </div>
      {children}
    </fieldset>
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
  const necesitaDireccion = retiro === "delivery" || retiro === "flete";
  const direccion = direcciones.find((d) => d.id === direccionId) ?? null;

  const faltantes = [
    !retiro && "elige cómo retiras",
    necesitaDireccion && !direccion && "elige la dirección de entrega",
    !pago && "elige el método de pago",
    pago === "combinado" && combinados.length < 2 && "marca al menos dos métodos para el pago combinado",
  ].filter((f): f is string => !!f);
  const listo = faltantes.length === 0 && items.length > 0;

  const alternarCombinado = (valor: MetodoPago) =>
    setCombinados((actuales) =>
      actuales.includes(valor) ? actuales.filter((v) => v !== valor) : [...actuales, valor],
    );

  if (!itemsDirectos && !montado) {
    return <div className="h-96 animate-pulse rounded-tarjeta bg-gris-borde" aria-hidden />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco px-6 py-12 text-center">
        <ShoppingCart className="size-12 text-gris-borde" strokeWidth={1.5} aria-hidden />
        <p className="text-xl font-bold text-pico-azul">Tu carrito está vacío</p>
        <p className="text-[13px] text-gris-texto">Agrega productos del catálogo para armar tu pedido.</p>
        <Boton href="/" className="mt-2">
          Ver productos
        </Boton>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="flex flex-col gap-4">
        <Seccion numero={1} titulo="¿Cómo retiras?">
          <div className="grid gap-2 sm:grid-cols-3">
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
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-pico-azul">¿A cuál de tus direcciones?</p>
              <div className="grid gap-2 md:grid-cols-2">
                {direcciones.map((d) => (
                  <Opcion
                    key={d.id}
                    tipo="radio"
                    nombre="direccion"
                    valor={d.id}
                    marcada={direccionId === d.id}
                    alCambiar={() => setDireccionId(d.id)}
                    icono={<MapPin className="size-5" aria-hidden />}
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

        <Seccion numero={2} titulo="Método de pago">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
              />
            ))}
          </div>

          {pago === "combinado" && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-pico-azul">¿Cuáles vas a combinar?</p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {METODOS_COMBINABLES.map((metodo) => (
                  <Opcion
                    key={metodo.valor}
                    tipo="checkbox"
                    nombre="combinados"
                    valor={metodo.valor}
                    marcada={combinados.includes(metodo.valor)}
                    alCambiar={() => alternarCombinado(metodo.valor)}
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
        className="rounded-tarjeta border border-gris-borde bg-pico-blanco p-4 shadow-tarjeta md:p-5 lg:sticky lg:top-6"
      >
        <h2 className="text-lg font-bold text-pico-azul">Tu pedido</h2>
        <ul className="mt-3 divide-y divide-gris-borde">
          {items.map(({ producto, cantidad }) => (
            <li key={producto.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium uppercase">{producto.nombre}</p>
                <p className="text-[13px] text-gris-texto">
                  {cantidad} x Cód. {producto.id}
                </p>
              </div>
              <Precio valor={producto.precio * cantidad} tamano="pequeno" className="shrink-0" />
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-gris-borde pt-3">
          <span className="font-semibold text-pico-azul">Total referencial</span>
          <Precio valor={totalCarrito(items)} tamano="grande" />
        </div>

        <div className="mt-4">
          {listo ? (
            <Boton
              href={enlaceWhatsApp(
                armarMensajeFinal({ items, retiro: retiro!, direccion, pago: pago!, combinados }),
              )}
              target="_blank"
              rel="noopener noreferrer"
              anchoCompleto
              className="h-12 text-base"
            >
              <MessageCircle className="size-5" aria-hidden />
              Enviar pedido por WhatsApp
            </Boton>
          ) : (
            <Boton disabled anchoCompleto className="h-12 text-base">
              <MessageCircle className="size-5" aria-hidden />
              Enviar pedido por WhatsApp
            </Boton>
          )}
          {!listo && (
            <p className="mt-2 text-[13px] text-gris-texto" aria-live="polite">
              Para continuar, {faltantes.join(" y ")}.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
