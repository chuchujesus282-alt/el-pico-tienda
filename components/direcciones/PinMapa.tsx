/**
 * Pin de El Pico para los mapas: gota roja con las dos montañas del logo (mismo trazo que `Montanas`)
 * en blanco. La punta de abajo es el punto exacto (colócalo con `-translate-x-1/2 -translate-y-full`).
 */
export function PinMapa({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 52" className={`w-auto drop-shadow-[0_6px_6px_rgb(7_29_51/0.35)] ${className}`} aria-hidden>
      <path
        d="M20 51C20 51 38 33.6 38 19.5C38 9.3 29.9 1 20 1S2 9.3 2 19.5C2 33.6 20 51 20 51Z"
        className="fill-pico-rojo stroke-pico-blanco"
        strokeWidth="2"
      />
      <svg x="9" y="12" width="22" height="15" viewBox="263 263 1474 999">
        <path
          fillRule="evenodd"
          d="M263 1262 L763 421 L988 800 L1250 263 L1737 1262 Z M482 1137 L763 665 L1043 1137 Z"
          className="fill-pico-blanco"
        />
      </svg>
    </svg>
  );
}
