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
import { authCliente } from "@/lib/authCliente";

// Copia el carrito y los favoritos del navegador a la cuenta del cliente (va en app/layout.tsx; no se ve).
// - Al ENTRAR (este navegador todavía no tiene los datos de esa cuenta): junta lo del navegador con lo de la cuenta
//   (cantidad mayor en el carrito, todos los favoritos; ver lib/mezclaCuenta.ts).
// - En las visitas siguientes: manda lo de la cuenta (lo que quitaste en otro dispositivo no reaparece).
// - Cada cambio (agregar, quitar, cambiar cantidad, marcar favorito) se guarda en la cuenta medio segundo después.
// - Al cerrar sesión (o si la sesión venció): se vacían el carrito y los favoritos de ESTE navegador, por si es una
//   computadora compartida. Siguen guardados en la cuenta y vuelven al entrar. También se cambia el código de
//   visitante de los eventos para análisis (lib/eventos/), para no mezclar a la próxima persona con esta cuenta.

/** De quién son el carrito y los favoritos que hay en este navegador (id de la cuenta), o nada si son de un visitante. */
const MARCA = "el-pico:cuenta";

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
        ponerMarca(null);
        void accionOlvidarVisitante().catch(() => {});
      }
      return;
    }

    let vigente = true;
    let listo = false;
    let espera: ReturnType<typeof setTimeout> | undefined;
    // Lo último que se guardó en la cuenta, para mandar solo lo que cambió.
    let enviado = { carrito: "", favoritos: "" };
    const foto = () => ({ carrito: JSON.stringify(lineasCarrito()), favoritos: JSON.stringify(obtenerFavoritos()) });

    const guardar = () => {
      if (!vigente || !listo || leerMarca() !== usuario) return;
      const ahora = foto();
      const cambios: { carrito?: unknown; favoritos?: unknown } = {};
      if (ahora.carrito !== enviado.carrito) cambios.carrito = JSON.parse(ahora.carrito);
      if (ahora.favoritos !== enviado.favoritos) cambios.favoritos = JSON.parse(ahora.favoritos);
      if (Object.keys(cambios).length === 0) return;
      enviado = ahora;
      void accionGuardarDatosCuenta(cambios);
    };
    const alCambiar = () => {
      clearTimeout(espera);
      espera = setTimeout(guardar, 500);
    };
    // Si cierra la pestaña antes del medio segundo, se guarda ya.
    const alOcultar = () => {
      if (document.visibilityState !== "hidden") return;
      clearTimeout(espera);
      guardar();
    };
    // Suscribirse también carga los dos almacenes desde localStorage.
    const soltar = [suscribirCarrito(alCambiar), suscribirFavoritos(alCambiar)];
    document.addEventListener("visibilitychange", alOcultar);

    (async () => {
      // Si este navegador tenía los datos de OTRA cuenta (no cerró sesión), esos no se juntan con los de esta.
      const datos =
        marca === usuario
          ? await accionLeerDatosCuenta()
          : await accionSincronizarAlEntrar(
              marca ? { carrito: [], favoritos: [] } : { carrito: lineasCarrito(), favoritos: obtenerFavoritos() },
            );
      if (!vigente || !datos) return;
      guardarItems(datos.carrito);
      reemplazarFavoritos(datos.favoritos);
      enviado = foto();
      ponerMarca(usuario);
      listo = true;
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
