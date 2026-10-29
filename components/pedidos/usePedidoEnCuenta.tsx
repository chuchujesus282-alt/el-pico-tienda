"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { accionDatosParaPrimerPedido } from "@/app/mi-cuenta/acciones";
import { guardarItems, obtenerItems } from "@/components/carrito/almacenCarrito";
import type { DatosPedido } from "@/components/finalizar-pedido/pedido";
import { authCliente } from "@/lib/authCliente";
import { registrarEvento } from "@/lib/eventos/cliente";
import type { Producto } from "@/types/catalogo";
import VentanaPrimerPedido from "./VentanaPrimerPedido";

// Pedidos y finalizar pedido — lo que pasa al tocar "Enviar por WhatsApp" (persona A; la página es de persona B y
// solo llama a este hook). WhatsApp se abre SIEMPRE, como antes; en el mismo toque y en segundo plano:
// - un evento "pedido_enviado" por producto, con un código de pedido al azar común a todos (lib/eventos/);
// - con cuenta: el pedido se guarda (POST /api/pedidos con keepalive: llega aunque el navegador se vaya a WhatsApp;
//   el servidor pone los precios y la tasa de ese instante). Si falla, el cliente igual pidió.
// - con cuenta, sin datos para la factura y en su PRIMER pedido: antes se le ofrece (sin obligarlo) dejar su
//   cédula/RIF y teléfono (VentanaPrimerPedido).
// Además, al abrir la página, el carrito se pone al día con los precios de hoy (así el mensaje de WhatsApp y el pedido
// guardado dicen lo mismo).

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

/** Pone el carrito al día con los productos de hoy (precio, nombre). Lo que no llegó se deja como estaba. */
async function refrescarCarrito() {
  const items = obtenerItems();
  if (items.length === 0) return;
  try {
    const respuesta = await fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: items.map((i) => i.producto.id) }),
    });
    if (!respuesta.ok) return;
    const { productos } = (await respuesta.json()) as { productos: Producto[] };
    const deHoy = new Map(productos.map((p) => [p.id, p]));
    const actuales = obtenerItems();
    const cambio = actuales.some((i) => {
      const p = deHoy.get(i.producto.id);
      return p && (p.precio !== i.producto.precio || p.nombre !== i.producto.nombre || p.titulo !== i.producto.titulo);
    });
    if (cambio) guardarItems(actuales.map((i) => ({ ...i, producto: deHoy.get(i.producto.id) ?? i.producto })));
  } catch {
    // Sin conexión: se queda el carrito como estaba.
  }
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

  // Precios de hoy en el carrito: cuando el carrito ya cargó del navegador (y cada vez que cambian sus productos).
  const codigos = items.map((i) => i.producto.id).join(",");
  useEffect(() => {
    if (conCarrito && codigos) void refrescarCarrito();
  }, [conCarrito, codigos]);

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

  return { alEnviar, ventana, bloqueado };
}
