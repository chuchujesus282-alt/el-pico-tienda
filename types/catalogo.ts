// Contrato de datos: ver docs/datos.md. Si cambia, avisa al compañero.

export type Producto = {
  id: string; // código del producto en el sistema
  nombre: string;
  titulo?: string; // ya listo para mostrar (productos de Saint, lib/nombresSaint.ts); si falta, tituloProducto() lo arma
  marca: string | null;
  precio: number; // en USD, sin formato
  precioBs?: number; // en bolívares con IVA, tal como lo da Saint (solo productos de Saint)
  tasa?: number; // tasa BCV con la que Saint calculó el precio en dólares (precio = precioBs / tasa)
  imagen: string | null; // URL absoluta o null
  categoriaSlug: string;
  subcategoria: string | null;
  descripcion?: string | null; // texto largo para la página de producto; llegará de la base de datos
  ventas?: number; // unidades vendidas en los últimos 90 días; ordena los "más vendidos" (opcional)
  variantes?: number; // solo la tarjeta de un GRUPO (lib/agrupaciones.ts): cuántas medidas agrupa; precio = el más bajo
};

export type Categoria = {
  slug: string; // ej. "herramientas"
  nombre: string; // ej. "Herramientas"
  banner: string | null;
};

export type ResultadoCategoria = {
  productos: Producto[];
  total: number;
  pagina: number;
  porPagina: number;
  marcas: string[]; // para el filtro (vacío: el filtro no se muestra)
  subcategorias: string[]; // para el filtro
  cantidades?: Record<string, number>; // productos de cada subcategoría (Saint), al lado del filtro
};

export type OrdenProductos = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

export type OpcionesCategoria = {
  pagina?: number;
  porPagina?: number;
  marca?: string;
  subcategoria?: string;
  orden?: OrdenProductos;
  q?: string; // búsqueda dentro de la categoría (nombre, código o marca)
};

/** Producto que suele comprarse junto con otro (sale de las facturas del SQL). */
export type CompradoJunto = {
  id: string;
  puntaje: number; // 0 a 1: qué tan seguido van en la misma factura
};

export type Banner = {
  id: string;
  imagen: string; // ruta en public/banners/ o URL absoluta
  alt: string;
  href: string;
};
