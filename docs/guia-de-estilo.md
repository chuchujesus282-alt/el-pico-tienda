# Guía de estilo — Centro Ferretero El Pico

## Colores de marca
| Token | Valor | Uso |
|---|---|---|
| `pico-azul` | #17225a | Color principal: barra de categorías, footer, títulos, botón de buscar, iconos del header, botones secundarios |
| `pico-azul-oscuro` | #0f1740 | Hover de elementos azules |
| `pico-azul-claro` | #e8eaf3 | Fondos suaves, chips, filtros activos |
| `pico-rojo` | #a90504 | Acentos y acción: botón "Agregar", precios destacados, badges de oferta, contador del carrito |
| `pico-rojo-oscuro` | #850403 | Hover de elementos rojos |
| `pico-blanco` | #ffffff | Fondo de tarjetas y de la página |
| `gris-fondo` | #f4f5f8 | Fondo general detrás de las secciones |
| `gris-borde` | #e2e4ea | Bordes de tarjetas, divisores, inputs |
| `gris-texto` | #5b6070 | Texto secundario (marca, código, descripciones) |
| `texto` | #1a1d29 | Texto principal |

Regla de proporción: el azul domina la estructura (barra de categorías y footer), el blanco del header deja respirar el logo rojo, y el rojo se reserva para lo que invita a actuar. Si todo es rojo, nada destaca.

Logo: `components/layout/Logo.tsx` con `public/logo-el-pico.webp`. Sobre blanco va directo (`placa={false}`); sobre azul, en placa blanca (por defecto).

## Tokens en Tailwind (app/globals.css, Tailwind v4)
```css
@import "tailwindcss";

@theme {
  --color-pico-azul: #17225a;
  --color-pico-azul-oscuro: #0f1740;
  --color-pico-azul-claro: #e8eaf3;
  --color-pico-rojo: #a90504;
  --color-pico-rojo-oscuro: #850403;
  --color-pico-blanco: #ffffff;
  --color-gris-fondo: #f4f5f8;
  --color-gris-borde: #e2e4ea;
  --color-gris-texto: #5b6070;
  --color-texto: #1a1d29;

  --font-sans: var(--font-inter), system-ui, sans-serif;

  --radius-tarjeta: 12px;
  --radius-boton: 8px;
  --radius-banner: 16px;
  --radius-chip: 9999px;

  --shadow-tarjeta: 0 1px 3px rgb(23 34 90 / 0.08);
  --shadow-tarjeta-hover: 0 8px 24px rgb(23 34 90 / 0.14);
}
```

## Tipografía
- Fuente: Inter (vía `next/font/google`), variable `--font-inter`.
- Título de sección: 20px móvil / 24px escritorio, peso 700, color `pico-azul`.
- Nombre de producto: 14px, peso 500, máximo 2 líneas (`line-clamp-2`), MAYÚSCULAS tal como vienen del sistema.
- Precio: 18px, peso 700, color `pico-rojo`.
- Texto secundario: 13px, color `gris-texto`.

## Formas y espaciado
- Espaciado en múltiplos de 4px. Separación entre secciones: 32px móvil / 48px escritorio.
- Contenedor: ancho máximo 1280px, márgenes laterales 16px móvil / 24px escritorio.
- Tarjetas: fondo blanco, borde `gris-borde`, radio `tarjeta`, sombra `tarjeta`; al pasar el mouse sube a `tarjeta-hover` y se eleva 2px.
- Botones: radio `boton`, altura 40px, peso 600. Primario rojo con texto blanco; secundario contorno azul.
- Banners: radio `banner`, sin borde, imagen a sangre (cubre todo el recuadro).

## Distribución de la página principal (de arriba a abajo)
1. Header (blanco): logo oficial sin placa a la izquierda, buscador ancho al centro (fondo blanco, borde de 2px `pico-azul`, radio completo, botón azul "Buscar"), "Mi cuenta" y "Carrito" en azul con su texto (desde 1024px) y contador rojo a la derecha. En móvil el buscador baja a una segunda fila.
2. Barra de categorías (`pico-azul`): las categorías en una fila; en móvil, desplazable horizontalmente.
3. Bloque de banners principal: un banner grande (carrusel) a la izquierda que ocupa ~2/3, y dos banners apilados a la derecha (~1/3). En móvil: uno debajo del otro.
4. Sección de productos "Te puede interesar": TituloSeccion + carrusel horizontal de ProductCard.
5. Fila de dos banners promocionales del mismo tamaño (cada uno lleva a una categoría).
6. Sección "Nuestros recomendados": carrusel de productos.
7. "Busca por marcas": carrusel de logos en recuadros blancos redondeados.
8. Secciones por categoría (ej. "Materiales de construcción", "Jardín"): banner de la categoría + carrusel de sus productos.
9. Footer (azul): logo y frase, columnas Categorías / Conócenos / Ayuda, botón de WhatsApp, línea de derechos.

## Página de categoría
- Breadcrumb: Inicio › Nombre de categoría.
- Banner de la categoría (ancho completo, alto moderado).
- Título de la categoría + cantidad de productos.
- Escritorio: filtros en barra lateral izquierda (subcategoría, marca, rango de precio). Móvil: botón "Filtrar" que abre un panel.
- Ordenar por: relevancia, precio menor, precio mayor, nombre.
- Grilla con `GrillaProductos`: 2 columnas móvil, 3 tablet, 4 escritorio.
- Paginación al final (o botón "Cargar más").
- Estados obligatorios: cargando (esqueletos con la forma de ProductCard), sin resultados, error de conexión con el servidor.

## ProductCard (la misma en todo el sitio)
- Imagen cuadrada sobre fondo blanco, `object-contain`, con padding.
- Debajo: marca (texto secundario), nombre (2 líneas), precio.
- Botón "Agregar" rojo a lo ancho de la tarjeta.
- Si no hay imagen: placeholder gris con el icono de una herramienta, nunca un hueco vacío.
- Toda la tarjeta enlaza a `/producto/[id]`, excepto el botón.
