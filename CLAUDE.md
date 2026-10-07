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
- `app/producto/[id]/page.tsx` — página de producto (fase posterior, aún no tocar)
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
- Nombre de producto para mostrar: `tituloProducto()` en `lib/formato.ts` ("TALADRO PERCUTOR 1/2\" 650W" + PROTEK → "Taladro percutor Protek 1/2\" 650W"). Lo usan `ProductCard`, el carrito y la página de producto; nunca muestres `producto.nombre` en MAYÚSCULAS. El mensaje de WhatsApp sí usa el nombre tal como viene del sistema.
- Imágenes remotas: cuando la API entregue URLs, agrega el dominio a `images.remotePatterns` en `next.config.ts`.
- Rebranding en TODA la tienda (acordado por persona A y persona B): los tokens `pico-*` de `app/globals.css` tienen los colores del logo nuevo (azul marino #0c2d4e, rojo #c4161c); los `logo-*` son los mismos colores con otro nombre (los usan las páginas de persona B). Para piezas nuevas compartidas, prefiere `pico-*`. Detalle en `docs/guia-de-estilo.md`.
- Logo: `components/layout/Logo.tsx` es solo el isotipo de las dos montañas en SVG (`Montanas`); header en rojo (`placa={false}`), footer en cuadro rojo con montañas blancas + "CENTRO FERRETERO / EL PICO" en texto. `public/logo-el-pico.webp` ya no se usa en el sitio.
- Letra de toda la tienda: Chakra Petch (definida en `components/producto-detalle/fuentes.ts`, cargada en `app/layout.tsx`; `--font-sans` la usa e Inter queda de respaldo). `fuentePaginas` y `font-titulo` siguen funcionando, pero ya no hacen falta en piezas nuevas.
- Animaciones (en `globals.css`, siempre con `motion-safe:`): `animate-aparecer`, `animate-latido`, `animate-flotar` (íconos de banners), `animate-sacudir` (íconos al pasar el mouse). `Boton` ya trae elevación, sombra y brillo; `components/ui/Revelar.tsx` hace aparecer secciones al bajar. Ojo: un elemento con animación de `transform`/`translate` encierra a sus hijos `fixed`; los modales y barras fijas se dibujan con `createPortal(…, document.body)` y no van dentro de `Revelar`.

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
- Cada persona trabaja en su rama (`inicio`, `categorias`), nunca directo en `main`.
- Datos de productos: siempre a través de `lib/catalogo.ts`. Nunca hagas `fetch` al servidor desde un componente.
- Variables secretas solo en `.env.local` (no se sube). Documenta cualquier variable nueva en `.env.example`.
- Antes de hacer commit: `npm run lint` y `npm run build` sin errores.
- Mensajes de commit en español, cortos y descriptivos.

## Registro de cambios
Lo más reciente arriba. Formato: fecha · rama · quién · qué cambió y qué debe saber el compañero.
- 2026-10-07 · `inicio` · persona A · **Compartido:** carrito flotante. Nuevo `components/carrito/BotonCarritoFlotante.tsx`: `BotonCarrito` (header) lo muestra abajo a la derecha cuando el carrito del header sale de la pantalla, y se esconde con el panel abierto. En `/producto/` (móvil) queda más arriba para no tapar la barra fija de compra. Aplicado en todas las ramas (menos `main`).
- 2026-10-07 · `inicio` · persona B (acordado con persona A) · **Rebranding en toda la tienda**, aplicado en todas las ramas (menos `main`) con el mismo estilo: colores `pico-*` = colores del logo; Chakra Petch en todo el sitio; logo nuevo (montañas en SVG); `Header`, barra de categorías (subrayado rojo animado), `Footer`, `BotonCarrito`, `Boton`, `TituloSeccion`, `ProductCard`/`BotonAgregar`, carruseles, banners y secciones de inicio con animaciones (`Revelar`). `docs/guia-de-estilo.md` actualizada.
- 2026-10-06 · `inicio` · persona A · **Compartido:** `tituloProducto()` se movió de `components/producto-detalle/` a `lib/formato.ts`. `ProductCard` y `PanelCarrito` ahora muestran ese título (formato oración, con la marca); la tarjeta ya no tiene la línea aparte de la marca ni `uppercase`.
- 2026-10-06 · `inicio` · persona A · **Compartido:** categorías nuevas en `lib/mock/categorias.ts`: herramientas, construccion, ferreteria, electricidad, plomeria, pinturas, hogar-y-jardin, seguridad-industrial, vehiculos. Desaparecen `tornilleria`, `jardin` y `seguridad` (sus productos de prueba pasaron a ferreteria, hogar-y-jardin y seguridad-industrial). La API debe usar estos mismos slugs.
