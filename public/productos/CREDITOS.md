# Créditos de las imágenes de prueba

Las fotos de los productos de ejemplo se borraron el 2026-10-28, cuando todas las categorías pasaron a Saint.
Quedan solo fotos de productos REALES de Saint (grupos de medidas y fotos sueltas de lib/agrupaciones.ts).

## Fotos de prueba de productos de Saint (2026-10-26, persona B)

Fotos que pasó persona B para PROBAR los grupos de medidas (`lib/agrupaciones.ts`). No se conoce su autor ni su licencia: **confirmar que se pueden usar (o reemplazarlas por fotos propias) antes de publicar en producción.**

| Archivo | Producto |
|---|---|
| grupos/llave-combinada-cromada.webp | Grupo "Llave combinada Acesa" (todas sus medidas). Ojo: la llave de la foto tiene grabada la marca WESTWARD |
| grupos/dado-cromado.webp | SOLO el grupo "Dado Acesa" (recortada de la foto original); los demás dados van sin foto |
| grupos/dado-largo-stanley.webp | Grupo "Dado hexagonal largo Stanley" (dado largo con su empaque Stanley, de frente, recortada) |
| grupos/dado-largo-estria-stanley.webp | Grupo "Dado de estría largo Stanley" (dado largo 12 puntas con su empaque Stanley, acostado, recortada) |
| 3M0015.webp | 3M MOPA PULIDO AZUL DOBLE CARA 8" PASO 3 (la foto trae la marca 3M en el empaque) |

## Pinturas Pineco (2026-10-28, persona B)

Fotos oficiales del empaque que pasó persona B (fondo transparente pasado a blanco, envase completo con margen, 1080×1080), en `pineco/`. Cada una va SOLO en el producto de su línea y tamaño (`FOTOS_SAINT` en `lib/agrupaciones.ts`).

**Tamaños (2026-10-30):** cada archivo lleva el tamaño de la lata en el nombre: `-cuarto` (pequeña, 1/4), `-gal` (mediana, galón), `-tobo` (grande, tobo). Ej.: `PINECO014-gal.webp`, `PINECO016-tobo.webp`, `PINECO020-cuarto.webp`; el hidroesmalte 1/4 usa `PINECO011-cuarto.webp`.

| Archivo (en `pineco/`) | Producto |
|---|---|
| PINECO014.webp | PINECO ESMALTE 2 EN 1 ACRILICO DTM GALON (empaque "DTM Esmalte + Anticorrosivo", 3,785 L) |
| PINECO015.webp | PINECO PIPOL CLASE "B" GALON (3,785 L) |
| PINECO016.webp | PINECO PIPOL CLASE "B" TOBO (15,14 L) |
| PINECO011.webp | PINECO HIDROESMALTE CLASE A GALON (empaque "Prestige Hidroesmalte", 3,785 L) |
| PINECO002.webp | PINECO PRESTIGE CLASE A MATE GAL (3,785 L) |
| PINECO003.webp | PINECO PRESTIGE CLASE A SATINADO GALON (3,785 L) |
| PINECO001.webp | PINECO PRESTIGE CLASE A MATE TOBO (empaque Prestige interiores mate, 4 galones / 15,14 L) |
| PINECO020.webp | PINECO ESMALTE 2 EN 1 ACRILICO DTM 1/4 (1/4 gal / 0,95 L) |
| PINECO021.webp | PINECO CERAMI-K BRILLANTE 1/4 GALON (0,967 L) |

## Pinturas Montana y Collet (2026-10-28, persona B)

Fotos oficiales del empaque que pasó persona B (fondo pasado a blanco, envase completo con margen, 1080×1080). Van por NOMBRE del producto (`fotoPorNombre` en `lib/agrupaciones.ts`). **Tamaños (2026-10-30):** las de Montana se guardan en tres versiones, `<nombre>-cuarto.webp` / `-gal.webp` / `-tobo.webp` (lata pequeña, mediana y grande); en la tabla va el nombre sin el tamaño.

| Archivo | Producto |
|---|---|
| montana/montafix-brillante.webp, -mate, -satinado | Todos los que digan MONTAFIX, según su acabado (sin acabado: brillante) |
| montana/abc-mate.webp | ABC CAUCHO … GALON y TOBO |
| montana/dekoral-mate.webp, dekoral-satinado.webp | DEKORAL … GALON y TOBO |
| montana/av2000-exterior-mate.webp, -interior-mate, -brillo-de-seda, -bioprotecto | AV-2000 EXT/INT/SEDA/BIO … GALON y TOBO |
| montana/av2000-exterior-clasica.webp, av2000-exterior-mate-2.webp | Sin usar todavía (otras fotos de AV-2000 Exterior; la clásica con el fondo gris quitado) |
| collet/<linea>-cuarto.webp, -gal.webp, -tobo.webp | Collet por línea y tamaño (`fotoCollet`): 1/4 la lata pequeña, galón mediana, tobo/paila/cuñete grande (misma foto a otra escala). Si una línea no tiene una versión, usa la de galón |
| collet/prestigio-gal.webp, prestigio-tobo-grande.webp | COLLET PRESTIGIO PINTURA "A" GALON / TOBO |
| collet/ocasion-gal.webp, ocasion-tobo-grande.webp | COLLET PINTURA OCASIÓN TIPO "B" GALON / TOBO |
| collet/esmalte-gal.webp, esmalte-cuarto.webp | Collet que empiezan por "Esmalte" (brillantes y satinado) y el fondo de herrería |
| collet/decosatin-gal.webp, -cuarto, -tobo | Collet satinados y tipo "A"/"AA" sin foto propia (Satinada, Extremo) |
| collet/decoplus-gal.webp, -cuarto, -tobo | Collet que dicen "Deco Plus" (lata Decorativa Plus) |
| collet/trafico-brocal-gal.webp, -tobo | Collet que dicen "brocal" o "tráfico" (lata Tráfico Brocal) |
| collet/canchas-gal.webp, -tobo | Collet "p/cancha" (lata Canchas deportivas) |
| collet/impermeabilizante-gal.webp, -cuarto | COLLET PINTURA IMPERMEABILIZANTE |
| collet/basicplus-gal.webp | Cualquier otro Collet sin foto propia (hoy ninguno) |
| collet/prestigio-tobo-y-galon.webp, ocasion-tobo-y-galon.webp | Sin usar todavía (tobo y galón juntos) |

## Pinturas Manpica (2026-10-28, persona B)

Fotos oficiales del empaque que pasó persona B (fondo blanco, envase completo con margen, 1080×1080). Van por NOMBRE (`fotoManpica` en `lib/agrupaciones.ts`).

| Archivo | Producto |
|---|---|
| manpica/trafico-tobo-amarillo.webp | MANPICA TRAFICO … CNTE / CUÑETE 5 GAL y DEMARCACION … TOBO |
| manpica/trafico-galon.webp | MANPICA TRAFICO … GALON |
