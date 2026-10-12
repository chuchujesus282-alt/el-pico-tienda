# Contrato de datos — productos y categorías

Las dos páginas (inicio y categoría) consumen productos de la MISMA forma. Este archivo es el acuerdo; si cambia, se avisa al compañero.

## Tipos (types/catalogo.ts)
```ts
export type Producto = {
  id: string;            // código del producto en el sistema
  nombre: string;
  marca: string | null;
  precio: number;        // en USD, sin formato
  imagen: string | null; // URL absoluta o null
  categoriaSlug: string;
  subcategoria: string | null;
  descripcion?: string | null; // opcional; la página de producto la muestra solo si viene
  ventas?: number;       // unidades vendidas (últimos 90 días); ordena los "más vendidos". Opcional
};

// Producto que suele ir en la misma factura que otro (sale de las facturas del SQL).
export type CompradoJunto = {
  id: string;
  puntaje: number;       // 0 a 1
};

export type Categoria = {
  slug: string;          // ej. "herramientas"
  nombre: string;        // ej. "Herramientas"
  banner: string | null;
};

export type ResultadoCategoria = {
  productos: Producto[];
  total: number;
  pagina: number;
  porPagina: number;
  marcas: string[];          // para el filtro
  subcategorias: string[];   // para el filtro
};
```

## Funciones (lib/catalogo.ts) — única puerta de entrada
```ts
getCategorias(): Promise<Categoria[]>
getProductosDestacados(seccion: string, limite?: number): Promise<Producto[]>
getProductosPorCategoria(slug: string, opciones: {
  pagina?: number; porPagina?: number;
  marca?: string; subcategoria?: string;
  orden?: "relevancia" | "precio-asc" | "precio-desc" | "nombre";
}): Promise<ResultadoCategoria>
getProducto(id: string): Promise<Producto | null>

// Búsqueda y recomendaciones (lib/recomendaciones/)
getIndiceProductos(): Promise<Producto[]>                       // todo el catálogo, para buscar y recomendar
getMasVendidos(limite?: number, categoria?: string): Promise<Producto[]>
getCompradosJuntos(id: string, limite?: number): Promise<CompradoJunto[]>  // [] mientras no haya facturas
```

## De dónde salen los datos
- Si `CATALOGO_API_URL` NO está definida → `lib/catalogo.ts` devuelve datos de `lib/mock/` (unos 70 productos de prueba repartidos en varias categorías, con `ventas` inventadas). Así ambos pueden trabajar sin el servidor.
- Si está definida → consulta la API del servidor de la ferretería a través del túnel de Cloudflare.

## Reglas de la conexión con el servidor
- Las llamadas a la API se hacen SOLO del lado del servidor de Next (Server Components o Route Handlers), nunca desde el navegador. Así la URL del túnel y el token no quedan expuestos.
- Enviar el header `Authorization: Bearer ${CATALOGO_API_TOKEN}` en cada llamada.
- Usar caché de Next con revalidación (`next: { revalidate: 300 }`): si el servidor de la tienda se cae, el sitio sigue mostrando la última versión.
- Si la API falla, mostrar el estado de error amable; la página nunca debe romperse.
- El túnel NUNCA expone SQL Server directamente: delante va una API pequeña de solo lectura, con un usuario de base de datos que solo puede hacer SELECT sobre vistas preparadas.

## Endpoints esperados de la API (para cuando se construya)
- `GET /categorias`
- `GET /productos/destacados?seccion=recomendados&limite=10`
- `GET /categorias/:slug/productos?pagina=1&porPagina=24&marca=&subcategoria=&orden=`
- `GET /productos/:id`
- `GET /productos/indice` — todos los productos (con `ventas`), para la búsqueda y las recomendaciones
- `GET /productos/mas-vendidos?limite=10&categoria=`
- `GET /productos/:id/comprados-juntos?limite=8` — calculado con las facturas: veces juntos / √(facturas de A × facturas de B). La función `compradosJuntos()` de `lib/recomendaciones/relacionados.ts` hace ese cálculo y sirve de referencia

Las respuestas devuelven JSON con la misma forma que los tipos de arriba.
