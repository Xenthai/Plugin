# 05-backlog (A3 §2) — <empresa>

> La lista corta priorizada. `process-access` la escribe a partir de cada ficha de
> [03-procesos/](03-procesos/): el dolor declarado y la viabilidad de automatización, en dos
> órdenes separados a propósito. `opportunities` la revisita cuando un patrón se repite entre
> periodos.

**Esquema:** 1 · **Estado del documento:** — pendiente — *(provisional | completo)*

---

## 1. Dolor priorizado

*(Se captura en la fase 4 de operación — A3. Si esta sección está pendiente, esa fase aún no se ha
realizado.)*

| # | Proceso | Con qué frecuencia duele | Qué cuesta cuando falla | Instancias con fecha | Orden por dolor |
| --- | --- | --- | --- | --- | --- |
| — | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |

> El orden por dolor y el orden por viabilidad de automatización **casi nunca coinciden**. El
> proceso que más duele suele ser el que más juicio humano exige, y por lo tanto el más difícil de
> automatizar. Ambos órdenes se publican por separado a propósito.

## 2. Evaluación de viabilidad de automatización — rúbrica X3

Ocho criterios ponderados, C1 a C8. Peso y qué mide cada uno viven en
`capabilities/method/tables/x3-criteria.md`; la escala de 1 a 5 por criterio, en
`capabilities/method/tables/x3-scales.md` — 5 es siempre la condición favorable, incluidos los tres
criterios invertidos (C5 riesgo, C6 dependencia, C7 resistencia).

**Puntaje** = ( Σ (calificación × peso) ÷ 90 ) × 100 · rango de 20 a 100. La banda de decisión sale
de `capabilities/method/tables/x3-decisions.md`.

| Proceso | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | Puntaje | Decisión |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — pendiente — | — | — | — | — | — | — | — | — | — | — pendiente — *(arranca ya / cola del trimestre / requiere condición previa / descartado)* |

**Tres vetos, por encima del puntaje:** C3 o C5 en 1 bloquea el arranque, sin importar el total, y
exige autorización explícita del comité; C4 en 1 o 2 obliga a resolver primero el dato — arranca la
captura, no la oportunidad; sin línea base congelada no hay arranque, cualquiera que sea el
puntaje.

> **El puntaje ordena candidatos; nunca declara un resultado.** Los tres vetos de arriba lo superan
> en autoridad, y de aquí no sale nunca una cifra de mejora.

## 3. Lista corta

La combinación de los dos órdenes de arriba, para decisión de portafolio. Cada renglón que pasa a
`06-specs/` deja aquí su fecha de aprobación.

| # | Proceso | Orden por dolor | Puntaje de viabilidad | Decisión | Especificación |
| --- | --- | --- | --- | --- | --- |
| — pendiente — | | | | — pendiente — *(aprobado / descartado / en espera)* | [06-specs/](../06-specs/) |

## Pendientes

- — pendiente —
