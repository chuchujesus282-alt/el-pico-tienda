/** Cuánto tiene que moverse el dedo (px) para que el toque cuente como desplazar la página y no como entrar. */
const UMBRAL = 10;

/** La única tarjeta animada en este momento (compartida por todas las tarjetas de la página). */
let actual: { card: HTMLElement; apagar: () => void } | null = null;

/**
 * Teléfono (sin mouse): la tarjeta se anima cuando el dedo la toca para DESPLAZAR la página, y vuelve a reposo cuando
 * sale de la pantalla. Un toque sin desplazar es un clic normal: entra a la categoría sin animar.
 * Solo una a la vez: al animarse una, la que estaba animada vuelve a reposo aunque no haya terminado.
 * Devuelve la limpieza (quita los listeners y el observador).
 */
export function animarAlDesplazar(card: HTMLElement, encenderTarjeta: () => void, apagarTarjeta: () => void) {
  const encender = () => {
    if (actual && actual.card !== card) actual.apagar();
    actual = { card, apagar: apagarTarjeta };
    encenderTarjeta();
  };
  const apagar = () => {
    if (actual?.card === card) actual = null;
    apagarTarjeta();
  };

  let x0 = 0,
    y0 = 0,
    desplazando = false;
  const onStart = (e: TouchEvent) => {
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
    desplazando = false;
  };
  const onMove = (e: TouchEvent) => {
    if (desplazando) return;
    const t = e.touches[0];
    if (Math.abs(t.clientX - x0) > UMBRAL || Math.abs(t.clientY - y0) > UMBRAL) {
      desplazando = true;
      encender();
    }
  };
  const observador = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) apagar();
  });

  card.addEventListener("touchstart", onStart, { passive: true });
  card.addEventListener("touchmove", onMove, { passive: true });
  observador.observe(card);
  return () => {
    card.removeEventListener("touchstart", onStart);
    card.removeEventListener("touchmove", onMove);
    observador.disconnect();
    if (actual?.card === card) actual = null;
  };
}
