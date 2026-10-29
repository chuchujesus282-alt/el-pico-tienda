// Estilo de los accesos de la derecha del header (Calculadoras, Favoritos, Mi cuenta, Carrito): UN solo lugar para que
// los cuatro se vean igual. Si agregas otro acceso al header, usa claseAccionHeader().
// - Al pasar el mouse: un tono suave del azul de la marca (el header ya es azul claro; un fondo blanco no combinaba).
// - En su página (Calculadoras y Favoritos): azul marino con letra blanca, como la pestaña activa de la barra inferior.

const BASE =
  "group grupo-icono items-center gap-2 rounded-boton p-2.5 text-sm font-semibold cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul";

export function claseAccionHeader(activo = false): string {
  return `${BASE} ${activo ? "bg-pico-azul text-pico-blanco hover:bg-pico-azul-oscuro" : "text-pico-azul hover:bg-pico-azul/8"}`;
}

/** ¿La página actual es esa sección (o una de sus páginas)? Ej.: "/calculadoras/bloques" está en "/calculadoras". */
export function estaEn(ruta: string | null, seccion: string): boolean {
  return !!ruta && (ruta === seccion || ruta.startsWith(`${seccion}/`));
}
