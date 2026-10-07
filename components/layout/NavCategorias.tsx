import { getCategorias } from "@/lib/catalogo";
import type { Categoria } from "@/types/catalogo";
import EnlacesCategorias from "./EnlacesCategorias";
import OcultarEnRutas from "./OcultarEnRutas";

/** Barra azul oscuro con las categorías; en móvil se desliza horizontalmente. */
export default async function NavCategorias() {
  let categorias: Categoria[] = [];
  try {
    categorias = await getCategorias();
  } catch {
    // Si el catálogo no responde, la barra queda vacía pero la página sigue funcionando.
  }

  // La página de producto no muestra la barra (decisión de persona B, ver CLAUDE.md).
  return (
    <OcultarEnRutas prefijos={["/producto/"]}>
      <nav aria-label="Categorías" className="bg-pico-azul-oscuro">
        <EnlacesCategorias categorias={categorias} />
      </nav>
    </OcultarEnRutas>
  );
}
