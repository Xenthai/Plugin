# BASELINE — <empresa>

> El "antes" de la operación, medido mientras existía. Es perecedero: una vez que un proceso se
> toca, su antes ya no se puede reconstruir de memoria.
>
> **Todo número de este documento es "medido y evidenciado, autorreportado".**
> Nunca **certificado** ni **verificado**: esas dos palabras exigen una acreditación que aquí nadie
> tiene, y usarlas convertiría una salvedad en una tergiversación.
>
> Sin frontera escrita, no hay antes. Sin instancias fechadas, no hay antes y después.

**Esquema:** 1 · **Última revisión:** — pendiente — · **Levantó la medición:** — pendiente —

---

## Por qué tres capas y ningún puntaje

Este documento reporta tres capas por separado y **nunca** las suma en un puntaje, un nivel ni un
índice de madurez.

El caso más fuerte que existe para un nivel de madurez es CMMI —décadas de uso, evaluaciones
profesionales, un instituto detrás— y la evidencia que liga nivel con desempeño la califica su
propio instituto como **no rigurosa**. Una revisión sistemática de 2023 sobre modelos de madurez
digital concluye, en esencia, que **no hay nada ahí**. Un índice inventado a la medida, aplicado a
una sola empresa y sin grupo de comparación, es más débil todavía.

Además, un puntaje esconde su propia construcción: los pesos **son** el argumento, y un número
único los borra, de modo que usted no podría discutirlos.

| Capa | Qué mide | Qué sí puede sostener | Qué nunca puede sostener |
| --- | --- | --- | --- |
| 1 · Operación | Desempeño por proceso, sólo en los procesos que se van a intervenir | "Este proceso, en estas instancias fechadas, pasó de X a Y" | Una afirmación de desempeño de toda la empresa |
| 2 · Estado | Hechos contables sobre sistemas y procesos | "Estos hechos eran ciertos en esta fecha, verificados así" | Que la empresa opera mejor |
| 3 · Cobertura | Procesos con ejecución asistida ÷ procesos identificados | "Esta parte del trabajo identificado ya está asistida" | El valor de ese trabajo |

La capa 2 es la que se malinterpreta. Un hecho de estado **no** es una afirmación de desempeño:
"siete de once procesos tienen dueño responsable con nombre" no dice nada sobre si corren bien.

---

## Capa 1 — Operación

Sólo los procesos que se van a intervenir. Medir un proceso que nadie va a cambiar gasta la
atención de su equipo y no compra ninguna afirmación.

### Frontera congelada y definiciones — <proceso 1>

Este bloque se escribe y se confirma **antes** de medir y **antes** de cambiar nada. Se repite tal
cual para cada proceso.

| Campo | Contenido |
| --- | --- |
| Disparador exacto (inicio) | — pendiente — |
| Entregable exacto (fin) | — pendiente — |
| Qué cuenta como instancia terminada | — pendiente — |
| Qué cuenta como retrabajo | — pendiente — |
| Volumen del periodo medido | — pendiente — |
| Ventana medida (mes, y si es temporada alta o baja) | — pendiente — |
| Congelada el | — pendiente — · **Confirmó:** — pendiente — |

> La falla clásica es el **corrimiento de frontera**: el "después" mide en silencio un tramo más
> angosto —el paso que se automatizó, no el proceso— y fabrica un logro. Casi nunca es
> deshonestidad; siempre es fatal para la afirmación.

### Medidas — <proceso 1>

| Medida | Definición operativa | Valor en el antes | Fuente | Instancias (n) | Fecha de medición | Quién midió |
| --- | --- | --- | --- | --- | --- | --- |
| Tiempo de ciclo (reloj de pared, disparador → entregable) | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |
| Tiempo de contacto (minutos-persona realmente ocupados) | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |
| Rendimiento (instancias terminadas por persona por periodo) | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |
| Tasa de error y retrabajo (mismas instancias) | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |

**Por qué cuatro medidas y no una.** Por la Ley de Little (`WIP = rendimiento × tiempo de ciclo`,
J. D. C. Little, 1961, un teorema demostrado): si una persona antes se quedaba atorada en una
instancia y ahora supervisa tres, el tiempo de ciclo por instancia queda igual y el rendimiento se
triplica. Medido sólo con tiempo de ciclo, el cambio no aparece.

**Que el tiempo de contacto y el tiempo de ciclo se muevan en direcciones opuestas es la firma de
una buena automatización, no una contradicción.** En trabajo de oficina la eficiencia de flujo
—tiempo que agrega valor ÷ tiempo total— suele estar entre **5% y 15%**: la mayor parte del tiempo
transcurrido es espera, no trabajo.

**Cómo se levantaron los minutos.** Nunca con una sola estimación. Se caminan de tres a cinco
instancias fechadas y concretas con la persona que hace el trabajo, con estas cuatro preguntas:
cuánto tiempo estuvo usted ocupado personalmente; podía hacer algo más mientras tanto o tenía que
quedarse ahí; cuántas veces dejó la tarea para ir a buscar algo; cuántas de éstas podría tener
abiertas al mismo tiempo.

El recuerdo de cuánto dura una tarea repetitiva está dominado por la **sobre**estimación: en una
revisión de 32 estudios, 22% de los resultados quedó alto por más del 100%, y otro estudio
encontró una sobreestimación mediana de 45%. El error corre en la dirección que favorece al
consultor, y por eso una sola estimación no se acepta.

### Estimaciones del cliente sin instancias caminadas

Se registran aquí, aparte, y **no sostienen ningún antes y después**.

| Proceso | Cifra reportada por el cliente | Quién la reportó | Fecha | Etiqueta |
| --- | --- | --- | --- | --- |
| — pendiente — | — pendiente — | — pendiente — | — pendiente — | Reportada por el cliente, no medida de forma independiente |

---

## Capa 2 — Estado verificable

Hechos contables, **no** desempeño. Cada renglón trae la verificación que derrota el teatro
documental (papeles fabricados para pasar la revisión). El patrón detrás de las ocho: **exigir una
fecha, una segunda fuente independiente, o evidencia de uso. Nunca la simple existencia.**

| Hecho de estado | Conteo | Sobre un total de | Verificación exigida | Fecha | Resultado de la verificación |
| --- | --- | --- | --- | --- | --- |
| Sistemas con mapa de accesos documentado | — pendiente — | — pendiente — | Fecha de versión **anterior** a la auditoría; un mapa fechado la semana de la revisión es producto de la revisión | — pendiente — | — pendiente — |
| Sistemas con registro de acciones, y por cuánto tiempo lo conservan | — pendiente — | — pendiente — | Revisar la **fecha de inicio del propio registro**, no la política de retención | — pendiente — | — pendiente — |
| Procesos con dueño responsable con nombre | — pendiente — | — pendiente — | Preguntar al dueño **y a un par independiente, por separado**; si no coinciden, ese proceso no cuenta | — pendiente — | — pendiente — |
| Procesos con ruta de excepción escrita | — pendiente — | — pendiente — | Contrastar contra una **excepción real ya ocurrida**; un documento sin historial de uso es evidencia débil | — pendiente — | — pendiente — |
| Puntos de recaptura de datos (el mismo dato retecleado en otro sistema) | — pendiente — | — pendiente — | **Seguir una transacción real de principio a fin**; casi imposible de simular: la interfaz existe o no existe | — pendiente — | — pendiente — |
| Puntos de falla de una sola persona | — pendiente — | — pendiente — | Evidencia de que el respaldo designado **ya ejecutó la tarea al menos una vez**; designarlo no es evidencia | — pendiente — | — pendiente — |
| Sistemas sin interfaz ni exportación | — pendiente — | — pendiente — | Lo verifica el consultor **directamente**, sin depender de lo declarado | — pendiente — | — pendiente — |
| Procesos que viven en conocimiento no escrito | — pendiente — | — pendiente — | El complemento de "tiene algún procedimiento escrito", medido sobre el **inventario completo**, nunca por muestreo | — pendiente — | — pendiente — |

Estos hechos se reportan **por fecha de corte, no como tendencia**: un conteo que pasa de 4 a 7
invita a trazar una pendiente, y una pendiente invita a extrapolar, que ya es una afirmación de
desempeño que estos hechos no pueden sostener.

---

## Capa 3 — Cobertura

**Procesos con ejecución asistida: — pendiente — de — pendiente — procesos identificados
(— pendiente —% ), al — pendiente —.**

Se reportan los dos números, nunca sólo el porcentaje. Ésta es una afirmación sobre **el trabajo
entregado**, no sobre el desempeño de su empresa, y por eso es la más limpia de las tres capas.

El denominador no se decide aquí: es el inventario de procesos levantado en el diagnóstico. Si ese
inventario cambia, esta línea se recalcula con fecha nueva y se conserva la anterior.

---

## Cómo se reporta cualquier número de este documento

Todo número sale con esta forma completa. Un número sin su definición y sin quién lo midió no se
publica.

| Métrica | Definición fija | Fuente | Fecha de medición | Quién midió | Salvedad |
| --- | --- | --- | --- | --- | --- |
| — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — | Medido y evidenciado, autorreportado |

Reglas que no se negocian:

- **Ninguna cifra de rendimiento o de ahorro se publica sin una métrica de calidad emparejada**
  —error, retrabajo o rechazo— medida sobre las **mismas** instancias. Sin ella, "piezas
  procesadas" se infla partiendo unidades o cerrando en automático lo que nunca se terminó.
- **Nunca comparar un después de temporada alta contra un antes de temporada baja sin etiquetarlo.**
  La temporada se anota en ambos lados.
- Métricas **por unidad**, siempre con volumen y ventana. Un total baja solo cuando baja el volumen.
- **Atribución:** con una sola empresa y sin grupo de control, ninguna afirmación de magnitud es
  defendible. No se dice "logramos 23% de la mejora" ni "sin nosotros habría tomado 40 horas".
  Lo que sí se sostiene es una **contribución plausible y evidenciada**, con el mecanismo escrito y
  las explicaciones alternativas —temporada, personal nuevo, cambio de precios, el efecto de estar
  siendo medidos— nombradas y respondidas.

---

## Anexo — Estado público visible (cuando no hay acceso a métricas de plataforma)

Sin acceso a las métricas de la plataforma, el único antes honesto es el **estado público visible,
con captura de pantalla y fecha**.

| Cuenta / plataforma | Seguidores | Cadencia de publicación (ventana) | Interacción visible | Captura fechada el |
| --- | --- | --- | --- | --- |
| — pendiente — | — pendiente — | — pendiente — | — pendiente — | — pendiente — |

Sostiene afirmaciones sobre **cambio del estado público visible** y nada más. Alcance, impresiones
e ingresos requieren acceso del lado de la plataforma: sin ese acceso no se estiman, simplemente no
están disponibles. Cualquier cifra que su equipo aporte de su propio tablero se etiqueta
**reportada por el cliente**, no medida de forma independiente.
