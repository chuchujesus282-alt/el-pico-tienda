"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { accionDatosParaPrimerPedido } from "@/app/mi-cuenta/acciones";
import { guardarItems, obtenerItems } from "@/components/carrito/almacenCarrito";
import type { DatosPedido } from "@/components/finalizar-pedido/pedido";
import { authCliente } from "@/lib/authCliente";
import { registrarEvento } from "@/lib/eventos/cliente";
import { tituloProducto } from "@/lib/formato";
import type { Producto } from "@/types/catalogo";
import AvisoPrecios, { type CambioPrecio } from "./AvisoPrecios";
import VentanaPrimerPedido from "./VentanaPrimerPedido";

// Pedidos y finalizar pedido — lo que pasa al tocar "Enviar por WhatsApp" (persona A; la página es de persona B y
// solo llama a este hook). WhatsApp se abre SIEMPRE, como antes; en el mismo toque y en segundo plano:
// - un evento "pedido_enviado" por producto, con un código de pedido al azar común a todos (lib/eventos/);
// - con cuenta: el pedido se guarda (POST /api/pedidos con keepalive: llega aunque el navegador se vaya a WhatsApp;
//   el servidor pone los precios y la tasa de ese instante). Si falla, el cliente igual pidió.
// - con cuenta, sin datos para la factura y en su PRIMER pedido: antes se le ofrece (sin obligarlo) dejar su
//   cédula/RIF y teléfono (VentanaPrimerPedido).
// Además, ANTES de enviar: al abrir la página se le pregunta a Saint el precio actual de cada producto (&codigos=, sin
// caché). Si alguno cambió, se corrige y se avisa; si ya no está a la venta, se quita y se avisa; si Saint no responde,
// se envía con los precios que se tenían ("Precios por confirmar"). El pedido guardado también lleva el precio de Saint.

type Pendiente = { datos: DatosPedido; url: string; id: string };

/** Después de un toque en "Enviar por WhatsApp", el botón no responde durante este tiempo (evita abrir WhatsApp dos veces). */
const BLOQUEO_MS = 2000;

function nuevoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Navegadores viejos: UUID v4 con Math.random (basta: solo evita duplicar el mismo pedido).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Lo que identifica "el mismo pedido": si el cliente toca dos veces sin cambiar nada, es el mismo id. */
const huella = ({ items, retiro, direccion, pago, combinados }: DatosPedido) =>
  JSON.stringify([items.map((i) => [i.producto.id, i.cantidad]), retiro, direccion?.id ?? null, pago, combinados]);

/** Manda el pedido (con cuenta) y los eventos. Nunca lanza ni hace esperar. */
function registrarPedido({ items, retiro, direccion, pago, combinados }: DatosPedido, id: string, conCuenta: boolean) {
  for (const { producto } of items) registrarEvento({ tipo: "pedido_enviado", producto: producto.id, pedido: id });
  if (!conCuenta) return;
  try {
    void fetch("/api/pedidos", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        items: items.map(({ producto, cantidad }) => ({ id: producto.id, nombre: producto.nombre, cantidad, precio: producto.precio })),
        retiro,
        direccion: direccion
          ? { nombre: direccion.nombre, descripcion: direccion.descripcion, latitud: direccion.latitud, longitud: direccion.longitud }
          : null,
        pago,
        combinados: pago === "combinado" ? combinados : [],
      }),
    }).catch(() => {});
  } catch {
    // Sin red: el pedido igual salió por WhatsApp.
  }
}

type PrecioAlDia = { precio: number; precioBs?: number; tasa?: number };
type RespuestaPrecios = { productos: ({ id: string } & PrecioAlDia)[]; retirados: string[]; sinVerificar: string[] };

/** Si Saint no responde en este tiempo, se envía con los precios que tenía el cliente (nunca se frena una venta). */
const ESPERA_PRECIOS_MS = 5000;
/** Con la página abierta, los precios se vuelven a confirmar cada tanto y al volver a la pestaña. */
const CONFIRMAR_CADA_MS = 5 * 60_000;
const CONFIRMAR_AL_VOLVER_MS = 60_000;

/** Precio ACTUAL de Saint de estos códigos (POST /api/precios-al-dia). Lanza si no hubo respuesta a tiempo. */
async function pedirPrecios(ids: string[]): Promise<RespuestaPrecios> {
  const control = new AbortController();
  const espera = setTimeout(() => control.abort(), ESPERA_PRECIOS_MS);
  try {
    const respuesta = await fetch("/api/precios-al-dia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
      signal: control.signal,
    });
    if (!respuesta.ok) throw new Error(`precios al día: ${respuesta.status}`);
    return (await respuesta.json()) as RespuestaPrecios;
  } finally {
    clearTimeout(espera);
  }
}

const conPrecio = (producto: Producto, p: PrecioAlDia): Producto => ({
  ...producto,
  precio: p.precio,
  ...(p.precioBs !== undefined ? { precioBs: p.precioBs } : {}),
  ...(p.tasa !== undefined ? { tasa: p.tasa } : {}),
});

/**
 * Precios al día de finalizar pedido: al abrir la página (y al cambiar los productos, al volver a la pestaña y cada
 * 5 minutos) se le pregunta a Saint el precio ACTUAL de cada producto. Lo que cambió se corrige (en el carrito, o en
 * la compra directa de "Comprar ahora") y se avisa; lo que ya no está a la venta se quita y se avisa. Mientras se
 * confirma por primera vez, `confirmando` es true (el botón de WhatsApp espera); si Saint no responde, se sigue con
 * los precios que se tenían y `sinVerificar` es true.
 */
function usePreciosAlDia(items: DatosPedido["items"], conCarrito: boolean) {
  const [alDia, setAlDia] = useState<Map<string, PrecioAlDia>>(() => new Map());
  const [retirados, setRetirados] = useState<Set<string>>(() => new Set());
  // Códigos ya confirmados (bien o sin respuesta) y cuándo: mientras falte alguno, el botón espera.
  const [confirmados, setConfirmados] = useState<Map<string, number>>(() => new Map());
  const [cambios, setCambios] = useState<CambioPrecio[]>([]);
  const [quitados, setQuitados] = useState<string[]>([]);
  const [sinVerificar, setSinVerificar] = useState(false);
  const itemsActuales = useRef(items);
  useEffect(() => {
    itemsActuales.current = items;
  }, [items]);

  /** Lo que respondió Saint (o null si no respondió a tiempo: se envía con los precios que se tenían). */
  const aplicar = useCallback(
    (ids: string[], respuesta: RespuestaPrecios | null) => {
      const ahora = Date.now();
      setConfirmados((antes) => new Map([...antes, ...ids.map((id) => [id, ahora] as const)]));
      if (!respuesta) {
        setSinVerificar(true);
        return;
      }
      setSinVerificar(respuesta.sinVerificar.length > 0);

      const precios = new Map(respuesta.productos.map(({ id, ...p }) => [id, p]));
      const fuera = new Set(respuesta.retirados);
      const vistos = new Map(itemsActuales.current.map((i) => [i.producto.id, i.producto]));
      const nuevosCambios: CambioPrecio[] = [];
      for (const [id, p] of precios) {
        const visto = vistos.get(id);
        if (visto && visto.precio !== p.precio) {
          nuevosCambios.push({ id, titulo: tituloProducto(visto), antes: visto.precio, ahora: p.precio });
        }
      }
      const nuevosQuitados = [...fuera].flatMap((id) => (vistos.has(id) ? [tituloProducto(vistos.get(id)!)] : []));

      // Se juntan con los avisos anteriores: "antes" es siempre el primer precio que vio el cliente.
      if (nuevosCambios.length > 0) {
        setCambios((anteriores) => {
          const porId = new Map(anteriores.map((c) => [c.id, c]));
          for (const c of nuevosCambios) porId.set(c.id, { ...c, antes: porId.get(c.id)?.antes ?? c.antes });
          return [...porId.values()].filter((c) => c.antes !== c.ahora);
        });
      }
      if (nuevosQuitados.length > 0) setQuitados((anteriores) => [...new Set([...anteriores, ...nuevosQuitados])]);
      setAlDia((antes) => new Map([...antes, ...precios]));
      if (fuera.size > 0) setRetirados((antes) => new Set([...antes, ...fuera]));

      // Desde el carrito: el carrito mismo queda al día (y la cuenta, que lo copia).
      if (conCarrito && (nuevosCambios.length > 0 || nuevosQuitados.length > 0)) {
        guardarItems(
          obtenerItems()
            .filter((i) => !fuera.has(i.producto.id))
            .map((i) => (precios.has(i.producto.id) ? { ...i, producto: conPrecio(i.producto, precios.get(i.producto.id)!) } : i)),
        );
      }
    },
    [conCarrito],
  );

  const confirmar = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      pedirPrecios(ids).then(
        (respuesta) => aplicar(ids, respuesta),
        () => aplicar(ids, null),
      );
    },
    [aplicar],
  );

  // Al abrir y cuando aparece un producto que no se confirmó hace poco.
  const codigos = items.map((i) => i.producto.id).join(",");
  useEffect(() => {
    if (!codigos) return;
    const ahora = Date.now();
    const ids = codigos.split(",");
    if (ids.some((id) => !(ahora - (confirmados.get(id) ?? 0) < CONFIRMAR_AL_VOLVER_MS))) confirmar(ids);
    // Solo cuando cambian los productos (confirmados cambia por la respuesta misma).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigos, confirmar]);

  // Con la página abierta: cada 5 minutos y al volver a la pestaña (si pasó más de 1 minuto).
  useEffect(() => {
    if (!codigos) return;
    const ids = codigos.split(",");
    let ultima = Date.now();
    const repetir = () => {
      ultima = Date.now();
      confirmar(ids);
    };
    const intervalo = setInterval(repetir, CONFIRMAR_CADA_MS);
    const alVolver = () => {
      if (document.visibilityState === "visible" && Date.now() - ultima > CONFIRMAR_AL_VOLVER_MS) repetir();
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [codigos, confirmar]);

  const itemsAlDia = useMemo(
    () =>
      items
        .filter((i) => !retirados.has(i.producto.id))
        .map((i) => {
          const p = alDia.get(i.producto.id);
          return p && p.precio !== i.producto.precio ? { ...i, producto: conPrecio(i.producto, p) } : i;
        }),
    [items, alDia, retirados],
  );
  const confirmando = items.some((i) => !confirmados.has(i.producto.id));

  return { items: itemsAlDia, confirmando, cambios, quitados, sinVerificar };
}

/**
 * Para el botón "Enviar pedido por WhatsApp" de finalizar pedido:
 *   const { alEnviar, ventana } = usePedidoEnCuenta({ conCarrito: !itemsDirectos, items });
 *   <a href={url} onClick={(e) => alEnviar(e, datos, url)}> … </a>   {ventana}
 */
export function usePedidoEnCuenta({ conCarrito, items }: { conCarrito: boolean; items: DatosPedido["items"] }) {
  const { data: sesion } = authCliente.useSession();
  const conCuenta = Boolean(sesion?.user);
  const [primerPedido, setPrimerPedido] = useState<{ pedir: boolean; nombre: string }>({ pedir: false, nombre: "" });
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const ultimo = useRef<{ huella: string; id: string } | null>(null);
  // Bloqueo tras un toque: la referencia frena al instante un segundo toque (antes de que React vuelva a dibujar);
  // el estado solo sirve para avisarle al lector de pantalla (aria-disabled). No cambia cómo se ve el botón.
  const bloqueadoHasta = useRef(0);
  const [bloqueado, setBloqueado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(temporizador.current), []);
  const bloquear = () => {
    bloqueadoHasta.current = Date.now() + BLOQUEO_MS;
    setBloqueado(true);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setBloqueado(false), BLOQUEO_MS);
  };

  // Precio ACTUAL de Saint de cada producto, antes de abrir WhatsApp.
  const precios = usePreciosAlDia(items, conCarrito);

  // ¿Se le preguntan sus datos en este primer pedido?
  useEffect(() => {
    if (!conCuenta) return;
    let vigente = true;
    accionDatosParaPrimerPedido()
      .then((r) => vigente && setPrimerPedido(r))
      .catch(() => {});
    return () => {
      vigente = false;
    };
  }, [conCuenta]);

  const idPara = (datos: DatosPedido) => {
    const h = huella(datos);
    if (ultimo.current?.huella !== h) ultimo.current = { huella: h, id: nuevoId() };
    return ultimo.current.id;
  };

  /** onClick del enlace a WhatsApp. Si hay que ofrecer los datos, detiene el enlace y abre la ventana. */
  const alEnviar = (evento: MouseEvent<HTMLAnchorElement>, datos: DatosPedido, url: string) => {
    // Doble toque: el segundo (dentro de los 2 s) no hace nada.
    if (Date.now() < bloqueadoHasta.current) {
      evento.preventDefault();
      return;
    }
    const id = idPara(datos);
    if (conCuenta && primerPedido.pedir) {
      evento.preventDefault();
      setPendiente({ datos, url, id });
      return;
    }
    bloquear();
    registrarPedido(datos, id, conCuenta);
  };

  /** Desde la ventana: abre WhatsApp en este mismo toque (así el navegador no lo bloquea) y registra el pedido. */
  const enviarDesdeVentana = () => {
    if (!pendiente || Date.now() < bloqueadoHasta.current) return;
    bloquear();
    window.open(pendiente.url, "_blank", "noopener,noreferrer");
    registrarPedido(pendiente.datos, pendiente.id, conCuenta);
    setPendiente(null);
    setPrimerPedido((p) => ({ ...p, pedir: false })); // no se vuelve a preguntar
  };

  const ventana = pendiente ? (
    <VentanaPrimerPedido nombre={primerPedido.nombre} onEnviar={enviarDesdeVentana} onCerrar={() => setPendiente(null)} />
  ) : null;
  const aviso = <AvisoPrecios cambios={precios.cambios} quitados={precios.quitados} sinVerificar={precios.sinVerificar} />;

  return {
    alEnviar,
    ventana,
    bloqueado,
    /** Los productos con el precio de hoy y sin los que ya no están a la venta: úsalos para el total y el mensaje. */
    items: precios.items,
    /** Mientras es true, el botón de WhatsApp espera (los precios se están confirmando por primera vez). */
    confirmando: precios.confirmando,
    /** Saint no respondió: el pedido sale con los precios que se tenían ("Precios por confirmar" en el mensaje). */
    preciosPorConfirmar: precios.sinVerificar,
    /** Va junto al botón de WhatsApp: qué precio cambió, qué se quitó o que no se pudo confirmar. */
    aviso,
  };
}
