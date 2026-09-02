# Procesos — <Nombre de la empresa>

**Estado del documento:** — pendiente — *(provisional | completo)*
**Fecha de captura:** — pendiente —
**Fuente de la información:** — pendiente — *(quién ejecuta el proceso | gerencia | ambos)*

---

## Cómo leer este documento

Este documento registra cómo opera hoy su empresa, con el detalle necesario para decidir después
qué conviene automatizar y bajo qué límites.

**Un campo inferido se lee exactamente igual que un campo capturado seis meses después.** Así es
como un dato inventado entra al expediente de una empresa y ahí se queda: nadie recuerda cuál se
preguntó y cuál se dedujo. Por eso todo lo que no se capturó dice **`— pendiente —`** y no se
completa por deducción, por parecido con otro proceso, ni por lo que suele pasar en el sector.

Un campo pendiente no es un defecto del documento. Es una pregunta abierta, visible, que se puede
resolver. Un campo inventado sí es un defecto, y es invisible.

Dos reglas más que conviene tener presentes al revisarlo:

- **La columna «Fuente»** dice quién dio cada dato. Si un proceso fue descrito por la gerencia y no
  por quien lo ejecuta, la fila lo dice. La gerencia describe el proceso como está diseñado; quien
  lo ejecuta lo describe como sucede, con sus excepciones.
- **Las cifras de frecuencia, volumen y duración** provienen de instancias concretas con fecha, no
  de promedios de memoria. Donde solo hubo un promedio, la celda lo dice con esas palabras.

---

## 1. Inventario de procesos

### Actividades primarias

| # | Proceso | Rol responsable | Sistemas | Fuente | Detalle capturado |
| --- | --- | --- | --- | --- | --- |
| P1 | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |
| P2 | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |

### Actividades de apoyo

| # | Proceso | Rol responsable | Sistemas | Fuente | Detalle capturado |
| --- | --- | --- | --- | --- | --- |
| A1 | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |
| A2 | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |

> Las actividades de apoyo — compras, sistemas, personal y nómina, facturación, cobranza,
> contabilidad — son las que más se olvidan al enumerar procesos, y son donde suele estar el
> trabajo repetitivo.

---

## 2. Ficha por proceso

> Duplique este bloque completo por cada proceso del inventario. Cada campo es una columna; los
> bloques están separados para que ninguna tabla quede demasiado ancha para leerse.

### P1 · — pendiente —

**Identificación y frontera**

| Nombre como lo llaman internamente | Rol responsable | Disparador | Modalidad | Fuente del dato |
| --- | --- | --- | --- | --- |
| — pendiente — | — pendiente — | — pendiente — | — pendiente — *(manual / digital / híbrido)* | — pendiente — |

| Proveedor (quién entrega el insumo) | Insumo y formato | Resultado | Cliente del resultado |
| --- | --- | --- | --- |
| — pendiente — | — pendiente — *(estructurado / no estructurado)* | — pendiente — | — pendiente — |

**Frecuencia y volumen**

| Frecuencia | Volumen por corrida | Instancias con fecha registradas | Duración observada |
| --- | --- | --- | --- |
| — pendiente — | — pendiente — | — pendiente — *(se requieren de tres a cinco)* | — pendiente — |

**Pasos**

| # | Paso | Rol que lo ejecuta | Sistema | ¿Decisión? | Criterio de la decisión |
| --- | --- | --- | --- | --- | --- |
| 1 | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |
| 2 | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |

**Sistemas y superficie de integración**

| Sistema | Superficie de integración | Quién es dueño de la cuenta | Alcance de permisos disponible |
| --- | --- | --- | --- |
| — pendiente — | — pendiente — *(API / archivo de exportación / solo pantalla)* | — pendiente — *(rol)* | — pendiente — *(leer / escribir / ejecutar)* |

> **«Solo pantalla»** significa que la automatización tendría que operar la interfaz como lo hace
> una persona: es la opción más frágil y la que se rompe cuando el proveedor cambia una pantalla sin
> avisar. Es un dato de costo, no un detalle técnico.

**Excepciones observadas en esta empresa**

| Excepción | Frecuencia (instancias con fecha) | Cómo se resuelve hoy | Quién la resuelve |
| --- | --- | --- | --- |
| — pendiente — | — pendiente — | — pendiente — | — pendiente — |

> Las excepciones son la parte costosa de cualquier automatización: representan cerca del 80% del
> esfuerzo real de construcción. Una excepción no registrada aquí no puede cotizarse; solo puede
> adivinarse.

**Gobernanza — aprobación y permisos**

| Aprobación requerida (rol) | Base de la aprobación | Alcance de permisos por sistema | Reversibilidad de la acción |
| --- | --- | --- | --- |
| — pendiente — | — pendiente — *(regulación / política interna / costumbre)* | — pendiente — | — pendiente — *(reversible / ventana limitada / irreversible)* |

**Gobernanza — registro, límites y escalamiento**

| Qué se registra hoy | Qué debe registrarse | Acciones prohibidas sin supervisión humana | Ruta de escalamiento | Tiempo de respuesta humano real | Etiqueta regulatoria |
| --- | --- | --- | --- | --- | --- |
| — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — *(SAT / PROFECO / COFEPRIS / CNBV-CONDUSEF / ninguno)* |

> **Acciones prohibidas** se escriben como acciones, no como principios: «nunca cancelar un CFDI»,
> «nunca modificar una cuenta bancaria», «nunca enviar a un correo que no esté ya en el expediente
> del cliente».
>
> Todo proceso de facturación, nómina o gastos toca al SAT: el CFDI 4.0 es obligatorio desde julio
> de 2023. La cancelación de un CFDI es irreversible dentro de una ventana legal y, por omisión,
> pertenece a la lista de acciones prohibidas.

---

## 3. Dolor priorizado

*(Se captura en la fase 4. Si esta sección está pendiente, la fase 4 aún no se ha realizado.)*

| # | Proceso | Con qué frecuencia duele | Qué cuesta cuando falla | Instancias con fecha | Orden por dolor |
| --- | --- | --- | --- | --- | --- |
| — | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |

> El orden por dolor y el orden por viabilidad de automatización **casi nunca coinciden**. El
> proceso que más duele suele ser el que más juicio humano exige, y por lo tanto el más difícil de
> automatizar. Ambos órdenes se publican por separado a propósito.

---

## 4. Mapa de accesos

*(Se captura en la fase 4. Si esta sección está pendiente, la fase 4 aún no se ha realizado.)*

| Sistema | Dueño de la cuenta (rol) | Quién puede otorgar acceso | Licencias o lugares disponibles | ¿Permite cuenta de servicio? | ¿Permite solo lectura? | Dónde vive el segundo factor |
| --- | --- | --- | --- | --- | --- | --- |
| — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |

> Este documento **nunca contiene contraseñas, llaves ni tokens**. Registra únicamente el rol que
> los custodia. Si el segundo factor de autenticación vive en el teléfono personal de una persona,
> ninguna automatización puede autenticarse sin ella: es un dato que cambia el diseño y el costo.

---

## 5. Autorización

*(Se captura en la fase 4. Si esta sección está pendiente, la fase 4 aún no se ha realizado.)*

| Pregunta | Respuesta |
| --- | --- |
| Rol que autoriza que una automatización opere sin supervisión | — pendiente — |
| ¿Esa persona participó en la captura? | — pendiente — |
| Ruta de escalamiento cuando algo se detiene | — pendiente — |
| Tiempo de respuesta humano que esa ruta entrega realmente | — pendiente — |
| Lista de acciones prohibidas, confirmada por quien autoriza | — pendiente — |

---

## 6. Evaluación de viabilidad de automatización

Escala de 1 a 5, donde **5 favorece la automatización**.

**Criterios con respaldo en investigación** — Wanner et al., ICIS 2019:

| Proceso | Tiempo de ejecución | Estabilidad | Complejidad | Tipo de dato | Tasa de falla | Puntaje de investigación |
| --- | --- | --- | --- | --- | --- | --- |
| — pendiente — | — | — | — | — | — | — |

**Criterios de juicio experto** — no provienen de la literatura citada; son criterio de esta
consultoría y se reportan por separado:

| Proceso | Costo del error | Restricción regulatoria | Recomendación |
| --- | --- | --- | --- |
| — pendiente — | — | — | — pendiente — *(automatizable sin supervisión / paso asistido con aprobación humana / no automatizable / requiere estandarizarse antes)* |

> **No se publica un promedio único de los siete criterios.** Promediar criterios de investigación
> con criterios de juicio y presentar el resultado como respaldado por investigación convertiría un
> juicio en evidencia. Los dos criterios de juicio funcionan como **techo**: un puntaje de
> investigación alto con un costo del error de 1 no es candidato a operar sin supervisión, sino un
> paso asistido con aprobación humana.

---

## 7. Preguntas abiertas y descubrimiento pendiente

Las cuatro preguntas que con más frecuencia quedan sin respuesta. Ninguna se contesta por
suposición: cada una pendiente se resuelve con un descubrimiento corto, cotizado como partida
independiente.

| Pregunta | Proceso o sistema | Estado | Qué establecería el descubrimiento |
| --- | --- | --- | --- |
| ¿Este sistema tiene API? | — pendiente — | — pendiente — | — pendiente — |
| ¿Quién custodia las credenciales? | — pendiente — | — pendiente — | — pendiente — |
| ¿Cuál es el volumen real? | — pendiente — | — pendiente — | — pendiente — |
| ¿Qué ocurre hoy cuando falla? | — pendiente — | — pendiente — | — pendiente — |
