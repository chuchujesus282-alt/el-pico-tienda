# Centro Ferretero El Pico — Tienda web

Tienda en línea de Centro Ferretero El Pico (Caracas). Next.js (App Router) + TypeScript + Tailwind CSS, publicada en Vercel.
Dos personas trabajan en paralelo, cada una con su propia sesión de Claude Code. La consistencia visual es la prioridad número uno.

Guía visual completa: @docs/guia-de-estilo.md
Contrato de datos de productos: @docs/datos.md
Búsqueda inteligente, relacionados y "Te puede interesar": @docs/recomendaciones.md
Next.js 16 (APIs distintas a las que conoces; consulta `node_modules/next/dist/docs/`): @AGENTS.md

## Fase actual del proyecto
- Fase 1: catálogo por categorías con precios. El carrito NO cobra: arma un mensaje y redirige a WhatsApp para cerrar la venta.
- No hay inventario ni existencias en esta fase. No mostrar "disponible/agotado".

## Comandos
- `npm run dev` — servidor local en http://localhost:3000
- `npm run build` — debe pasar sin errores antes de cada commit
- `npm run lint` — debe pasar sin errores antes de cada commit
- `npm test` — pruebas de `lib/` con Vitest (búsqueda, relacionados, perfil, velocidad con 2000 productos); deben pasar antes de cada commit
- Verificación completa: `lint` + `test` + `build` (que también chequea tipos). La UI no tiene pruebas automáticas.

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
- `public/productos/` — fotos DE PRUEBA (1080×1080, WebP) de los productos de `lib/mock/`, una por ID; créditos y licencias en `public/productos/CREDITOS.md`
- `types/` — tipos compartidos (Producto, Categoria, Banner)
- `public/banners/`, `public/marcas/` — imágenes propias
- `components/carrito/` — carrito (COMPARTIDO); `lib/whatsapp.ts` arma el mensaje del pedido, `lib/formato.ts` formatea precios
- `lib/recomendaciones/` — búsqueda inteligente, relacionados y "Te puede interesar" (lógica pura, sin React; ver docs/recomendaciones.md)
- `datos/` — diccionarios EDITABLES sin programar: `sinonimos.json`, `complementarios.json`, `consumibles.json`
- `components/busqueda/` — `BuscadorConSugerencias` (va en el Header), `SinResultados` (COMPARTIDOS)
- `components/recomendaciones/` — `ProductosRelacionados`, `TePuedeInteresar`, `RegistrarSenal` (COMPARTIDOS)
- `app/buscar/page.tsx` — resultados de búsqueda (responsable: persona A); `app/api/indice-busqueda/route.ts` entrega el catálogo al navegador
- `app/muestra/` — vitrina TEMPORAL de los componentes compartidos (`/muestra`); útil para revisarlos

## Arquitectura
- `lib/catalogo.ts` importa `server-only`: solo se usa en Server Components. Los componentes cliente (`"use client"`) reciben los productos por props.
- Sin `CATALOGO_API_URL`, `lib/catalogo.ts` responde con `lib/mock/`; con ella, consulta la API con `revalidate: 300`. Toda función nueva de datos debe cubrir ambos caminos.
- Next 16: `params` es una `Promise` (`const { slug } = await params`) y las páginas se tipan con los helpers globales `PageProps<"/ruta">` / `LayoutProps<"/">`.
- Carrito: `ProveedorCarrito` envuelve todo en `app/layout.tsx` y renderiza `PanelCarrito`. El estado vive en `localStorage` (clave `el-pico:carrito`) vía `useSyncExternalStore` en `almacenCarrito.ts`, sincronizado entre pestañas. Desde componentes cliente usa el hook `useCarrito()`.
- Precios en USD como `number`; para mostrarlos, `Precio` (o `formatearPrecio` en texto plano, ej. el mensaje de WhatsApp).
- Nombre de producto para mostrar: `tituloProducto()` en `lib/formato.ts` ("TALADRO PERCUTOR 1/2\" 650W" + PROTEK → "Taladro percutor Protek 1/2\" 650W"). Lo usan `ProductCard`, el carrito y la página de producto; nunca muestres `producto.nombre` en MAYÚSCULAS. El mensaje de WhatsApp sí usa el nombre tal como viene del sistema.
- Búsqueda y recomendaciones (`lib/recomendaciones/`): los algoritmos RECIBEN la lista de productos (nunca importan `lib/catalogo.ts`) y funcionan igual en servidor y navegador. Los datos llegan por `getIndiceProductos()`, `getMasVendidos()` y `getCompradosJuntos()` de `lib/catalogo.ts`; al conectar el SQL solo cambia ese archivo. Todo texto se compara con `palabrasClave()` (sin acentos, singular, medidas y sinónimos unificados); no compares nombres de producto a mano. Sinónimos, complementarios y consumibles se editan en `datos/*.json`, nunca en el código. Para buscar en el navegador usa `cargarIndice()` de `components/busqueda/indiceCliente.ts` (descarga el catálogo una sola vez).
- `Producto.ventas?` (opcional) ordena los "más vendidos"; la API debe enviarlo. "Te puede interesar" del inicio ya no usa `getProductosDestacados("te-puede-interesar")`: el servidor manda `getMasVendidos(10)` y `TePuedeInteresar` lo personaliza en el navegador.
- Perfil del cliente: `localStorage` clave `el-pico:perfil` (`lib/recomendaciones/almacenPerfil.ts`, siempre con try/catch). Solo IDs de producto, términos de búsqueda y fechas; NUNCA datos personales. Señales: `whatsapp` (8), `carrito` (4), `visto` (2), `busqueda` (1), `compra` (8, para el historial del SQL). Ya se anotan solas en `agregar()`, en el botón de WhatsApp de `PanelCarrito` y en `/buscar`. Si creas otro punto de envío a WhatsApp (ej. `/finalizar-pedido`), anota `registrarSenales(items.map((i) => ({ tipo: "whatsapp", id: i.producto.id })))`. En la página de producto van `<RegistrarSenal senales={[{ tipo: "visto", id }]} />` y `<ProductosRelacionados producto={producto} />` (reemplaza el carrusel de "misma categoría").
- Imágenes de prueba: en `lib/mock/productos.ts` cada producto apunta a `/productos/{id}.webp`. Si agregas un producto de prueba, agrega su foto ahí (o deja `imagen: null` para el placeholder). `ImagenProducto` usa `object-contain` con margen proporcional (`p-[7%]`), así se ve bien desde 40px (sugerencias) hasta la página de producto.
- Ancho: `Contenedor` llega a 1536px (`max-w-screen-2xl`, márgenes 16/24/32px); la barra de categorías (`EnlacesCategorias`) usa el mismo ancho. Carruseles: 6 tarjetas desde 1536px; `GrillaProductos`: 5 columnas desde 1536px.
- Buscador: `BuscadorConSugerencias` usa `sugerirCorrigiendo()` (en `lib/recomendaciones/busqueda.ts`): si lo escrito no encuentra nada, corrige la ortografía con `quisoDecir()` y muestra "Mostrando resultados para …".
- Imágenes remotas: cuando la API entregue URLs, agrega el dominio a `images.remotePatterns` en `next.config.ts`.
- `Producto.descripcion` es opcional (`string | null`): llegará de la base de datos en una fase futura. Las páginas la muestran solo si viene; no inventes descripciones en `lib/mock/`.
- "Comprar ahora" (página de producto) no usa el carrito: abre WhatsApp con `armarMensajePedido([{ producto, cantidad }])`.
- Rebranding en TODA la tienda (acordado por persona A y persona B): los tokens `pico-*` de `app/globals.css` tienen los colores del logo nuevo (azul marino #0c2d4e, rojo #c4161c); los `logo-*` son los mismos colores con otro nombre (los usan las páginas de persona B). Para piezas nuevas compartidas, prefiere `pico-*`. Detalle en `docs/guia-de-estilo.md`.
- Logo: `components/layout/Logo.tsx` es solo el isotipo de las dos montañas en SVG (`Montanas`); header en rojo (`placa={false}`), footer en cuadro rojo con montañas blancas + "CENTRO FERRETERO / EL PICO" en texto. `public/logo-el-pico.webp` ya no se usa en el sitio.
- Letra de toda la tienda: Chakra Petch (definida en `components/producto-detalle/fuentes.ts`, cargada en `app/layout.tsx`; `--font-sans` la usa e Inter queda de respaldo). `fuentePaginas` y `font-titulo` siguen funcionando, pero ya no hacen falta en piezas nuevas.
- Animaciones (en `globals.css`, siempre con `motion-safe:`): `animate-aparecer`, `animate-latido`, `animate-flotar` (íconos de banners), `animate-sacudir` (íconos al pasar el mouse). `Boton` ya trae elevación, sombra y brillo; `components/ui/Revelar.tsx` hace aparecer secciones al bajar (prop opcional `retraso` en ms para animar en cascada). `animate-destello` (brillo que recorre una franja) y `animate-deriva` (vaivén muy lento) se usan en el footer. Ojo: un elemento con animación de `transform`/`translate` encierra a sus hijos `fixed`; los modales y barras fijas se dibujan con `createPortal(…, document.body)` y no van dentro de `Revelar`.
- `Precio` tiene la prop opcional `tono="logo"`; hoy da el mismo rojo que el valor por defecto.
- Opiniones (estrellas): tipos en `types/opiniones.ts`; datos por `lib/opiniones.ts` (`getOpiniones`, server-only) y el promedio con `lib/resumirOpiniones.ts` (sirve en cliente y servidor). Sin `CATALOGO_API_URL` salen opiniones FALSAS de prueba (`lib/mock/opiniones.ts`, solo para el diseño); con la API definida devuelve lista vacía hasta que exista el endpoint, para no mostrar nunca reseñas inventadas en producción.

## Reglas de diseño (obligatorias)
- Colores: usa SOLO los tokens de `app/globals.css` (`bg-pico-azul`, `text-pico-rojo`, etc.). Nunca escribas un color hex dentro de un componente.
- Antes de crear un componente, busca si ya existe en `components/ui/`, `components/layout/` o `components/producto/`. Reutiliza; no dupliques.
- Todo producto se muestra con `ProductCard`. No inventes otra tarjeta de producto.
- Todo precio se muestra con el componente `Precio`.
- Todo título de sección usa `TituloSeccion` (título a la izquierda, enlace "Ver todo" a la derecha).
- El contenido va dentro de `Contenedor` (ancho máximo y márgenes laterales consistentes).
- Diseño mobile-first. Revisa siempre en 375px, 768px, 1280px y 1920px.
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
- 2026-10-07 · `producto` · persona B · **Compartido — mejoras visuales en toda la tienda**, aplicado en todas las ramas (menos `main`) con el mismo contenido. (1) **Inicio:** se quitaron los dos banners laterales (Plomería y Electricidad; `bannersLaterales` ya no existe) y el carrusel principal ocupa todo el ancho, con título, texto, botón e ícono más grandes en escritorio. (2) **Ancho:** `Contenedor` pasa de 1280px a 1536px (los extremos se veían vacíos en pantallas grandes); carruseles con 6 tarjetas y grillas con 5 columnas desde 1536px. (3) **Footer nuevo:** franja de ventajas, enlaces con subrayado animado, columnas que aparecen en cascada, montañas de fondo que se mecen, filete rojo con brillo y botón "Volver arriba" (`components/layout/VolverArriba.tsx`). (4) **Imágenes de prueba** para los 67 productos de `lib/mock/` en `public/productos/`. (5) **Buscador:** sugerencias en vivo que corrigen errores de ortografía (`sugerirCorrigiendo`, con pruebas). (6) `Revelar` acepta `retraso`; `ImagenProducto` usa margen proporcional. Guía de estilo actualizada.
- 2026-10-07 · `recomendaciones` · persona A · **Compartido — búsqueda inteligente, relacionados y "Te puede interesar" personalizado.** Nuevo módulo `lib/recomendaciones/` + diccionarios editables en `datos/` + pruebas con Vitest (`npm test`, nueva dependencia de desarrollo) + `minisearch` (dependencia). Cambios que afectan a persona B: (1) **contrato**: `Producto.ventas?` y tipo `CompradoJunto` en `types/catalogo.ts`; funciones nuevas `getIndiceProductos`, `getMasVendidos`, `getCompradosJuntos` en `lib/catalogo.ts` y 3 endpoints nuevos en `docs/datos.md`; (2) `lib/mock/productos.ts`: ~25 productos nuevos y `ventas` en todos; `destacadosMock["te-puede-interesar"]` se eliminó; (3) **Header**: la caja de búsqueda ahora es `BuscadorConSugerencias` (mismo diseño, con sugerencias en vivo); (4) `ProveedorCarrito.agregar()` y el botón de WhatsApp de `PanelCarrito` anotan señales del perfil; (5) página `/buscar` nueva. Pasado a todas las ramas (menos `main`). En la página de producto, el carrusel "misma categoría" se cambió por `ProductosRelacionados` ("También te puede servir") + `RegistrarSenal` (visto), y "Comprar ahora" (`AccionesCompra`) y `FormularioPedido` (`finalizar-pedido`) anotan la señal `whatsapp`.
- 2026-10-07 · `inicio` · persona A · **Compartido:** `agregar()` de `ProveedorCarrito` ya NO abre el panel del carrito; la confirmación es el "¡Agregado!" de `BotonAgregar` y el contador que late. El panel solo se abre con el carrito del header o el flotante (este ahora con `cursor-pointer`).
- 2026-10-07 · `inicio` · persona A · **Compartido:** `BotonCarritoFlotante` ahora es blanco con borde e ícono rojos (`pico-rojo`), y aparece cayendo desde arriba con un pequeño rebote. Con "reducir movimiento" activo en el sistema solo aparece y desaparece (sin desplazarse).
- 2026-10-07 · `producto` · persona A · **Compartido:** carrito flotante. Nuevo `components/carrito/BotonCarritoFlotante.tsx`: `BotonCarrito` (header) lo muestra abajo a la derecha cuando el carrito del header sale de la pantalla, y se esconde con el panel abierto. En `/producto/` (móvil) queda más arriba para no tapar la barra fija de compra. Aplicado en todas las ramas (menos `main`).
- 2026-10-07 · `producto` · persona B (acordado con persona A) · **Rebranding en toda la tienda**, aplicado en todas las ramas (menos `main`) con el mismo estilo: colores `pico-*` = colores del logo; Chakra Petch en todo el sitio; logo nuevo (montañas en SVG); `Header`, barra de categorías (subrayado rojo animado), `Footer`, `BotonCarrito`, `Boton`, `TituloSeccion`, `ProductCard`/`BotonAgregar`, carruseles, banners y secciones de inicio con animaciones (`Revelar`). `docs/guia-de-estilo.md` actualizada.
- 2026-10-06 · `producto` · persona B · Une lo de persona A (`tituloProducto()` en `lib/formato.ts`) y le pasa la corrección de "20W50" (viscosidad de aceite) que tenía la copia vieja; se borró `components/producto-detalle/tituloProducto.ts`. Todo import del título va a `@/lib/formato`.
- 2026-10-06 · `producto` · persona B · Chakra Petch en todo el texto de la página de producto (no solo títulos) con `fuentePaginas`; error y "no encontrado" pasan al rebranding. No toca archivos compartidos.
- 2026-10-06 · `producto` · persona B · Página de producto con el rebranding (colores del logo + Chakra Petch), estrellas bajo el título y sección "Calificaciones" (promedio + barras), zoom de imagen (lupa con mouse + pantalla completa), botón de copiar código y compartir, animaciones en "Agregar al carrito"/"Comprar ahora" y barra fija de compra en móvil. **Compartido (solo se agregó, nada cambió de comportamiento):** tokens y animaciones nuevos en `app/globals.css`, prop opcional `tono` en `Precio`, `types/opiniones.ts`, `lib/opiniones.ts`, `lib/resumirOpiniones.ts`, `lib/mock/opiniones.ts`. Título: "20W50" ya no pasa a minúsculas. Subida a GitHub.
- 2026-10-06 · `inicio` · persona A · **Compartido:** `tituloProducto()` se movió de `components/producto-detalle/` a `lib/formato.ts`. `ProductCard` y `PanelCarrito` ahora muestran ese título (formato oración, con la marca); la tarjeta ya no tiene la línea aparte de la marca ni `uppercase`.
- 2026-10-06 · `inicio` · persona A · **Compartido:** categorías nuevas en `lib/mock/categorias.ts`: herramientas, construccion, ferreteria, electricidad, plomeria, pinturas, hogar-y-jardin, seguridad-industrial, vehiculos. Desaparecen `tornilleria`, `jardin` y `seguridad` (sus productos de prueba pasaron a ferreteria, hogar-y-jardin y seguridad-industrial). La API debe usar estos mismos slugs.
- 2026-10-06 · `producto` · persona B · Página de producto simplificada: se quitó el bloque "¿Cómo lo recibes?" (Delivery/Fletes/Pick-up; se borró `OpcionesEntrega.tsx`) y la nota bajo los botones. **Compartido:** la barra de categorías ya no se muestra en `/producto/*`. `NavCategorias` ahora envuelve el `<nav>` en el nuevo `components/layout/OcultarEnRutas.tsx` con `prefijos={["/producto/"]}`; en inicio y categorías se ve igual que antes. Para ocultarla en otra ruta, agrega el prefijo ahí.
- 2026-10-06 · `producto` · persona B · Nueva página `/producto/[id]` (imagen, título, precio, cantidad, "Agregar al carrito", "Comprar ahora" por WhatsApp, bloque Delivery/Fletes/Pick-up, relacionados) con loading/error/not-found. Piezas en `components/producto-detalle/`. Archivos compartidos tocados: `types/catalogo.ts` y `docs/datos.md` (campo opcional `descripcion`, no rompe nada). Subida a GitHub en la rama `producto`, pendiente de pull request a `main`.
- 2026-10-06 · `producto` · persona B · Rama `producto` creada desde `main`.
- 2026-10-03 · `categorias` · persona B · Página `/categoria/[slug]` completa (filtros subcategoría/marca, orden, paginación, estados) con piezas en `components/categoria/`; filtros/orden/página viven en la URL. Sin filtro de precio: `getProductosPorCategoria` no lo soporta; si se agrega, hay que acordar el cambio de contrato. Subida a GitHub en la rama `categorias`, pendiente de pull request a `main`. No toca archivos compartidos.
