import { getCategorias } from "@/lib/catalogo";
import type { Categoria } from "@/types/catalogo";
import EnlacesCategorias from "./EnlacesCategorias";

/** Barra azul con las categorías, bajo el header blanco; en móvil se desliza horizontalmente. */
export default async function NavCategorias() {
  let categorias: Categoria[] = [];
  try {
    categorias = await getCategorias();
  } catch {
    // Si el catálogo no responde, la barra queda vacía pero la página sigue funcionando.
  }

  return (
    <nav aria-label="Categorías" className="bg-pico-azul">
      <EnlacesCategorias categorias={categorias} />
    </nav>
  );
}
