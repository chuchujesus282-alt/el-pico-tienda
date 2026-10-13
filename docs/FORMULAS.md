# Fórmulas de las calculadoras de proyectos

Este documento explica cómo calcula cada calculadora de `/calculadoras`, para validarlo con un maestro de obra.
El código está en `lib/calculadoras/` (una función pura por calculadora) y **todos los coeficientes están en
`lib/calculadoras/constantes.ts`**: si un valor no convence, se cambia ahí y nada más.

Cada ejemplo de abajo es un caso de prueba real (`lib/calculadoras/__tests__/calculadoras.test.ts`): si alguien cambia
una fórmula o un coeficiente y el resultado deja de coincidir, `npm test` avisa.

## Reglas generales

- **Redondeo:** toda cantidad se redondea **hacia arriba** a unidades de venta enteras (sacos, galones, cajas, barras, láminas, m³).
- **Desperdicio:** cada material suma un porcentaje (tabla abajo). Se puede cambiar en `DESPERDICIO`.
- **Unidades:** metros, m², m³, cm y kg. Los números se muestran con coma decimal y punto de miles.
- **Son cálculos referenciales.** No sustituyen el cálculo estructural: diámetros de cabilla, separaciones y resistencias
  los define el ingeniero o el plano.

| Material | Desperdicio |
|---|---|
| Bloques | 5 % |
| Mortero (pega, friso, sobrepiso) | 10 % |
| Concreto | 5 % |
| Pintura y sellador | 5 % |
| Cerámica / porcelanato, colocación recta | 10 % |
| Cerámica / porcelanato, colocación diagonal | 15 % |
| Pego | 5 % |
| Carato | 10 % |
| Láminas de techo y sus tornillos | 5 % |
| Impermeabilización (bordes y remates) | 10 % |
| Láminas de drywall | 10 % |
| Rieles de drywall | 5 % |

## Presentaciones comerciales

| Material | Presentación usada |
|---|---|
| Cemento | Saco de 42,5 kg |
| Arena y piedra picada | Metro cúbico (m³) |
| Cabilla | Barra de 6 m |
| Alambre de amarre | Rollo de 1 kg |
| Pintura | Galón y cuñete de 4 galones |
| Pego | Saco de 10 kg |
| Carato | Bolsa de 2 kg |
| Cerámica 45 × 45 | Caja de 2,03 m² |
| Porcelanato 60 × 60 | Caja de 1,44 m² |
| Lámina de zinc / acerolit | 3,66 m × 0,80 m |
| Tornillos de techo | Bolsa de 100 |
| Manto asfáltico | Rollo de 10 m² (1 m × 10 m) |
| Impermeabilizante acrílico | Cuñete de 5 galones (18,9 L) |
| Lámina de drywall | 1,22 m × 2,44 m |
| Paral y riel | Perfil de 3,05 m |
| Tornillos de drywall | Caja de 100 |
| Cinta de juntas | Rollo de 75 m |
| Masilla | Galón de 5 kg |

## Dosificaciones

**Mortero** (por cada m³ de mezcla). Tabla de uso común en construcción para mezclas cemento : arena en volumen:

| Mezcla | Cemento | Arena |
|---|---|---|
| 1 : 3 | 454 kg (10,7 sacos) | 1,09 m³ |
| 1 : 4 | 364 kg (8,6 sacos) | 1,16 m³ |
| 1 : 5 | 302 kg (7,1 sacos) | 1,20 m³ |

**Concreto** (por cada m³). Tabla de dosificación por resistencia para sacos de 42,5 kg (la que publica CAPECO, muy usada
en obra en Latinoamérica):

| Resistencia f'c | Cemento | Arena | Piedra | Agua |
|---|---|---|---|---|
| 140 kg/cm² | 7,01 sacos | 0,56 m³ | 0,57 m³ | 184 L |
| 175 kg/cm² | 8,43 sacos | 0,54 m³ | 0,55 m³ | 185 L |
| 210 kg/cm² | 9,73 sacos | 0,52 m³ | 0,53 m³ | 186 L |
| 245 kg/cm² | 11,50 sacos | 0,50 m³ | 0,51 m³ | 187 L |
| 280 kg/cm² | 13,34 sacos | 0,45 m³ | 0,51 m³ | 189 L |

---

## 1. Bloques para paredes

**Supuestos:** cara del bloque de arcilla 30 × 20 cm; del de concreto 39 × 19 cm; junta de mortero de 1,5 cm; pega con mezcla 1 : 4.

```
área            = largo × alto − puertas y ventanas
bloques por m²  = 1 ÷ ((largo del bloque + junta) × (alto del bloque + junta))
bloques         = área × bloques por m² × 1,05
parte de junta  = 1 − bloques por m² × largo del bloque × alto del bloque
mortero (m³)    = área × espesor de la pared × parte de junta × 1,10
```

El mortero se calcula como si la junta fuera maciza en todo el espesor del bloque; como el bloque es hueco, parte cae
dentro de los huecos, y eso queda cubierto con ese criterio.

**Ejemplo:** pared de 5 × 2,5 m con 2 m² de puertas y ventanas, bloque de arcilla de 15 cm.

1. Área = 5 × 2,5 − 2 = **10,5 m²**
2. Bloques por m² = 1 ÷ (0,315 × 0,215) = **14,77**
3. Bloques = 10,5 × 14,77 × 1,05 = 162,8 → **163 bloques**
4. Parte de junta = 1 − 14,77 × 0,30 × 0,20 = 0,114
5. Mortero = 10,5 × 0,15 × 0,114 × 1,10 = **0,198 m³**
6. Cemento = 0,198 × 364 ÷ 42,5 = 1,69 → **2 sacos**
7. Arena = 0,198 × 1,16 = 0,23 → **1 m³**

Segundo caso de prueba: cerca de 10 × 3 m en bloque de concreto de 20 cm → 380 bloques, 7 sacos, 1 m³ de arena.

## 2. Concreto para vaciados

```
volumen (m³) = largo × ancho × (espesor en cm ÷ 100) × cantidad de elementos × 1,05
cada material = volumen × su dosificación por m³ (tabla de concreto)
```

En columnas y vigas, "largo" es la altura o longitud y "ancho × espesor" es la sección.

**Ejemplo:** losa de 4 × 3 m y 10 cm de espesor, 210 kg/cm².

1. Volumen = 4 × 3 × 0,10 = 1,2 m³; con 5 % = **1,26 m³**
2. Cemento = 1,26 × 9,73 = 12,26 → **13 sacos**
3. Arena = 1,26 × 0,52 = 0,66 → **1 m³**
4. Piedra = 1,26 × 0,53 = 0,67 → **1 m³**
5. Agua ≈ 1,26 × 186 = **234 litros**

Segundo caso: 4 columnas de 30 × 30 cm y 2,7 m de alto → 0,972 m³ → 1,02 m³ → 10 sacos, 1 m³ de arena, 1 m³ de piedra.

## 3. Friso de paredes

```
mortero (m³) = área × (espesor en cm ÷ 100) × 1,10
```

Mezcla a elegir: 1 : 3 (exteriores y zonas húmedas), 1 : 4 (general) o 1 : 5 (interiores).

**Ejemplo:** 10,5 m² con friso de 1,5 cm y mezcla 1 : 4.

1. Mortero = 10,5 × 0,015 × 1,10 = **0,173 m³**
2. Cemento = 0,173 × 364 ÷ 42,5 = 1,48 → **2 sacos**
3. Arena = 0,173 × 1,16 = 0,20 → **1 m³**

Segundo caso: 100 m² a 2 cm con mezcla 1 : 3 → 2,2 m³ → 24 sacos y 3 m³ de arena.

## 4. Cabillas para losas

**Supuestos:** malla en las dos direcciones; barras de 6 m; solape de 40 diámetros; alambre a 25 g por kg de acero.

| Cabilla | Diámetro | Peso | Solape |
|---|---|---|---|
| 3/8" | 9,5 mm | 0,559 kg/m | 0,38 m |
| 1/2" | 12,7 mm | 0,994 kg/m | 0,51 m |
| 5/8" | 15,9 mm | 1,554 kg/m | 0,64 m |

```
cabillas a lo largo = ⌈ancho ÷ separación⌉ + 1   (cada una del largo de la losa)
cabillas a lo ancho = ⌈largo ÷ separación⌉ + 1   (cada una del ancho de la losa)
```

Las barras no se calculan por metros totales, sino **por cortes**, que es como se compra en la realidad:

- Si el tramo cabe en una barra de 6 m: de cada barra salen ⌊6 ÷ tramo⌋ piezas.
- Si es más largo: cada tramo lleva barras enteras más un pedazo final (con su solape); de cada barra salen ⌊6 ÷ pedazo⌋ pedazos.

```
alambre (kg) = metros de acero colocado × peso por metro × 0,025
```

**Ejemplo:** losa de 4 × 3 m, cabilla de 3/8" cada 20 cm.

1. A lo largo: ⌈3 ÷ 0,20⌉ + 1 = **16 cabillas de 4 m** → de cada barra sale 1 pieza → 16 barras
2. A lo ancho: ⌈4 ÷ 0,20⌉ + 1 = **21 cabillas de 3 m** → de cada barra salen 2 → 11 barras
3. Total = **27 barras**
4. Acero = 16 × 4 + 21 × 3 = 127 m × 0,559 = 71 kg
5. Alambre = 71 × 0,025 = 1,77 kg → **2 rollos**

Segundo caso (con solape): losa de 8 × 5 m, 1/2" cada 15 cm → 35 tramos de 8 m (cada uno: 1 barra + un pedazo de
2,51 m; salen 2 pedazos por barra → 53 barras) + 55 tramos de 5 m (55 barras) = **108 barras** y 15 rollos de alambre.

## 5. Pintura

**Supuestos:** un galón rinde 40 m² por mano en pared lisa y 30 m² en pared rugosa; el sellador, 35 m² (una mano).

```
galones  = área × manos ÷ rendimiento × 1,05
sellador = área ÷ 35 × 1,05           (solo en pared nueva)
```

Los galones se reparten en cuñetes de 4 galones y galones sueltos; si sobran 3 o más sueltos, se recomienda otro cuñete.

**Ejemplo:** 12 m de pared × 2,5 m de alto, menos 3 m² → 27 m² de pared nueva lisa, 2 manos.

1. Pintura = 27 × 2 ÷ 40 × 1,05 = 1,42 → **2 galones**
2. Sellador = 27 ÷ 35 × 1,05 = 0,81 → **1 galón**

Otros casos: 80 m² lisos a 2 manos → 5 galones = 1 cuñete + 1 galón. 150 m² rugosos a 2 manos → 11 galones = 3 cuñetes.

## 6. Cerámica y porcelanato

**Supuestos:** pego a 5 kg/m² en cerámica y 6 kg/m² en porcelanato (llana dentada); carato de densidad 1,6 kg/L.

```
cajas  = área × (1 + desperdicio) ÷ m² por caja
pego   = área × kg por m² × 1,05 ÷ 10 kg por saco
carato (kg/m²) = (A + B) ÷ (A × B) × espesor de la pieza × ancho de la junta × 1,6     (todo en mm)
carato = área × carato por m² × 1,10 ÷ 2 kg por bolsa
```

La fórmula del carato es la que usan los fabricantes: mide el volumen de las juntas.
Cerámica 45 × 45 (8 mm de espesor, junta de 3 mm) → 0,171 kg/m². Porcelanato 60 × 60 (9 mm, junta de 2 mm) → 0,096 kg/m².

**Ejemplo:** piso de 4 × 3,5 m en cerámica, colocación recta.

1. Área = **14 m²**
2. Cajas = 14 × 1,10 ÷ 2,03 = 7,59 → **8 cajas**
3. Pego = 14 × 5 × 1,05 = 73,5 kg → **8 sacos**
4. Carato = 14 × 0,171 × 1,10 = 2,63 kg → **2 bolsas**

Segundo caso: 5 × 4 m en porcelanato diagonal → 16 cajas, 13 sacos de pego, 2 bolsas de carato.

## 7. Contrapiso y piso de cemento

```
volumen (m³) = largo × ancho × (espesor en cm ÷ 100) × (1 + desperdicio)
```

- **Contrapiso:** concreto de 140 kg/cm² (5 % de desperdicio).
- **Piso de concreto:** 175 kg/cm² (5 %).
- **Sobrepiso de mortero:** mezcla 1 : 4, sin piedra (10 %).

**Ejemplo:** contrapiso de 5 × 4 m a 8 cm.

1. Volumen = 5 × 4 × 0,08 = 1,6 m³; con 5 % = **1,68 m³**
2. Cemento = 1,68 × 7,01 = 11,78 → **12 sacos**
3. Arena = 1,68 × 0,56 = 0,94 → **1 m³**
4. Piedra = 1,68 × 0,57 = 0,96 → **1 m³**

Segundo caso: sobrepiso de mortero de 5 × 4 m a 4 cm → 0,88 m³ → 8 sacos y 2 m³ de arena.

## 8. Techo con láminas

**Supuestos:** láminas de 3,66 m de largo; ancho útil (lo que cubre, descontado el solape lateral) de 0,70 m en zinc y
0,76 m en acerolit; solape a lo largo de 20 cm; 6 tornillos por m².

```
hileras            = ⌈largo del techo ÷ ancho útil⌉
láminas por hilera = 1 si la caída ≤ 3,66 m; si no, ⌈(caída − 0,20) ÷ (3,66 − 0,20)⌉
láminas            = hileras × láminas por hilera × aguas × 1,05
tornillos          = largo × caída × aguas × 6 × 1,05
```

**Ejemplo:** techo de un agua, 6 m de largo y 3,5 m de caída, en zinc.

1. Hileras = ⌈6 ÷ 0,70⌉ = **9**
2. La caída cabe en una lámina → 1 por hilera → 9 láminas; con 5 % = 9,45 → **10 láminas**
3. Tornillos = 21 m² × 6 × 1,05 = 132 → **2 bolsas de 100**

Segundo caso: dos aguas de 10 m × 5 m de caída en acerolit → 14 hileras × 2 × 2 aguas = 56 → **59 láminas** y 7 bolsas.

## 9. Impermeabilización de techos

```
área a cubrir = largo × ancho × 1,10        (el 10 % cubre bordes y remates)
```

- **Manto asfáltico:** el rollo trae 10 m² pero se solapa 10 cm, así que cubre 9 m². `rollos = área ÷ 9`.
  Primer asfáltico: 12 m² por galón.
- **Acrílico:** 1 litro por m² entre las dos manos; cuñete de 18,9 L. `cuñetes = área × 1 ÷ 18,9`.

**Ejemplo:** platabanda de 8 × 6 m.

1. Área = 48 m²; con 10 % = **52,8 m²**
2. Manto = 52,8 ÷ 9 = 5,87 → **6 rollos**; primer = 52,8 ÷ 12 = 4,4 → **5 galones**
3. O acrílico = 52,8 ÷ 18,9 = 2,79 → **3 cuñetes**

## 10. Drywall

**Supuestos:** lámina de 1,22 × 2,44 m (2,98 m²); perfiles de 3,05 m; parales cada 61 cm (o 40,6 cm); 30 tornillos por
lámina; 1,5 m de cinta y 0,7 kg de masilla por m² de lámina.

```
superficie = área de pared × caras (1 o 2)
láminas    = superficie × 1,10 ÷ 2,98
parales    = (⌈largo ÷ separación⌉ + 1) × ⌈alto ÷ 3,05⌉
rieles     = 2 × largo × 1,05 ÷ 3,05           (piso y techo)
tornillos  = láminas × 30 ÷ 100 por caja
cinta      = superficie × 1,5 ÷ 75 m por rollo
masilla    = superficie × 0,7 ÷ 5 kg por galón
```

**Ejemplo:** pared divisoria de 5 × 2,5 m (láminas por los dos lados), parales cada 61 cm.

1. Superficie = 12,5 × 2 = **25 m²**
2. Láminas = 25 × 1,10 ÷ 2,98 = 9,24 → **10 láminas**
3. Parales = ⌈5 ÷ 0,61⌉ + 1 = 9 + 1 = **10 parales**
4. Rieles = 2 × 5 × 1,05 ÷ 3,05 = 3,44 → **4 rieles**
5. Tornillos = 10 × 30 = 300 → **3 cajas**
6. Cinta = 25 × 1,5 = 37,5 m → **1 rollo**
7. Masilla = 25 × 0,7 = 17,5 kg → **4 galones**

Segundo caso: revestimiento (una cara) de 6 × 3,2 m con una puerta de 1,9 m², parales cada 40,6 cm → 7 láminas,
32 parales (16 líneas × 2 piezas, porque 3,2 m supera los 3,05 m del perfil), 5 rieles, 3 cajas de tornillos, 1 rollo de cinta y 3 galones de masilla.

---

## Valores que conviene validar con un maestro de obra

1. **Bloques por m²:** con junta de 1,5 cm salen 14,8 (arcilla) y 12 (concreto). Hay quien usa 15–17 y 12,5.
2. **Arena y piedra por m³ enteros:** para trabajos pequeños se termina recomendando 1 m³ aunque haga falta menos.
   Si la tienda vende por saco o por medio metro, se cambia la presentación.
3. **Dosificación del concreto:** se usó la tabla por resistencia con sacos de 42,5 kg; conviene compararla con la que usa la tienda.
4. **Rendimiento de la pintura** (40 y 30 m² por galón y mano) y del sellador (35 m²): depende de la marca.
5. **Ancho útil de las láminas** (0,70 m zinc; 0,76 m acerolit) y su largo (3,66 m): depende del proveedor.
6. **Impermeabilizante acrílico:** se asumió cuñete de 5 galones y 1 L/m² en total.
7. **Drywall:** 30 tornillos por lámina, 1,5 m de cinta y 0,7 kg de masilla por m².
8. **Alambre de amarre:** 25 g por kg de acero.
