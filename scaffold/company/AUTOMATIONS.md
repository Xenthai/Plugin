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

| # | Proceso | Id en [PROCESSES.md](PROCESSES.md) | Plataforma | Peldaño | Desde | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | — pendiente — | | | | | |

**Estados:** `en vivo` · `en pruebas` · `pausada` · `apagada` · `retirada`

## 1b. La autonomía se gana en tres peldaños

Una automatización no pasa de nada a desatendida. Sube, y **cada peldaño tiene un criterio de salida
que hay que cumplir antes del siguiente** — si no, "la vigilamos un rato" se vuelve permanente y
nadie decide nunca.

| Peldaño | Qué significa | Criterio para subir |
| --- | --- | --- |
| **1 · Visible** | Corre y muestra qué *haría*. No cambia nada. Una persona hace el trabajo como antes y compara | Su salida coincidió con lo que hizo la persona en **al menos diez instancias reales**, y cada discrepancia se explicó, no se pasó por alto |
| **2 · Asistida** | Hace el trabajo y una persona revisa cada salida antes de que salga | Un periodo acordado **sin ninguna salida equivocada que llegue a alguien fuera de la empresa**, y quien revisa puede decir qué está revisando sin leer este documento |
| **3 · Desatendida** | Corre sola; una persona revisa una muestra y todas las escalaciones | Sólo después del peldaño 2. Y sigue teniendo revisor nombrado, tasa de muestreo y periodicidad |

**El orden es la salvaguarda, no el trámite.** En el peldaño 1 una salida equivocada no cuesta nada
y enseña todo: las diez comparaciones son donde salen las excepciones reales del proceso — las que
nadie mencionó al describirlo de memoria.

| Dato del peldaño | Valor |
| --- | --- |
| Peldaño actual | — pendiente — |
| Fecha en que subió | — pendiente — |
| Instancias comparadas en el peldaño 1 | — pendiente — |
| Discrepancias, y cómo se explicó cada una | — pendiente — |
| Quién decidió subirla | — pendiente — *(puesto)* |
| ¿Alguna vez bajó de peldaño, y por qué? | — pendiente — |

**Los peldaños bajan igual que suben.** Una salida equivocada que llega a un cliente la regresa al
peldaño 2, y eso es un evento normal que se registra, no que se discute.

**Sin peldaño anotado, está en el 1.** No importa qué se haya intendido.

## 1c. Postura ante una falla: se detiene o rerutea

Se decide **por automatización**, y se anota quién lo decidió. Lo que nunca es aceptable es que
reruteé por accidente porque nadie decidió.

| Automatización | Postura | Quién lo decidió | Por qué |
| --- | --- | --- | --- |
| — pendiente — | se detiene / rerutea | | |

**Por defecto, para salida comercial: se detiene.** Reencaminar es tomar una decisión sin autoridad
—sustituir un producto, ajustar una cantidad, cambiar un precio son decisiones comerciales, y
[PROCESSES.md](PROCESSES.md) dice quién puede tomarlas. Además, una automatización detenida produce
una escalación que alguien ve en una hora; una que reruteó produce un resultado plausible y
equivocado que aparece semanas después, por un cliente.

**Y las excepciones son donde está el dinero:** son el hallazgo por el que se paga el mapeo. Una
automatización que las absorbe en silencio destruye la evidencia.

Reencaminar sí es la respuesta correcta cuando la salida la lee una persona antes de que importe —
investigación interna, borradores, exploración. Ahí se anota así arriba.

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
