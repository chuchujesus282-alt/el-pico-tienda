import { getCategorias } from "@/lib/catalogo";
import type { Categoria } from "@/types/catalogo";
import BarraInferiorMovil from "./BarraInferiorMovil";

/** Barra de navegación fija abajo en el teléfono. Trae las categorías del catálogo para su hoja "Categorías". */
export default async function BarraInferior() {
  let categorias: Categoria[] = [];
  try {
    categorias = await getCategorias();
  } catch {
    // Si el catálogo no responde, la hoja lo avisa y el resto de la barra sigue funcionando.
  }
  return <BarraInferiorMovil categorias={categorias} />;
}
