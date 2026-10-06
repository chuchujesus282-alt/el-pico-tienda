// Contrato de datos: ver docs/datos.md. Si cambia, avisa al compañero.

export type Producto = {
  id: string; // código del producto en el sistema
  nombre: string;
  marca: string | null;
  precio: number; // en USD, sin formato
  imagen: string | null; // URL absoluta o null
  categoriaSlug: string;
  subcategoria: string | null;
  descripcion?: string | null; // texto largo para la página de producto; llegará de la base de datos
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
  marcas: string[]; // para el filtro
  subcategorias: string[]; // para el filtro
};

export type OrdenProductos = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

export type OpcionesCategoria = {
  pagina?: number;
  porPagina?: number;
  marca?: string;
  subcategoria?: string;
  orden?: OrdenProductos;
};

export type Banner = {
  id: string;
  imagen: string; // ruta en public/banners/ o URL absoluta
  alt: string;
  href: string;
};
