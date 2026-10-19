/**
 * Vibración corta al tocar algo (las pestañas de la barra inferior). Llamar SOLO dentro de un toque o clic:
 * los navegadores la ignoran fuera de un gesto del usuario.
 * - Android y demás: `navigator.vibrate`.
 * - iPhone (Safari no tiene `navigator.vibrate`): desde iOS 18, activar un interruptor `<input type="checkbox" switch>`
 *   da un toque háptico del sistema; se crea uno oculto, se toca y se quita.
 * Si el teléfono no lo permite (o el usuario apagó la vibración del sistema), no pasa nada.
 */
export function vibrar() {
  if (typeof window === "undefined") return;
  try {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(10);
      return;
    }
    const etiqueta = document.createElement("label");
    etiqueta.ariaHidden = "true";
    etiqueta.style.display = "none";
    const interruptor = document.createElement("input");
    interruptor.type = "checkbox";
    interruptor.setAttribute("switch", "");
    etiqueta.appendChild(interruptor);
    document.head.appendChild(etiqueta);
    etiqueta.click();
    etiqueta.remove();
  } catch {
    // Sin vibración: la pestaña funciona igual.
  }
}
