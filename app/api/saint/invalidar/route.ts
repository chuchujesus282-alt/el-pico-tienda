import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CATEGORIAS_SAINT } from "@/lib/categoriasSaint";
import { ETIQUETA_SAINT, etiquetaCategoria, olvidarSaint } from "@/lib/saint";

// Forzar que la tienda vuelva a pedirle los productos a Saint (por ejemplo, después de corregir un precio). Protegida
// con SAINT_INVALIDAR_CLAVE (.env.example). Responsable: persona A.
//   POST /api/saint/invalidar                          → las 10 categorías
//   POST /api/saint/invalidar?categoria=herramientas   → solo esa (slug de lib/categoriasSaint.ts)
//   Header: Authorization: Bearer <SAINT_INVALIDAR_CLAVE>
// La caché compartida queda vencida sin servir lo viejo (expire: 0): la próxima visita espera a Saint. El servidor que
// recibe la llamada olvida su memoria al momento; los demás, en su próxima revisión (como mucho 1 minuto).
// Sin la variable, la ruta no existe (404). Solo POST: ningún buscador ni vista previa de enlace la dispara.

const CLAVE = process.env.SAINT_INVALIDAR_CLAVE;

const huella = (texto: string) => createHash("sha256").update(texto).digest();

/** Compara la clave sin dar pistas por el tiempo que tarda. */
function claveCorrecta(encabezado: string | null): boolean {
  if (!CLAVE || !encabezado?.startsWith("Bearer ")) return false;
  return timingSafeEqual(huella(encabezado.slice("Bearer ".length)), huella(CLAVE));
}

export async function POST(request: Request) {
  if (!CLAVE) return new Response(null, { status: 404 });
  if (!claveCorrecta(request.headers.get("authorization"))) {
    return Response.json({ error: "Clave incorrecta" }, { status: 401 });
  }

  const slug = new URL(request.url).searchParams.get("categoria");
  if (slug !== null && !(slug in CATEGORIAS_SAINT)) {
    return Response.json({ error: `Categoría desconocida. Usa una de: ${Object.keys(CATEGORIAS_SAINT).join(", ")}` }, { status: 400 });
  }

  if (slug === null) {
    revalidateTag(ETIQUETA_SAINT, { expire: 0 });
    olvidarSaint();
  } else {
    const codigo = CATEGORIAS_SAINT[slug];
    revalidateTag(etiquetaCategoria(codigo), { expire: 0 });
    olvidarSaint(codigo);
  }
  const invalidadas = slug === null ? Object.keys(CATEGORIAS_SAINT) : [slug];
  console.info(`[saint] caché invalidada · ${invalidadas.join(", ")}`);
  return Response.json(
    { invalidadas, aviso: "La próxima visita le pide a Saint. Todos los servidores lo notan en menos de 1 minuto." },
    { headers: { "Cache-Control": "no-store" } },
  );
}
