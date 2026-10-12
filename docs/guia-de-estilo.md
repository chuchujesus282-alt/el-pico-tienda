# Guía de estilo — Centro Ferretero El Pico

## Colores de marca
| Token | Valor | Uso |
|---|---|---|
Rebranding (logo nuevo): rojo del logo y azul marino de "CENTRO FERRETERO". Aplicado a toda la tienda.

| Token | Valor | Uso |
|---|---|---|
| `pico-azul` | #0c2d4e | Azul marino del logo. Estructura: barra de categorías, footer, títulos, botón de buscar, iconos del header, botones secundarios |
| `pico-azul-oscuro` | #071d33 | Hover de elementos azules, degradados |
| `pico-azul-claro` | #e7eef5 | Fondos suaves, chips, filtros activos |
| `pico-rojo` | #c4161c | Rojo del logo. Acción y acentos: "Agregar", precios, contador del carrito, filetes de títulos |
| `pico-rojo-oscuro` | #9e1117 | Hover de elementos rojos |
| `pico-blanco` | #ffffff | Fondo de tarjetas y del header |
| `gris-fondo` | #f3f5f8 | Fondo general detrás de las secciones |
| `gris-borde` | #e1e6ec | Bordes de tarjetas, divisores, inputs |
| `gris-texto` | #586272 | Texto secundario (marca, código, descripciones) |
| `texto` | #14202e | Texto principal |
| `estrella` | #f2a516 | Estrellas de calificación |

Los tokens `logo-*` (`logo-rojo`, `logo-marino`, `logo-marino-oscuro`, `logo-marino-claro`, `logo-rojo-oscuro`) son los mismos colores con otro nombre; los usan las páginas de persona B.

Regla de proporción: el azul marino domina la estructura (barra de categorías y footer), el blanco del header deja respirar el logo rojo, y el rojo se reserva para lo que invita a actuar y para pequeños acentos (filete de los títulos, subrayado de la categoría activa). Si todo es rojo, nada destaca.

Logo: `components/layout/Logo.tsx` dibuja en SVG solo las dos montañas del logo nuevo (`Montanas`, exportado). Sobre blanco (header) van rojas (`placa={false}`); sobre azul (footer), en un cuadro rojo con montañas blancas (por defecto). En el footer va acompañado de "CENTRO FERRETERO / EL PICO" en texto.

## Tokens en Tailwind (app/globals.css, Tailwind v4)
Ver `app/globals.css`: colores de arriba, radios (`tarjeta` 12px, `boton` 8px, `banner` 16px, `chip`), sombras (`tarjeta`, `tarjeta-hover`, `boton-hover`) y animaciones.

## Animaciones (siempre con `motion-safe:`)
- `animate-aparecer`: entrada (sube y se aclara). `animate-latido`: pequeño pulso (confirmaciones, contador del carrito). `animate-flotar`: vaivén lento de íconos decorativos de banners. `animate-sacudir`: sacudida de íconos al pasar el mouse (carrito, WhatsApp). `animate-destello`: brillo que recorre el filete rojo del footer. `animate-deriva`: vaivén muy lento (montañas de fondo del footer).
- `Boton` ya trae: sube 2px y sombra al pasar el mouse, brillo que cruza el primario, y se encoge al presionar.
- `components/ui/Revelar.tsx`: envuelve una sección para que aparezca al bajar. No envuelvas modales ni barras `fixed`.
- Tarjetas: suben 4px, sombra, filete rojo arriba e imagen que se acerca un poco.

## Tipografía
- Fuente de toda la tienda: Chakra Petch (esquinas cortadas, como el logo), cargada en `app/layout.tsx` (variable `--font-chakra`). Inter queda solo de respaldo.
- Título de sección: 20px móvil / 24px escritorio, peso 700, color `pico-azul`, con un filete rojo inclinado a la izquierda (`TituloSeccion`).
- Nombre de producto: 14px, peso 500, máximo 2 líneas (`line-clamp-2`), en formato oración con `tituloProducto()`.
- Precio: 18px, peso 700, color `pico-rojo`.
- Texto secundario: 13px, color `gris-texto`.

## Formas y espaciado
- Espaciado en múltiplos de 4px. Separación entre secciones: 32px móvil / 48px escritorio.
- Contenedor: ancho máximo 1536px (`max-w-screen-2xl`), márgenes laterales 16px móvil / 24px tableta / 32px desde 1280px. Los carruseles de productos muestran 6 tarjetas desde 1536px (5 en escritorio) y las grillas 5 columnas.
- Tarjetas: fondo blanco, borde `gris-borde`, radio `tarjeta`, sombra `tarjeta`; al pasar el mouse sube a `tarjeta-hover` y se eleva 2px.
- Botones: radio `boton`, altura 40px, peso 600. Primario rojo con texto blanco; secundario contorno azul.
- Banners: radio `banner`, sin borde, imagen a sangre (cubre todo el recuadro).

## Distribución de la página principal (de arriba a abajo)
1. Header (blanco): logo oficial sin placa a la izquierda, buscador ancho al centro (fondo blanco, borde de 2px `pico-azul`, radio completo, botón azul "Buscar"), "Mi cuenta" y "Carrito" en azul con su texto (desde 1024px) y contador rojo a la derecha. En móvil el buscador baja a una segunda fila.
2. Barra de categorías (`pico-azul`): las categorías en una fila; en móvil, desplazable horizontalmente.
3. Banner principal: un carrusel a todo el ancho del Contenedor (16:10 móvil, 2:1 tableta, 3:1 escritorio). Ya no lleva banners laterales.
4. Sección de productos "Te puede interesar": TituloSeccion + carrusel horizontal de ProductCard.
5. Fila de dos banners promocionales del mismo tamaño (cada uno lleva a una categoría).
6. Sección "Nuestros recomendados": carrusel de productos.
7. "Busca por marcas": carrusel de logos en recuadros blancos redondeados.
8. Secciones por categoría (ej. "Materiales de construcción", "Jardín"): banner de la categoría + carrusel de sus productos.
9. Footer (azul): filete rojo con brillo; franja de 4 ventajas (retiro, WhatsApp, formas de pago, precios en dólares) con íconos en cuadros rojos; logo y frase con botón de WhatsApp; columnas Categorías / Conócenos / Ayuda (aparecen en cascada con `Revelar retraso`); línea de derechos con "Volver arriba".

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
