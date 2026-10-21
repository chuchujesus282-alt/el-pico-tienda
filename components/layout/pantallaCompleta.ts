/**
 * Páginas que ocupan toda la pantalla, sin header (logo, buscador, tasa BCV), barra de categorías, footer
 * ni barra inferior del teléfono. Cada una trae su propia salida ("Volver a la tienda"). ÚNICO lugar donde se cambia.
 */
export const RUTAS_PANTALLA_COMPLETA = ["/iniciar-sesion", "/crear-cuenta", "/demo-tarjeta"];

/** En el teléfono, el header (logo, tasa, dirección y buscador) solo sale en estas rutas ("/" exacta, las demás por prefijo). */
export const RUTAS_CON_HEADER_MOVIL = ["/", "/buscar"];
