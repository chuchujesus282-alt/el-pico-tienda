"use client";

import { useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Layers, MapPin, MapPinPlus, ShoppingCart } from "lucide-react";
import IconoBanco from "@/components/icons/pico/IconoBanco";
import IconoBilletes from "@/components/icons/pico/IconoBilletes";
import IconoCamion from "@/components/icons/pico/IconoCamion";
import IconoCombinado from "@/components/icons/pico/IconoCombinado";
import IconoCuotas from "@/components/icons/pico/IconoCuotas";
import IconoMoto from "@/components/icons/pico/IconoMoto";
import IconoPagoMovil from "@/components/icons/pico/IconoPagoMovil";
import IconoTienda from "@/components/icons/pico/IconoTienda";
import IconoUsdt from "@/components/icons/pico/IconoUsdt";
import IconoZelle from "@/components/icons/pico/IconoZelle";
import { RUTA_CALCULADORAS } from "@/components/calculadoras/rutas";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import { useDirecciones } from "@/components/direcciones/almacenDirecciones";
import { tituloProducto } from "@/lib/formato";
import ImagenProducto from "@/components/producto/ImagenProducto";
import Precio from "@/components/ui/Precio";
import { registrarSenales } from "@/lib/recomendaciones/almacenPerfil";
import { enlaceWhatsApp, totalCarrito } from "@/lib/whatsapp";
import type { ItemCarrito } from "@/types/carrito";
import CheckDibujado from "@/components/icons/pico/CheckDibujado";
import Opcion from "./Opcion";
import IconoCalculadora from "@/components/icons/pico/IconoCalculadora";
import IconoMensaje from "@/components/icons/pico/IconoMensaje";
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
};

// Íconos propios de las opciones (components/icons/pico): Opcion los pone en su placa, que se anima al elegir.
const iconosRetiro: Record<FormaRetiro, ReactNode> = {
  pickup: <IconoTienda />,
  delivery: <IconoMoto />,
  flete: <IconoCamion />,
};

const iconosPago: Record<MetodoPago, ReactNode> = {
  divisas: <IconoBilletes />,
  "pago-movil": <IconoPagoMovil />,
  transferencia: <IconoBanco />,
  cashea: <IconoCuotas />,
  zelle: <IconoZelle />,
  usdt: <IconoUsdt />,
  combinado: <IconoCombinado />,
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
      {completo ? <CheckDibujado key="ok" className="size-4" /> : numero}
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
              {/* La línea se llena (scaleX, sin mover nada alrededor) al completar el paso. */}
              <span
                className="block h-full origin-left rounded-chip bg-logo-marino transition-transform duration-700 ease-(--curva-suave)"
                style={{ transform: estados[i] ? "scaleX(1)" : "scaleX(0)" }}
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
      {/* El número del paso ya está en el indicador de arriba: aquí solo el título y "Listo" al completarlo. */}
      <div className="mb-4 flex items-center justify-between gap-3" aria-hidden>
        <h2 className="text-xl font-bold tracking-tight text-logo-marino">{titulo}</h2>
        {completo && (
          <span className="inline-flex items-center gap-1 rounded-chip bg-estado-abierto/10 px-2.5 py-1 text-xs font-semibold text-estado-abierto motion-safe:animate-pop">
            <CheckDibujado className="size-3.5" />
            Listo
          </span>
        )}
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
export default function FormularioPedido({ itemsDirectos }: Props) {
  const carrito = useCarrito();
  // Direcciones guardadas por el cliente (Mis direcciones). La elegida en el header viene marcada;
  // aquí se puede cambiar, y la de aquí es la que va en el mensaje de WhatsApp.
  const { direcciones, elegida } = useDirecciones();
  // El carrito vive en el navegador: hasta montar no se sabe si está vacío.
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);

  const [retiro, setRetiro] = useState<FormaRetiro | null>(null);
  const [direccionId, setDireccionId] = useState<string | null>(null);
  const [pago, setPago] = useState<MetodoPago | null>(null);
  const [combinados, setCombinados] = useState<MetodoPago[]>([]);

  const items = itemsDirectos ?? carrito.items;
  const unidades = items.reduce((suma, i) => suma + i.cantidad, 0);
  const necesitaDireccion = retiro === "delivery" || retiro === "flete";
  const direccion = direcciones.find((d) => d.id === (direccionId ?? elegida?.id)) ?? null;
  // Al agregar una dirección desde aquí, se vuelve a este mismo pedido.
  const volver = itemsDirectos
    ? `/finalizar-pedido?producto=${encodeURIComponent(itemsDirectos[0].producto.id)}&cantidad=${itemsDirectos[0].cantidad}`
    : "/finalizar-pedido";
  const enlaceAgregar = `/mis-direcciones/nueva?volver=${encodeURIComponent(volver)}`;

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
        <Link
          href={RUTA_CALCULADORAS}
          className="group mt-1 inline-flex items-center gap-1.5 rounded-boton px-2 py-1 text-[13px] font-semibold text-logo-marino transition-colors hover:text-logo-rojo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino"
        >
          <IconoCalculadora className="size-5 motion-safe:group-hover:animate-sacudir" />
          ¿No sabes cuánto material necesitas? Calcúlalo
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
                  {direcciones.length > 0 ? "¿A cuál de tus direcciones?" : "¿A dónde te lo llevamos?"}
                </p>
                <div className="grid gap-3 md:auto-rows-fr md:grid-cols-2">
                  {direcciones.map((d) => (
                    <Opcion
                      key={d.id}
                      tipo="radio"
                      nombre="direccion"
                      valor={d.id}
                      marcada={direccion?.id === d.id}
                      alCambiar={() => setDireccionId(d.id)}
                      titulo={d.nombre}
                      detalle={<span className="line-clamp-2">{d.descripcion}</span>}
                    />
                  ))}
                  {/* Otra dirección: lleva al mapa y, al guardarla, vuelve a este pedido. */}
                  <Link
                    href={enlaceAgregar}
                    className="group flex min-h-16 items-center justify-center gap-2.5 rounded-tarjeta border-2 border-dashed border-logo-marino/25 bg-pico-blanco px-3 py-3 text-sm font-semibold text-logo-marino transition-colors hover:border-pico-rojo hover:text-pico-rojo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino"
                  >
                    <MapPinPlus className="size-5 transition-transform duration-300 motion-safe:group-hover:scale-110" aria-hidden />
                    {direcciones.length > 0 ? "Agregar otra dirección" : "Agregar una dirección"}
                  </Link>
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
                      {direccion && ` · ${direccion.nombre}`}
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
              <span>
                <span className="block text-sm font-semibold text-logo-marino">Total referencial</span>
                <span className="block text-xs text-gris-texto">en dólares</span>
              </span>
              <Precio valor={totalCarrito(items)} tamano="grande" tono="logo" className="text-4xl tracking-tight tabular-nums md:text-[2.75rem]" />
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
                  // Listo: el verde de WhatsApp (estado-abierto), con brillo y un latido al habilitarse.
                  className="group grupo-icono relative flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-estado-abierto text-base font-semibold text-pico-blanco transition duration-200 [--icono-acento:var(--color-pico-blanco)] hover:bg-estado-abierto/90 hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino motion-safe:animate-pop motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]"
                >
                  <Brillo />
                  <IconoMensaje className="size-6 transition-transform motion-safe:group-hover:-rotate-12" />
                  Enviar pedido por WhatsApp
                </a>
              ) : (
                // Aún no: el botón dice el siguiente paso que falta (y debajo, lo que viene después).
                <button
                  type="button"
                  disabled
                  className="flex h-13 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border-2 border-dashed border-pico-azul/25 bg-pico-azul-claro text-base font-semibold text-pico-azul/80"
                >
                  <span key={faltantes[0]} className="motion-safe:animate-aparecer">
                    {faltantes[0] ? faltantes[0].charAt(0).toUpperCase() + faltantes[0].slice(1) : "Enviar pedido por WhatsApp"}
                  </span>
                </button>
              )}
              {!listo && (
                <p className="mt-2 text-center text-[13px] text-gris-texto" aria-live="polite">
                  {faltantes.length > 1 ? `Luego, ${faltantes.slice(1).join(" y ")}.` : "Es el último paso para enviar tu pedido por WhatsApp."}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
