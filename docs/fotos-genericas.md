# Fotos genéricas para productos GENERICO (hechas con IA)

4.316 productos de Saint (37%) traen la marca GENERICO y no tienen foto: hoy muestran el ícono de su subcategoría.
La idea: **una foto por TIPO de producto**, que la tienda asigna sola por el nombre (como las latas de Collet), y un
aviso pequeño "Imagen de referencia" en esos productos. Con los ~45 tipos de abajo quedan con foto unos 3.300
productos (~75%); el resto sigue con su ícono.

Herramienta recomendada: el generador de imágenes de ChatGPT (sigue bien las instrucciones y mantiene el estilo si le
subes la foto anterior como referencia).

## Cómo trabajar

1. **Primero la plantilla.** Pega el PROMPT BASE con el primer producto (el tornillo hexagonal) y corrige hasta que te
   guste de verdad. Esa foto es la referencia de todas.
2. **Después, uno por uno.** Para cada producto, sube la foto plantilla y pega: el PROMPT DE CONTINUACIÓN + la línea
   del producto. Así todas salen con la misma luz, ángulo y fondo.
3. **Revisa cada foto antes de guardarla:** que la pieza sea la correcta (tipo de cabeza, rosca, forma), sin texto,
   sin logos, sin números de medida y sin cosas de más.
4. **Guárdala con el nombre de archivo de la tabla** (PNG, cuadrada; yo la paso a .webp, la centro y la ajusto) y
   pásamelas. Empieza con 3 o 4 para verlas en la tienda antes de hacer todas.

## PROMPT BASE (la primera foto)

```
Fotografía de producto profesional para una tienda en línea de ferretería.
Producto: [DESCRIPCIÓN DEL PRODUCTO].
Estilo: foto de estudio realista, NO ilustración ni render de caricatura. Fondo blanco puro (#FFFFFF), liso, sin
degradado, sin superficie visible. Luz suave y difusa desde arriba a la izquierda, con una sombra muy leve y corta
debajo del producto. Ángulo 3/4, ligeramente desde arriba. El producto centrado, ocupando cerca del 70% de la imagen,
con margen blanco alrededor, completo (nada cortado). Formato cuadrado 1:1, 1024x1024.
Materiales y detalles fieles a la realidad, nítidos y bien enfocados.
Prohibido: texto, letras, números, logos, marcas, etiquetas, empaques, manos, personas, herramientas extra, fondos de
colores, reflejos fuertes, marcas de agua.
```

## PROMPT DE CONTINUACIÓN (las demás, subiendo la foto plantilla)

```
Usa exactamente el mismo estilo de la imagen que te adjunto: mismo fondo blanco puro, misma luz, misma sombra leve,
mismo ángulo 3/4, mismo tamaño del producto en el cuadro y misma calidad de foto de estudio. Solo cambia el producto.
Sin texto, sin logos, sin empaques, sin números.
Producto: [DESCRIPCIÓN DEL PRODUCTO].
```

## Productos (reemplaza [DESCRIPCIÓN DEL PRODUCTO] por la de cada fila)

Ordenados por cuántos productos cubren. "Archivo" es el nombre con que se guarda.

### Tornillería (los tornillos van por clase: son 881 y muy distintos)

| Archivo | Cubre | Descripción para el prompt |
|---|---|---|
| tornillo-hexagonal.png | 353 | un tornillo de acero galvanizado con cabeza hexagonal y rosca métrica a lo largo de casi todo el cuerpo, acostado en diagonal, junto a otro igual parado |
| tornillo-autorroscante-hex.png | 212 | un tornillo autorroscante para lámina de techo, cabeza hexagonal con arandela, punta de broca y rosca gruesa, acero zincado |
| tornillo-allen.png | 158 | un tornillo Allen de cabeza cilíndrica con hueco hexagonal interior, acero negro pavonado, rosca métrica |
| tornillo-metal-gota.png | 98 | un tornillo para metal de cabeza redonda tipo gota (abombada) con ranura phillips, acero zincado, rosca fina |
| tornillo-carruaje.png | 33 | un tornillo carruaje de acero galvanizado: cabeza redonda lisa, cuello cuadrado bajo la cabeza y rosca |
| tornillo-drywall.png | 15 | dos tornillos para drywall negros fosfatados, cabeza de corneta con ranura phillips, rosca gruesa y punta aguda |
| tornillo-madera.png | 9 | un tornillo para madera de cabeza plana avellanada phillips, rosca gruesa cónica y punta aguda, acero zincado |
| tuerca-hexagonal.png | 106 | tres tuercas hexagonales de acero galvanizado de distintos tamaños, una de ellas acostada mostrando la rosca interior |
| oring.png | 110 | varios anillos O-ring de goma negra de distintos diámetros, sueltos y un poco superpuestos |
| arandela.png | 51 | arandelas planas y de presión (partidas) de acero inoxidable, varias, ordenadas en grupo |
| ramplug.png | 47 | tacos ramplug de expansión: uno plástico gris y uno metálico de expansión, con su tornillo al lado |
| prisionero-allen.png | 45 | tornillos prisioneros Allen sin cabeza (opresores), acero negro, cortos, con el hueco hexagonal visible en un extremo |
| alcayata.png | 15 | alcayatas de acero galvanizado: una en forma de L y una con argolla cerrada, con rosca para madera |

### Construcción

| Archivo | Cubre | Descripción para el prompt |
|---|---|---|
| conexion-bronce.png | ~255 | conexiones de bronce para gas y aire: un codo de 90°, un niple hexagonal y un conector espiga para manguera, de bronce dorado pulido, con roscas visibles |
| tubo-galvanizado.png | ~60 | un tramo corto de tubo redondo de hierro galvanizado gris con rosca en un extremo, acostado en diagonal |
| tubo-cobre.png | ~10 | un tramo corto de tubo de cobre brillante, acostado en diagonal |
| tubo-rectangular.png | ~40 | tramos cortos de tubo de hierro rectangular y cuadrado (perfil estructural), acero negro, cortes limpios |
| lamina-hierro.png | ~20 | una lámina lisa de hierro (acero laminado) gris, rectangular, apoyada con una esquina levantada |
| tanque-agua.png | 35 | un tanque de agua plástico negro tipo vaso (cónico), con tapa de rosca arriba |
| regaton.png | 33 | regatones plásticos negros (tapas para patas de silla): uno redondo, uno cuadrado y uno rectangular |
| malla-metalica.png | 26 | un rollo pequeño de malla metálica galvanizada de cuadros, parcialmente desenrollado |
| tapa-aguas-negras.png | ~10 | una tapa de PVC blanco para tubería de aguas negras, vista de lado y de frente |
| guaya.png | 24 | un rollo de guaya (cable de acero trenzado) galvanizada, con una punta suelta mostrando los hilos |
| conector-emt.png | ~15 | conectores EMT metálicos para tubería eléctrica, de zinc plateado con tornillo de presión |
| pletina.png | 23 | pletinas de hierro (barras planas) de acero negro, tramos cortos apilados en diagonal |
| angulo-metalico.png | 15 | perfiles en ángulo L: uno de aluminio plateado y uno de hierro negro, tramos cortos |
| codo-pvc.png | 20 | codos de PVC gris para aguas negras: uno de 90° y uno de 45° |
| yee-pvc.png | 20 | una conexión YEE de PVC gris para aguas negras, de 45° |
| tee-pvc.png | 18 | una conexión TEE de PVC gris para aguas negras, de 90° |
| anillo-goma.png | 13 | anillos de goma negra para tubería de aguas negras, con abrazaderas metálicas |
| escalera.png | 13 | una escalera de tijera de fibra de vidrio amarilla con peldaños de aluminio, abierta |
| driza.png | 17 | rollos de driza (cuerda trenzada de nylon) blanca y de colores |
| bloque-arcilla.png | ~5 | un bloque de arcilla roja de construcción con huecos |

### Herramientas

| Archivo | Cubre | Descripción para el prompt |
|---|---|---|
| carbon-motor.png | 167 | un par de carbones (escobillas) de motor eléctrico: bloques rectangulares de grafito negro con su cable de cobre trenzado y resorte |
| correa-industrial.png | 132 | una correa industrial en V de goma negra, enrollada en óvalo, con la cara interna lisa visible |
| mecha-metal.png | ~70 | tres mechas (brocas) helicoidales HSS para metal de distintos diámetros, plateadas y doradas, acostadas en paralelo |
| mecha-concreto.png | ~40 | dos mechas (brocas) para concreto con punta de carburo en forma de flecha, cuerpo gris |
| resorte.png | 68 | varios resortes de acero pequeños, de compresión y de tracción, sueltos |
| reten.png | 51 | retenes (sellos de aceite) circulares de goma negra con aro metálico, de distintos tamaños |
| bocina.png | 50 | bocinas (bujes) cilíndricas de bronce sinterizado, pequeñas, de distintos tamaños |
| rolinera.png | 27 | rodamientos de bola (rolineras) de acero, uno parado y uno acostado mostrando las bolas y el sello |
| juego-machos.png | ~20 | un juego de machos de roscar (terrajas) de acero con su porta-machos en T |
| pasador.png | 32 | pasadores de acero: uno elástico partido (de presión) y uno cilíndrico macizo |
| lima.png | 14 | tres limas de acero para metal: plana, redonda y triangular, con mango de madera |
| electrodo.png | 11 | electrodos para soldar: varillas metálicas con revestimiento gris, unas cuantas en abanico |
| dado-economico.png | 14 | tres dados (copas) hexagonales cromados para llave de cuadrante, de distintos tamaños |
| cepillo-alambre.png | 12 | un cepillo circular de alambre de acero para esmeril y un cepillo de copa de alambre |
| extractor.png | 11 | un extractor de poleas de acero de tres patas con tornillo central |

### Electricidad, grifería, cerrajería, vehículos

| Archivo | Cubre | Descripción para el prompt |
|---|---|---|
| terminal-electrico.png | 68 | terminales eléctricos de cobre estañado: de ojo (anillo) y de pala, con aislamiento de plástico de colores |
| bombillo.png | 38 | un bombillo LED blanco tipo A60 con rosca E27, apagado |
| bisagra.png | 47 | una bisagra de acero cromado para puerta, abierta en ángulo, con los agujeros de los tornillos visibles |
| manilla.png | 18 | una manilla de puerta de aluminio plateado con su placa rectangular |
| tirador.png | 30 | dos tiradores de mueble de acero inoxidable: uno de barra y uno de botón |
| rueda.png | 32 | una rueda giratoria de nylon con base metálica y una rueda fija de goma, para muebles |
| rejilla-desague.png | 15 | una rejilla de desagüe redonda de bronce con agujeros, vista desde arriba en ángulo |
| grapa-automotriz.png | 34 | grapas automotrices plásticas negras (clips de tapicería y de guardafango), varias formas |
| manguera-goma.png | ~30 | un rollo de manguera de goma negra, con un extremo suelto mostrando el corte |
| acople-rapido.png | 12 | acoples rápidos (camlock) de aluminio para manguera, macho y hembra |

## No hacer foto por tipo (son demasiado distintos entre sí)

METRO (arena, grama, tubos por metro), TAPA, ROLLO, LAMINA de otros materiales (anime, goma, PVC), GANCHO, JGO/JUEGO
de herramientas varias, PERFIL, SACO (cal, aserrín, pego). Siguen con el ícono de su subcategoría hasta que se vean
caso por caso.
