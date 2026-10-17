/**
 * La miniatura de un producto "vuela" en arco hasta el carrito visible (header, bola flotante o barra inferior del
 * teléfono, marcados con data-destino-carrito). Solo transform y opacidad (Web Animations), sobre una copia
 * fija en <body>; con "reducir movimiento", o si no hay carrito a la vista, no hace nada.
 */
export function volarAlCarrito(origen: Element | null) {
  if (typeof window === "undefined" || !origen) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const foto = origen.querySelector("img");
  const desde = (foto ?? origen).getBoundingClientRect();
  const destino = [...document.querySelectorAll<HTMLElement>("[data-destino-carrito]")]
    .map((el) => el.getBoundingClientRect())
    .find((r) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight);
  if (!destino || desde.width === 0) return;

  const lado = Math.min(desde.width, desde.height, 120);
  const copia = document.createElement("div");
  copia.setAttribute("aria-hidden", "true");
  Object.assign(copia.style, {
    position: "fixed",
    left: `${desde.left + desde.width / 2 - lado / 2}px`,
    top: `${desde.top + desde.height / 2 - lado / 2}px`,
    width: `${lado}px`,
    height: `${lado}px`,
    zIndex: "60",
    pointerEvents: "none",
    borderRadius: "14px",
    background: "var(--color-pico-blanco)",
    boxShadow: "var(--shadow-tarjeta-hover)",
    overflow: "hidden",
  } satisfies Partial<CSSStyleDeclaration>);
  if (foto) {
    const img = document.createElement("img");
    img.src = foto.currentSrc || foto.src;
    img.alt = "";
    Object.assign(img.style, { width: "100%", height: "100%", objectFit: "contain", padding: "8%" });
    copia.appendChild(img);
  }
  document.body.appendChild(copia);

  const dx = destino.left + destino.width / 2 - (desde.left + desde.width / 2);
  const dy = destino.top + destino.height / 2 - (desde.top + desde.height / 2);
  // Arco: a mitad de camino sube por encima de la recta (más alto mientras más lejos va).
  const alto = Math.min(160, Math.abs(dx) * 0.35 + 60);
  const vuelo = copia.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - alto}px) scale(0.55)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.35 },
    ],
    { duration: 750, easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
  );
  vuelo.onfinish = vuelo.oncancel = () => copia.remove();
}
