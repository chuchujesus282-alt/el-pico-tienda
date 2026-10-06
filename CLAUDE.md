# Centro Ferretero El Pico — Tienda web

Tienda en línea de Centro Ferretero El Pico (Caracas). Next.js (App Router) + TypeScript + Tailwind CSS, publicada en Vercel.
Dos personas trabajan en paralelo, cada una con su propia sesión de Claude Code. La consistencia visual es la prioridad número uno.

Guía visual completa: @docs/guia-de-estilo.md
Contrato de datos de productos: @docs/datos.md
Next.js 16 (APIs distintas a las que conoces; consulta `node_modules/next/dist/docs/`): @AGENTS.md

## Fase actual del proyecto
- Fase 1: catálogo por categorías con precios. El carrito NO cobra: arma un mensaje y redirige a WhatsApp para cerrar la venta.
- No hay inventario ni existencias en esta fase. No mostrar "disponible/agotado".

## Comandos
- `npm run dev` — servidor local en http://localhost:3000
- `npm run build` — debe pasar sin errores antes de cada commit
- `npm run lint` — debe pasar sin errores antes de cada commit
- No hay pruebas automatizadas; `lint` + `build` (que también chequea tipos) son la verificación.

## Estructura
- `app/page.tsx` — página principal (responsable: persona A)
- `app/categoria/[slug]/page.tsx` — página de categoría (responsable: persona B)
- `app/producto/[id]/page.tsx` — página de producto (responsable: persona B, rama `producto`)
- `components/producto-detalle/` — piezas exclusivas de la página de producto
- `components/layout/` — Header, NavCategorias, Footer (COMPARTIDOS)
- `components/ui/` — piezas base: Boton, Badge, Precio, Contenedor, TituloSeccion (COMPARTIDOS)
- `components/producto/` — ProductCard, CarruselProductos, GrillaProductos (COMPARTIDOS)
- `components/inicio/` — piezas exclusivas de la página principal
- `components/categoria/` — piezas exclusivas de la página de categoría
- `lib/catalogo.ts` — ÚNICA puerta de entrada a los datos de productos
- `lib/mock/` — datos de prueba mientras el servidor no esté conectado
- `types/` — tipos compartidos (Producto, Categoria, Banner)
- `public/banners/`, `public/marcas/` — imágenes propias
- `components/carrito/` — carrito (COMPARTIDO); `lib/whatsapp.ts` arma el mensaje del pedido, `lib/formato.ts` formatea precios
- `app/muestra/` — vitrina TEMPORAL de los componentes compartidos (`/muestra`); útil para revisarlos

## Arquitectura
- `lib/catalogo.ts` importa `server-only`: solo se usa en Server Components. Los componentes cliente (`"use client"`) reciben los productos por props.
- Sin `CATALOGO_API_URL`, `lib/catalogo.ts` responde con `lib/mock/`; con ella, consulta la API con `revalidate: 300`. Toda función nueva de datos debe cubrir ambos caminos.
- Next 16: `params` es una `Promise` (`const { slug } = await params`) y las páginas se tipan con los helpers globales `PageProps<"/ruta">` / `LayoutProps<"/">`.
- Carrito: `ProveedorCarrito` envuelve todo en `app/layout.tsx` y renderiza `PanelCarrito`. El estado vive en `localStorage` (clave `el-pico:carrito`) vía `useSyncExternalStore` en `almacenCarrito.ts`, sincronizado entre pestañas. Desde componentes cliente usa el hook `useCarrito()`.
- Precios en USD como `number`; para mostrarlos, `Precio` (o `formatearPrecio` en texto plano, ej. el mensaje de WhatsApp).
- Imágenes remotas: cuando la API entregue URLs, agrega el dominio a `images.remotePatterns` en `next.config.ts`.
- `Producto.descripcion` es opcional (`string | null`): llegará de la base de datos en una fase futura. Las páginas la muestran solo si viene; no inventes descripciones en `lib/mock/`.
- Título legible de un producto: `tituloProducto()` en `components/producto-detalle/tituloProducto.ts` ("TALADRO PERCUTOR 1/2\" 650W" + PROTEK → "Taladro percutor Protek 1/2\" 650W"). Las tarjetas (`ProductCard`) siguen mostrando el nombre en MAYÚSCULAS tal como viene del sistema.
- "Comprar ahora" (página de producto) no usa el carrito: abre WhatsApp con `armarMensajePedido([{ producto, cantidad }])`.

## Reglas de diseño (obligatorias)
- Colores: usa SOLO los tokens de `app/globals.css` (`bg-pico-azul`, `text-pico-rojo`, etc.). Nunca escribas un color hex dentro de un componente.
- Antes de crear un componente, busca si ya existe en `components/ui/`, `components/layout/` o `components/producto/`. Reutiliza; no dupliques.
- Todo producto se muestra con `ProductCard`. No inventes otra tarjeta de producto.
- Todo precio se muestra con el componente `Precio`.
- Todo título de sección usa `TituloSeccion` (título a la izquierda, enlace "Ver todo" a la derecha).
- El contenido va dentro de `Contenedor` (ancho máximo y márgenes laterales consistentes).
- Diseño mobile-first. Revisa siempre en 375px, 768px y 1280px.
- Iconos: solo `lucide-react`. Imágenes: solo `next/image`.
- Textos de la interfaz en español de Venezuela, tuteando al cliente.

## Referencia visual
- Nos inspiramos en la DISTRIBUCIÓN y las FORMAS de tienda.campienlinea.com (capturas en `docs/referencia/`).
- NUNCA copies su logo, imágenes, banners, textos ni nombre. Todo el contenido y la marca son de El Pico.

## Reglas de trabajo en equipo
- No modifiques componentes COMPARTIDOS sin que la tarea lo pida explícitamente. Si hace falta cambiar uno, avisa al usuario antes, porque afecta la página del compañero.
- Si un componente compartido necesita una variante, agrégala con una prop opcional; no cambies su comportamiento por defecto.
- Cada persona trabaja en su rama (`inicio`, `categorias`, `producto`), nunca directo en `main`.
- Datos de productos: siempre a través de `lib/catalogo.ts`. Nunca hagas `fetch` al servidor desde un componente.
- Variables secretas solo en `.env.local` (no se sube). Documenta cualquier variable nueva en `.env.example`.
- Antes de hacer commit: `npm run lint` y `npm run build` sin errores.
- Mensajes de commit en español, cortos y descriptivos.
- Con cada cambio importante (página nueva, cambio en el contrato de datos o en un archivo compartido, convención nueva, rama nueva), actualiza este CLAUDE.md en la misma rama: ajusta las secciones afectadas y agrega una línea al "Registro de cambios". Es la forma en que la sesión de Claude del compañero se entera y evita conflictos.

## Registro de cambios
Lo más reciente arriba. Formato: fecha · rama · quién · qué cambió y qué debe saber el compañero.
- 2026-10-06 · `producto` · persona B · Nueva página `/producto/[id]` (imagen, título, precio, cantidad, "Agregar al carrito", "Comprar ahora" por WhatsApp, bloque Delivery/Fletes/Pick-up, relacionados) con loading/error/not-found. Piezas en `components/producto-detalle/`. Archivos compartidos tocados: `types/catalogo.ts` y `docs/datos.md` (campo opcional `descripcion`, no rompe nada). Subida a GitHub en la rama `producto`, pendiente de pull request a `main`.
- 2026-10-06 · `producto` · persona B · Rama `producto` creada desde `main`.
- 2026-10-03 · `categorias` · persona B · Página `/categoria/[slug]` completa (filtros subcategoría/marca, orden, paginación, estados) con piezas en `components/categoria/`; filtros/orden/página viven en la URL. Sin filtro de precio: `getProductosPorCategoria` no lo soporta; si se agrega, hay que acordar el cambio de contrato. Subida a GitHub en la rama `categorias`, pendiente de pull request a `main`. No toca archivos compartidos.
