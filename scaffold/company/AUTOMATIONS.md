# AUTOMATIZACIONES — <empresa>

> Qué corre solo, qué hace cuando se equivoca, y cómo se apaga.
> Es el documento de aceptación, no de resultados.

**Esquema:** 1 · **Estado del documento:** — pendiente — · **Última actualización:** <fecha>

---

## Cómo se lee este documento

La prueba de que una entrega quedó bien es simple: **el cliente puede apagar la automatización solo,
sin llamarle a Xenth AI.** Quien no puede apagarla no es dueño de ella, diga lo que diga el contrato.

Por eso este documento no habla de logros. Habla de qué hace, qué hace cuando se equivoca, a quién
escala, y cómo se detiene. Los resultados van en los reportes de cadencia, y sólo cuando hay
instancias suficientes para que un número signifique algo.

---

## 1. Inventario

| # | Proceso | Id en [PROCESSES.md](PROCESSES.md) | Plataforma | En vivo desde | Estado |
| --- | --- | --- | --- | --- | --- |
| 1 | — pendiente — | | | | |

**Estados:** `en vivo` · `en pruebas` · `pausada` · `apagada` · `retirada`

---

## 2. Ficha por automatización

**Duplique este bloque completo por cada automatización.** Cada campo existe porque su ausencia se
descubre en el peor momento.

### A1 · — pendiente —

| Campo | Contenido |
| --- | --- |
| Qué hace, en palabras del proceso | — pendiente — |
| Id del proceso | — pendiente — |
| Qué la dispara | — pendiente — |
| Si el disparador se activa dos veces | — pendiente — |
| **Qué NO hace** — qué escala en vez de resolver | — pendiente — |
| Decisiones que siguen siendo de una persona, y por qué | — pendiente — |
| Alcance de permisos: qué puede tocar | — pendiente — |
| Alcance de permisos: qué **no** puede tocar | — pendiente — |
| **Cómo se apaga** — una instrucción | — pendiente — |
| Quién la administra hoy | — pendiente — *(puesto, no persona)* |

### Qué pasa cuando se equivoca

No es un descargo de responsabilidad. Es la instrucción de operación para el día que importa.

| Falla | Qué hace la automatización | Qué ve el cliente | Quién actúa |
| --- | --- | --- | --- |
| Entrada mala | — pendiente — | | |
| Un sistema del que depende está caído | — pendiente — | | |
| **Produce una salida equivocada que se ve bien** | — pendiente — | | |
| Corre dos veces | — pendiente — | | |
| Se vence o se revoca una credencial | — pendiente — | | |
| El volumen sube más de lo previsto | — pendiente — | | |
| **El proceso cambió y nadie le dijo** | — pendiente — | | |

**Ante una entrada mala, se detiene.** Nunca adivina: una salida adivinada se propaga en silencio y
se descubre semanas después.

**La salida equivocada que se ve bien es el caso más difícil y el primero que hay que diseñar.**

| Dato | Valor |
| --- | --- |
| Qué revisión la atraparía | — pendiente — |
| Quién corre esa revisión | — pendiente — *(puesto)* |
| Cada cuánto | — pendiente — |
| Techo de volumen, y qué pasa al llegar | — pendiente — |

### Plataforma y dependencias

| Dato | Valor |
| --- | --- |
| Plataforma | — pendiente — |
| ¿Autoalojada o del proveedor? | — pendiente — |
| Si es del proveedor: los datos salen de los sistemas del cliente | sí / no — pendiente — |
| ¿Pasan datos personales por ahí? | — pendiente — |
| Costo | — pendiente — |
| Quién lo paga | — pendiente — |
| Quién administra la cuenta | — pendiente — *(puesto)* |
| **Fecha de renovación** | — pendiente — |
| Credenciales: qué rol las custodia | — pendiente — *(nunca la credencial)* |

**La forma más común en que muere una automatización es una tarjeta que se vence en una suscripción
que nadie recordaba que sostenía todo.** Por eso la fecha de renovación es un campo.

**Si los datos salen a un proveedor**, eso es un hecho de [SYSTEMS.md](SYSTEMS.md) y, cuando pasan
datos personales, un hecho del aviso de privacidad.

### Qué registra en la bitácora

Sin esto, no hay después: una automatización que no registra nada no se puede medir, ni defender, ni
mejorar.

| Evento | ¿Lo escribe? | Qué vuelve medible |
| --- | --- | --- |
| `ai_action` | — pendiente — | Volumen, y qué tocó |
| `review_start` / `review_end` | — pendiente — | **Tiempo de atención** — el único sustituto honesto de la pregunta de horas ahorradas |
| `escalation` | — pendiente — | Que el sistema corrió **y** una persona igual tuvo que decidir |
| `error` | — pendiente — | La métrica de calidad que evita que un conteo se infle |
| `blocked` | — pendiente — | Que el alcance de permisos es real y no decorativo |

### La medición del antes

| Dato | Valor |
| --- | --- |
| ¿Se tomó antes de que corriera? | sí / no — pendiente — |
| Tiempo de atención antes, con su definición | — pendiente — |
| Instancias en paralelo antes | — pendiente — |
| Métrica de calidad emparejada antes | — pendiente — |
| Fecha de esa medición | — pendiente — |

**Si no se tomó, hay que decirlo aquí.** Eso es el hallazgo: significa que esta automatización nunca
va a tener un después creíble.

### Aceptación

| Dato | Valor |
| --- | --- |
| Quién aceptó | — pendiente — |
| Puesto | — pendiente — |
| Fecha | — pendiente — |
| ¿Sabe cómo apagarla? | — pendiente — |

**Qué significa esa firma:** que el cliente está de acuerdo en que la automatización hace lo que
este documento dice, y que sabe cómo apagarla. **No** que nunca va a fallar.

---

## 3. Lo que no se pudo automatizar

La mitad honesta del documento, y también el siguiente proyecto.

| Proceso | Por qué no | Qué haría falta |
| --- | --- | --- |
| — pendiente — | | |

---

## 4. Historial

**Nunca se borra un renglón.** Por qué se apagó una automatización es información.

| Fecha | Automatización | Qué cambió | Quién lo pidió |
| --- | --- | --- | --- |
| — pendiente — | | | |

---

## 5. Pendientes

- — pendiente —
