import { claveSinRepetir, esRobot, type Evento, LIMITES, limpiarEvento, MINUTOS_SIN_REPETIR } from "./reglas";

// Eventos para análisis — lado del navegador. ÚNICA función que usan las páginas: registrarEvento(). No sabe ni le
// importa cómo se guardan (eso es /api/eventos + lib/eventos/servidor.ts): el buscador, el carrito o una página solo
// la "llaman". Nunca lanza un error ni hace esperar a nadie:
// - los eventos se juntan y se mandan 2 segundos después del último (o al juntar 10);
// - al cerrar o esconder la pestaña se mandan con sendBeacon (el navegador los entrega aunque la página se vaya);
// - si algo falla, esos eventos se pierden y la página sigue igual.
// "Producto visto" y "categoría vista" no se mandan si ya se mandaron en los últimos 30 minutos (se anota en
// localStorage; el servidor lo vuelve a revisar). Ver docs/eventos.md.

const RUTA = "/api/eventos";
const ESPERA_MS = 2000;
const JUNTAR_HASTA = 10;
const CLAVE_RECIENTES = "el-pico:eventos-recientes";

let cola: Evento[] = [];
let temporizador: ReturnType<typeof setTimeout> | undefined;
let escuchando = false;

function puedeEnviar(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  // Navegadores manejados por programas (pruebas automáticas, robots que corren JavaScript).
  if (navigator.webdriver) return false;
  return !esRobot(navigator.userAgent);
}

/** ¿Ya se mandó hace menos de 30 minutos? Si no, lo anota. Sin localStorage, deja pasar (el servidor filtra). */
function repetidoReciente(clave: string): boolean {
  try {
    const ahora = Date.now();
    const limite = ahora - MINUTOS_SIN_REPETIR * 60_000;
    const guardado = JSON.parse(window.localStorage.getItem(CLAVE_RECIENTES) ?? "{}") as Record<string, number>;
    const vigentes = Object.fromEntries(Object.entries(guardado).filter(([, fecha]) => fecha > limite));
    if (vigentes[clave]) return true;
    vigentes[clave] = ahora;
    window.localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(vigentes));
    return false;
  } catch {
    return false;
  }
}

function enviar() {
  clearTimeout(temporizador);
  temporizador = undefined;
  while (cola.length > 0) {
    const lote = cola.slice(0, LIMITES.porEnvio);
    cola = cola.slice(LIMITES.porEnvio);
    // text/plain: así sendBeacon no necesita permisos extra (CORS) y el servidor lee el JSON igual.
    const cuerpo = JSON.stringify({ eventos: lote });
    try {
      const entregado = navigator.sendBeacon?.(RUTA, new Blob([cuerpo], { type: "text/plain;charset=UTF-8" }));
      if (!entregado) {
        void fetch(RUTA, {
          method: "POST",
          body: cuerpo,
          keepalive: true,
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
        }).catch(() => {});
      }
    } catch {
      // Sin red o bloqueado: se pierden estos eventos, nada más.
    }
  }
}

function escucharSalida() {
  if (escuchando) return;
  escuchando = true;
  const alSalir = () => {
    if (document.visibilityState === "hidden") enviar();
  };
  document.addEventListener("visibilitychange", alSalir);
  window.addEventListener("pagehide", enviar);
}

/**
 * Registra un evento para análisis, en segundo plano. Ej.:
 *   registrarEvento({ tipo: "carrito", producto: "ACS0082" })
 *   registrarEvento({ tipo: "busqueda", termino: "llave 11", resultados: 12 })
 */
export function registrarEvento(evento: Evento): void {
  try {
    if (!puedeEnviar()) return;
    const limpio = limpiarEvento(evento);
    if (!limpio) return;
    const clave = claveSinRepetir(limpio);
    if (clave && repetidoReciente(clave)) return;

    cola.push(limpio);
    escucharSalida();
    if (cola.length >= JUNTAR_HASTA) enviar();
    else {
      clearTimeout(temporizador);
      temporizador = setTimeout(enviar, ESPERA_MS);
    }
  } catch {
    // Nunca rompe la página.
  }
}
