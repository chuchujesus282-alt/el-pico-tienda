/**
 * Check que se dibuja con su trazo al aparecer (stroke-dashoffset; quieto con "reducir movimiento").
 * Para marcar algo recién elegido o completado: opciones del pedido, pasos, "Agregado".
 */
export default function CheckDibujado({ className = "size-3.5", grosor = 3 }: { className?: string; grosor?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" className={`check-dibujado shrink-0 ${className}`} aria-hidden>
      <path pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
