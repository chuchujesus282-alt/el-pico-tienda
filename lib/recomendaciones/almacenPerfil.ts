import { agregarSenal, validarSenales } from "./perfil";
import type { Senal } from "./tipos";

// Guarda el perfil en el navegador (localStorage). Solo IDs de producto, términos de búsqueda y fechas.
// Todo va con try/catch: en modo privado o sin almacenamiento, el perfil queda vacío y la página sigue igual.

const CLAVE = "el-pico:perfil";
const VERSION = 1;

type Guardado = { version: number; senales: Senal[] };

export function leerSenales(): Senal[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return [];
    const datos = JSON.parse(crudo) as Partial<Guardado>;
    return datos.version === VERSION ? validarSenales(datos.senales) : [];
  } catch {
    return [];
  }
}

/** Anota señales nuevas (con la fecha de ahora). Ej.: registrarSenales([{ tipo: "visto", id: "00605004" }]). */
export function registrarSenales(nuevas: Omit<Senal, "fecha">[]) {
  try {
    let senales = leerSenales();
    const ahora = Date.now();
    for (const s of nuevas) {
      const limpia: Senal =
        s.tipo === "busqueda"
          ? { tipo: s.tipo, termino: (s.termino ?? "").trim().toLowerCase().slice(0, 60), fecha: ahora }
          : { tipo: s.tipo, id: s.id, fecha: ahora };
      if (validarSenales([limpia]).length) senales = agregarSenal(senales, limpia);
    }
    const guardado: Guardado = { version: VERSION, senales };
    window.localStorage.setItem(CLAVE, JSON.stringify(guardado));
  } catch {
    // Sin almacenamiento: no pasa nada, solo no se personaliza.
  }
}

export function registrarSenal(senal: Omit<Senal, "fecha">) {
  registrarSenales([senal]);
}
