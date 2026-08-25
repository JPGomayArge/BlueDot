# Línea base de medición — 25 de agosto de 2026

Este archivo existe porque **los instrumentos cambiaron** y hay que dejar
escrito dónde está la discontinuidad.

## Qué pasó

El instrumental original vivía sólo en un contenedor efímero y se perdió. Al
reconstruirlo, tres instrumentos quedaron con la definición cambiada:

- **`celdas.json`**: 6.104 celdas, antes 6.713. Los recuadros de región se
  redefinieron de cero.
- **`audit.js`**: fórmulas deducidas leyendo la salida de la versión anterior.
  Marca 48 contornos donde la vieja marcaba 14.
- **`capitales.js`**: 286 ciudades, red completamente nueva; la anterior tenía
  213 y se perdió.

**Ninguna cifra anterior al 25 de agosto de 2026 es comparable con las de aquí
en adelante.**

## El hallazgo que lo motivó todo

`barrido.js` no mide el doble pintado: lo **muestrea**. Dice "cero" cuando
ninguno de sus ~6.100 puntos cae en zona compartida, no cuando no existe zona
compartida. Cambiar la rejilla cambia el veredicto.

Con la rejilla nueva aparecieron de golpe 21 pares que la vieja pisaba por
casualidad. Eso llevó a escribir `dobles_exacto.js`, que interseca los
polígonos y mide el área real. Resultado en el mismo archivo que el barrido
declaraba limpio:

| instrumento | veredicto |
|---|---|
| `barrido.js` con rejilla | 4 pares, 5 celda-año |
| `dobles_exacto.js` | **1.541 pares, 15.338 grado²-año** |

Se resolvieron 216 pares, que concentraban el 98% del daño. La mayoría venían
de arcos corregidos con buenas fuentes días antes: al alargar la vida de una
entidad no se comprobó con quién chocaba en los años añadidos, porque el
barrido decía que no chocaba con nadie.

## Regla que queda establecida

`dobles_exacto.js` es el instrumento oficial de doble pintado. Es determinista
y no depende de ninguna rejilla, así que su definición no puede volver a
cambiar. `barrido.js` se queda sólo como sonda rápida, y su "cero" **no es una
prueba**.

## Cifras de hoy

| medida | valor |
|---|---|
| civilizaciones | 884 (586 políticas + 298 culturales) |
| periodos | 6.167, ninguno sin nombre |
| anillos | 46.440 |
| anillos malformados / vacíos / desordenados | 0 / 0 / 0 |
| solapes temporales dentro de una entidad | 0 |
| solapes internos entre anillos | 0 |
| auto-intersecciones | 0 de 13.242 anillos únicos |
| **doble pintado exacto** | **1.485 pares, 217,8 grado²-año** |
| red de capitales | 286 ciudades, 0 discrepancias |
| auditoría de figuras | 48 contornos (28 trazo grueso, 17 óvalo, 3 caja) |
| intermitencia | 2.042 tramos, 6.985 celda-siglo |
| esbuild | 0 errores |

De los 1.485 pares que quedan, 1.347 están por debajo de 1 grado²-año: son
astillas de décimas de grado repartidas por milenios. Los tres mayores son
casos donde una entidad queda **contenida entera** dentro de otra, que
`resta_civ.js` ya no arregla en silencio sino que avisa, porque no es un
problema de geometría sino de modelo.

## Cómo mantener esto honesto

Cuando cambies un arco, vuelve a pasar `dobles_exacto.js`: alargar la vida de
una entidad casi siempre la mete encima de su sucesor.

Cuando toques un umbral o la rejilla, añade una entrada nueva a este archivo en
vez de reescribir la anterior. Una medida que se ajusta hasta aprobar deja de
ser una medida: el punto de Constantinopla en la red vieja estaba desplazado a
donde había pintura en lugar de estar en la ciudad real, y así el test pasaba
sin probar nada.
