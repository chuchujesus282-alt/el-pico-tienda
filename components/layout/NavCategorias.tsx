import { getCategorias } from "@/lib/catalogo";
import type { Categoria } from "@/types/catalogo";
import EnlacesCategorias from "./EnlacesCategorias";
import OcultarEnRutas from "./OcultarEnRutas";

/**
 * Barra azul con las categorías, bajo el header blanco; en móvil se desliza horizontalmente.
 * Solo va en las páginas de compra (inicio, categorías, buscar, finalizar pedido): en las páginas
 * informativas y de cuenta no se muestra. Para cambiarlo, edita SIN_BARRA.
 */
const SIN_BARRA = [
  "/producto/",
  "/ubicanos",
  "/horario",
  "/calculadoras",
  "/como-comprar",
  "/contacto",
  "/politicas-de-privacidad",
  "/iniciar-sesion",
  "/crear-cuenta",
];

export default async function NavCategorias() {
  let categorias: Categoria[] = [];
  try {
    categorias = await getCategorias();
  } catch {
    // Si el catálogo no responde, la barra queda vacía pero la página sigue funcionando.
  }

  return (
    <OcultarEnRutas prefijos={SIN_BARRA}>
      <nav aria-label="Categorías" className="relative bg-gradient-to-r from-pico-azul-oscuro via-pico-azul to-pico-azul-oscuro shadow-tarjeta">
        {/* Filete rojo fino abajo, como el del footer. */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-pico-rojo to-transparent" aria-hidden />
        <EnlacesCategorias categorias={categorias} />
      </nav>
    </OcultarEnRutas>
  );
}
