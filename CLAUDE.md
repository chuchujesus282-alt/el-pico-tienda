# Centro Ferretero El Pico — Tienda web

Tienda en línea de Centro Ferretero El Pico (Caracas). Next.js (App Router) + TypeScript + Tailwind CSS, publicada en Vercel.
Dos personas trabajan en paralelo, cada una con su propia sesión de Claude Code. La consistencia visual es la prioridad número uno.

Guía visual completa: @docs/guia-de-estilo.md
Contrato de datos de productos: @docs/datos.md

## Fase actual del proyecto
- Fase 1: catálogo por categorías con precios. El carrito NO cobra: arma un mensaje y redirige a WhatsApp para cerrar la venta.
- No hay inventario ni existencias en esta fase. No mostrar "disponible/agotado".

## Comandos
- `npm run dev` — servidor local en http://localhost:3000
- `npm run build` — debe pasar sin errores antes de cada commit
- `npm run lint` — debe pasar sin errores antes de cada commit

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
