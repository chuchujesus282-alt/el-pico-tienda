"use client";

import { useEffect } from "react";
import {
  accionGuardarDatosCuenta,
  accionLeerDatosCuenta,
  accionOlvidarVisitante,
  accionSincronizarAlEntrar,
} from "@/app/mi-cuenta/acciones";
import { guardarItems, obtenerItems, suscribir as suscribirCarrito } from "@/components/carrito/almacenCarrito";
import { obtenerFavoritos, reemplazarFavoritos, suscribirFavoritos } from "@/components/favoritos/almacenFavoritos";
import { obtenerDirecciones, reemplazarDirecciones, suscribirDirecciones } from "@/components/direcciones/almacenDirecciones";
import { authCliente } from "@/lib/authCliente";
import { mezclarDirecciones } from "@/lib/mezclaCuenta";
import type { ItemCarrito } from "@/types/carrito";
import type { DatosCuenta } from "@/types/cuenta";

// Copia el carrito, los favoritos y las direcciones del navegador a la cuenta del cliente (va en app/layout.tsx; no se ve).
// - Al ENTRAR (este navegador todavía no tiene los datos de esa cuenta): junta lo del navegador con lo de la cuenta
//   (cantidad mayor en el carrito, todos los favoritos, direcciones sin duplicar; ver lib/mezclaCuenta.ts).
// - En las visitas siguientes: manda lo de la cuenta (lo que quitaste en otro dispositivo no reaparece).
// - Cada cambio (agregar, quitar, cambiar cantidad, marcar favorito) se guarda en la cuenta medio segundo después.
// - Al cerrar sesión (o si la sesión venció): se vacían el carrito, los favoritos y las direcciones de ESTE navegador, por si es una
//   computadora compartida. Siguen guardados en la cuenta y vuelven al entrar. También se cambia el código de
//   visitante de los eventos para análisis (lib/eventos/), para no mezclar a la próxima persona con esta cuenta.

/** De quién son el carrito y los favoritos que hay en este navegador (id de la cuenta), o nada si son de un visitante. */
const MARCA = "el-pico:cuenta";

/**
 * "Hay cambios de esta cuenta que todavía no llegaron al servidor" (el cliente recargó o cerró la página antes del
 * medio segundo). En la próxima visita se guardan PRIMERO y después se lee la cuenta, para que no se pierdan.
 */
const PENDIENTE = "el-pico:cuenta-pendiente";

function leerPendiente(): string | null {
  try {
    return window.localStorage.getItem(PENDIENTE);
  } catch {
    return null;
  }
}

function ponerPendiente(usuario: string | null) {
  try {
    if (usuario) window.localStorage.setItem(PENDIENTE, usuario);
    else window.localStorage.removeItem(PENDIENTE);
  } catch {
    // Sin almacenamiento: no hay nada que recordar.
  }
}

function leerMarca(): string | null {
  try {
    return window.localStorage.getItem(MARCA);
  } catch {
    return null;
  }
}

function ponerMarca(usuario: string | null) {
  try {
    if (usuario) window.localStorage.setItem(MARCA, usuario);
    else window.localStorage.removeItem(MARCA);
  } catch {
    // Sin almacenamiento (modo privado): se vuelve a juntar en cada visita, que da el mismo resultado.
  }
}

const lineasCarrito = () => obtenerItems().map((i) => ({ id: i.producto.id, cantidad: i.cantidad }));

type Foto = { carrito: string; favoritos: string; direcciones: string };

/**
 * Lo que el cliente agregó MIENTRAS se esperaba a la cuenta (con la red lenta pueden ser varios segundos) no se pierde:
 * se suma a lo que llegó de la cuenta. `antes` es lo que había en el navegador cuando se hizo el pedido al servidor.
 */
function conLoNuevo(datos: DatosCuenta, antes: Foto): DatosCuenta {
  const habia = new Set((JSON.parse(antes.carrito) as { id: string }[]).map((l) => l.id));
  const carrito: ItemCarrito[] = [...datos.carrito];
  for (const item of obtenerItems()) {
    if (habia.has(item.producto.id)) continue;
    const i = carrito.findIndex((c) => c.producto.id === item.producto.id);
    if (i === -1) carrito.push(item);
    else carrito[i] = { ...carrito[i], cantidad: Math.max(carrito[i].cantidad, item.cantidad) };
  }
  const favoritosAntes = new Set(JSON.parse(antes.favoritos) as string[]);
  const nuevosFavoritos = obtenerFavoritos().filter((id) => !favoritosAntes.has(id));
  const favoritos = [...new Set([...nuevosFavoritos, ...datos.favoritos])];
  const dirAntes = new Set(((JSON.parse(antes.direcciones) as DatosCuenta["direcciones"] | null)?.lista ?? []).map((d) => d.id));
  const locales = obtenerDirecciones();
  const nuevas = { lista: locales.lista.filter((d) => !dirAntes.has(d.id)), elegidaId: null };
  const direcciones = nuevas.lista.length ? mezclarDirecciones(nuevas, datos.direcciones) : datos.direcciones;
  return { carrito, favoritos, direcciones };
}

export default function SincronizarCuenta() {
  const { data: sesion, isPending, error } = authCliente.useSession();
  const usuario = sesion?.user.id ?? null;
  const sinRespuesta = Boolean(error); // sin conexión no se sabe si hay sesión: no se toca nada

  useEffect(() => {
    if (isPending || sinRespuesta) return;
    const marca = leerMarca();

    if (!usuario) {
      if (marca) {
        guardarItems([]);
        reemplazarFavoritos([]);
        reemplazarDirecciones({ lista: [], elegidaId: null });
        ponerMarca(null);
        ponerPendiente(null);
        void accionOlvidarVisitante().catch(() => {});
      }
      return;
    }

    let vigente = true;
    let listo = false;
    let espera: ReturnType<typeof setTimeout> | undefined;
    // Lo último que se guardó en la cuenta, para mandar solo lo que cambió.
    let enviado = { carrito: "", favoritos: "", direcciones: "" };
    const foto = () => ({
      carrito: JSON.stringify(lineasCarrito()),
      favoritos: JSON.stringify(obtenerFavoritos()),
      direcciones: JSON.stringify(obtenerDirecciones()),
    });

    const guardar = () => {
      if (!vigente || !listo || leerMarca() !== usuario) return;
      const ahora = foto();
      const cambios: { carrito?: unknown; favoritos?: unknown; direcciones?: unknown } = {};
      if (ahora.carrito !== enviado.carrito) cambios.carrito = JSON.parse(ahora.carrito);
      if (ahora.favoritos !== enviado.favoritos) cambios.favoritos = JSON.parse(ahora.favoritos);
      if (ahora.direcciones !== enviado.direcciones) cambios.direcciones = JSON.parse(ahora.direcciones);
      if (Object.keys(cambios).length === 0) return;
      enviado = ahora;
      void accionGuardarDatosCuenta(cambios)
        .then((ok) => {
          // Guardado y sin cambios nuevos mientras tanto: ya no hay nada pendiente.
          if (ok && JSON.stringify(foto()) === JSON.stringify(ahora)) ponerPendiente(null);
        })
        .catch(() => {});
    };
    const alCambiar = () => {
      if (listo && leerMarca() === usuario) ponerPendiente(usuario);
      clearTimeout(espera);
      espera = setTimeout(guardar, 500);
    };
    // Si cierra la pestaña antes del medio segundo, se guarda ya.
    const alOcultar = () => {
      if (document.visibilityState !== "hidden") return;
      clearTimeout(espera);
      guardar();
    };
    // Suscribirse también carga los almacenes desde localStorage.
    const soltar = [suscribirCarrito(alCambiar), suscribirFavoritos(alCambiar), suscribirDirecciones(alCambiar)];
    document.addEventListener("visibilitychange", alOcultar);

    (async () => {
      // Cambios de la visita anterior que no alcanzaron a guardarse: primero se guardan (si no se puede, el navegador
      // se queda con lo suyo y se vuelve a intentar en la próxima visita).
      if (marca === usuario && leerPendiente() === usuario) {
        const ok = await accionGuardarDatosCuenta({
          carrito: lineasCarrito(),
          favoritos: obtenerFavoritos(),
          direcciones: obtenerDirecciones(),
        }).catch(() => false);
        if (!vigente || !ok) return;
        ponerPendiente(null);
      }
      const antes = foto();
      // Si este navegador tenía los datos de OTRA cuenta (no cerró sesión), esos no se juntan con los de esta.
      const respuesta =
        marca === usuario
          ? await accionLeerDatosCuenta()
          : await accionSincronizarAlEntrar(
              marca
                ? { carrito: [], favoritos: [], direcciones: { lista: [], elegidaId: null } }
                : { carrito: lineasCarrito(), favoritos: obtenerFavoritos(), direcciones: obtenerDirecciones() },
            );
      if (!vigente || !respuesta) return;
      const datos = conLoNuevo(respuesta, antes);
      guardarItems(datos.carrito);
      reemplazarFavoritos(datos.favoritos);
      reemplazarDirecciones(datos.direcciones);
      // Lo que está en la cuenta; si se juntó algo de más (agregado mientras se esperaba), se guarda enseguida.
      enviado = {
        carrito: JSON.stringify(respuesta.carrito.map((i) => ({ id: i.producto.id, cantidad: i.cantidad }))),
        favoritos: JSON.stringify(respuesta.favoritos),
        direcciones: JSON.stringify(respuesta.direcciones),
      };
      ponerMarca(usuario);
      listo = true;
      if (JSON.stringify(enviado) !== JSON.stringify(foto())) alCambiar();
    })();

    return () => {
      vigente = false;
      clearTimeout(espera);
      soltar.forEach((s) => s());
      document.removeEventListener("visibilitychange", alOcultar);
    };
  }, [usuario, isPending, sinRespuesta]);

  return null;
}
