| ID | Criterio | Evidencia que lo satisface | Bloqueante | Fase |
| --- | --- | --- | --- | --- |
| PA1 | Las cuatro preguntas de ubicación contestadas: cómo entra el dinero, cuánto tarda una venta, qué se entrega, qué impide vender el doble | `00-PERFIL.md` con las cuatro respuestas y su fuente | Sí | P |
| PA2 | Arquetipo asignado y justificado; si hay mezcla, cuál manda | Justificación que nombra la línea de mayor margen | Sí | P |
| PA3 | Glosario del giro con los términos que el consultor no dominaba | De 8 a 20 entradas en las palabras del cliente | No | P |
| PA4 | Estacionalidad y meses en que no conviene implementar | Calendario de temporada alta y baja, con fuente | No | 1 |
| IT1 | Cada sistema listado con nombre exacto y plan o versión | Tabla de `02-inventario.md` sin filas que digan "el sistema" | No | 0 |
| IT2 | Quién controla cada sistema, con nombre propio | Nombre de persona por fila, no área | Sí | 0 |
| IT3 | Semáforo de integrabilidad: verde API o conector nativo, amarillo solo archivos, rojo cerrado | Verificado contra la documentación del proveedor y el plan contratado | Sí | 0 |
| IT4 | Modalidad exacta de cada canal de mensajería con clientes | Respuesta a "¿contestas desde una app instalada o desde una plataforma web?" | Sí | 0 |
| IT5 | Costo mensual y anual de la pila completa | Suma con fuente por línea | No | 0 |
| IT6 | Historia de software comprado y abandonado, con el motivo | Al menos un caso, o la afirmación de que no hay ninguno | No | 0 |
| NE1 | Cómo gana dinero el negocio, en una frase | Frase escrita y validada con dirección | Sí | 1 |
| NE2 | Por línea: ticket promedio, operaciones al mes y ciclo de venta, con unidad y periodo | Tres cifras por línea con fuente y nivel | Sí | 1 |
| NE3 | Margen relativo entre líneas, aunque sea ordinal | Orden explícito de líneas y quién lo afirma | No | 1 |
| NE4 | Restricción principal —demanda, capacidad de entrega, administración o capital— contrastada | La restricción declarada más un dato documental que la sostiene o la contradice | Sí | 1 y 2 |
| NE5 | Nombre propio por cada rol operativo | Organigrama real con nombres, no puestos | No | 1 |
| NE6 | Cuellos de botella de personas: quién es la única persona que sabe hacer algo | Lista con nombre y qué se detiene si falta | Sí | 1 |
| NE7 | Tipos de cliente con ticket y origen real | Origen de los últimos tres clientes, perseguido uno por uno | No | 1 |
| NE8 | Cuánto tarda un peso desde el sí hasta la cuenta | Días promedio con fuente | No | 1 |
| NE9 | Concentración: si algún cliente pasa del 30 % del ingreso anual | Porcentaje calculado, no recordado | No | 2 |
| NE10 | Restricciones declaradas: qué tiene que seguir siendo humano y por qué | Lista escrita, tratada como restricción de diseño | Sí | 1 |
| ED1 | Qué se revisó, con qué muestra, y qué quedó fuera y por qué | `04-evidencia/fuentes.md` con la causa de cada exclusión | Sí | 2 |
| ED2 | Al menos una cifra clave del bloque NE contrastada contra documentos | Tabla de contrastes: lo declarado, lo observado, qué explica la brecha | Sí | 2 |
| ED3 | Al menos tres reglas de negocio no escritas, aparecidas al contrastar | Tres reglas redactadas como condición, con el caso que las reveló | Sí | 2 |
| ED4 | Convención de nombres y estructura de carpetas | Patrón identificado: es la llave de cualquier automatización futura | No | 2 |
| ED5 | Hojas de cálculo mantenidas a mano: qué resuelven y quién las actualiza | Una fila por hoja, con qué pasa cuando esa persona no está | No | 2 |
| ED6 | Con conversaciones disponibles: tiempo de respuesta real, preguntas repetidas y motivos de pérdida | Cifras derivadas de marcas de tiempo, no de memoria | No | 2 |
| PR1 | Proceso completo del dinero: de la primera señal de interés al cobro efectivo | Ficha con pasos, actores y sistemas de punta a punta | Sí | 3 |
| PR2 | Proceso completo de la entrega: del compromiso al entregable aceptado | Ficha completa | Sí | 3 |
| PR3 | Procesos administrativos recurrentes que consumen días | Dos fichas, o la justificación de por qué no existen | No | 3 |
| PR4 | Por proceso: frecuencia al mes y minutos por vez | Las dos cifras y el método con que se obtuvieron | Sí | 3 |
| PR5 | Por proceso: dueño con nombre propio | Nombre en la ficha, validado con esa persona | Sí | 3 |
| PR6 | Por proceso: excepciones, no solo el camino normal | Al menos dos excepciones con su frecuencia | Sí | 3 |
| PR7 | Por proceso: reglas de autorización, quién aprueba qué y desde qué monto | Umbrales con cifra y unidad | Sí | 3 |
| PR8 | Por proceso: costo del error, qué pasa al fallar, cada cuánto y cuánto cuesta | Fallas al mes por costo promedio por falla | No | 3 |
| PR9 | Por proceso: veredicto de higiene, ¿funciona bien hecho a mano? | Sí, o "rediseñar antes de automatizar" con qué habría que arreglar | Sí | 3 |
| PR10 | Al menos un proceso validado con quien lo ejecuta, no solo con quien dirige | Nombre y fecha de validación en la ficha | Sí | 3 |
| PR11 | Señales de oportunidad marcadas: doble captura, esperas, retrabajo, reportes manuales | Señal anotada en el paso donde ocurre | No | 3 |
| PR12 | Costo por hora cargado de quien ejecuta cada proceso mapeado | Sueldo con carga social entre 160 horas, marcado si es estimado | Sí | 1 y 3 |
| DA1 | Dónde vive el dato de clientes y dónde el de operación, aunque sea un Excel | Ubicación por tipo de dato, con el sistema o archivo nombrado | Sí | 0 |
| DA2 | Calidad del dato que necesitarían las oportunidades probables: llave única, completitud, histórico | Muestra real revisada, no la opinión de quien captura | Sí | 0 y 2 |
| DA3 | Accesos huérfanos: cuentas de ex-empleados, de terceros o personales usadas para el negocio | Lista con la cuenta y quién debería controlarla | No | 0 |
| DA4 | Respaldo de la información crítica y quién lo hace | Frecuencia, destino y última restauración verificada | No | 0 |
| DA5 | Alcance de acceso por escrito antes de abrir el primer archivo | Autorización con nombre y fecha en `fuentes.md` | Sí | 0 |
| RC1 | Qué datos personales toca la operación y de qué categoría | Inventario por proceso: identificativos, financieros, de salud, de menores, biométricos | Sí | 2 y 3 |
| RC2 | Si hay aviso de privacidad publicado y qué cubre | El documento, o el hallazgo explícito de que no existe | Sí | 0 |
| RC3 | Marcos legales aplicables por país de operación y de clientes | Marco nombrado, sin emitir asesoría legal, con recomendación de revisión por abogado | No | 2 |
| RC4 | Qué procesos producen decisiones sobre personas o actos irreversibles | Marca en la ficha: entrada del criterio de humano en el circuito de A5 | Sí | 3 |
| RC5 | Qué automatización propuesta transferiría datos personales a un servicio de IA | Lista que alimenta A5 y el anexo X5 | No | 3 |
| RC6 | Ninguna credencial registrada en la base de conocimiento | Revisión del repositorio: consta que la cuenta existe y quién la controla, nunca cómo entrar | Sí | 0 |
