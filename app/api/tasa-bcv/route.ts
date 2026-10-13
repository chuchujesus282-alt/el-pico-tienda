import { getTasaBCV } from "@/lib/tasa";

// Entrega la tasa BCV al navegador (la píldora del header). Pasa por lib/tasa.ts: la URL y el token
// del endpoint real nunca llegan al navegador. Se guarda 10 minutos.

export const revalidate = 600;

export async function GET() {
  const tasa = await getTasaBCV();
  // Sin tasa: el header muestra el último valor que tenga guardado o un guion.
  if (!tasa) return Response.json({ error: "Tasa BCV no disponible" }, { status: 503 });
  return Response.json(tasa);
}
