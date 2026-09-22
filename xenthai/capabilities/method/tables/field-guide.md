| Etapa | Paso | Ejecuta | Deja | Participan |
| --- | --- | --- | --- | --- |
| Preparación | Confirmar el acuerdo de alcance y confidencialidad | consultant |  | Dirección general, Área legal del cliente |
| Preparación | Confirmar la agenda de la sesión de arranque | consultant |  | Patrocinador |
| Preparación | Pedir la lista nominal de accesos por escrito | consultant |  | Responsable de TI, Responsable de riesgo |
| Preparación | Confirmar en qué máquina y con qué cuenta correrá el plugin | consultant |  | Responsable de TI |
| Preparación | Confirmar que el comunicado interno está enviado o programado | client |  | Dirección general |
| Instalación del plugin | Instalar Claude Desktop | claude.com/claude-code |  | Consultor |
| Instalación del plugin | Iniciar sesión con la cuenta del cliente | client |  | Cliente |
| Instalación del plugin | Activar Cowork | Claude Desktop → Cowork |  | Consultor |
| Instalación del plugin | Activar la memoria de Claude Desktop | Claude Desktop → Configuración → Memoria |  | Consultor |
| Instalación del plugin | Instalar Node 22 LTS | node --version |  | Consultor |
| Instalación del plugin | Instalar el sincronizador de la nube del cliente | app |  | Consultor, Responsable de TI |
| Instalación del plugin | En Windows, confirmar que el navegador del motor de render está disponible | app |  | Consultor |
| Instalación del plugin | En macOS, instalar Chromium para el motor de render | npx playwright install chromium |  | Consultor |
| Instalación del plugin | Agregar el marketplace desde la aplicación de escritorio | Claude Desktop → Plugins → Agregar marketplace |  | Consultor |
| Instalación del plugin | Instalar el plugin xenthai@xenthai | claude plugin install xenthai@xenthai |  | Consultor |
| Instalación del plugin | Autorizar los conectores en la configuración de claude.ai | claude.ai → Configuración → Conectores |  | Cliente |
| Instalación del plugin | Crear el proyecto de la empresa con sus instrucciones | Claude Desktop → Proyectos → Nuevo proyecto |  | Consultor |
| Instalación del plugin | Correr /xenthai:setup | setup |  | Consultor |
| Instalación del plugin | Correr /xenthai:company-new | company-new | .company.json, journal/ | Consultor |
| Instalación del plugin | Correr /xenthai:doctor | doctor |  | Consultor |
| Encuadre y mandato | Abrir la sesión de arranque | consultant |  | Patrocinador, CAIO |
| Encuadre y mandato | Redactar y firmar la carta de mandato | consultant |  | Dirección general |
| Encuadre y mandato | Constituir el comité de IA | consultant |  | CAIO, Patrocinador, Responsable de TI, Responsable de riesgo |
| Encuadre y mandato | Firmar el acuerdo de alcance y confidencialidad | client |  | Área legal del cliente |
| Encuadre y mandato | Formalizar el acuerdo de acceso por escrito | consultant |  | Dirección general, Responsable de TI |
| Encuadre y mandato | Pedir el manual de identidad y los logotipos | client |  | Dirección general |
| Encuadre y mandato | Pedir catálogo, lista de precios e inventario | client |  | Dirección general |
| Encuadre y mandato | Pedir la plantilla de personal y el organigrama real | client |  | Dirección general, Recursos humanos |
| Encuadre y mandato | Pedir acceso a carpetas, buzón y calendario, y una cuenta de servicio | client |  | Responsable de TI |
| Encuadre y mandato | Enviar el comunicado interno | client |  | Dirección general |
| Perfil y arquetipo | Confirmar la empresa vinculada | doctor |  | Consultor |
| Perfil y arquetipo | Investigar el giro si nadie en el equipo lo conoce | consultant |  | Consultor |
| Perfil y arquetipo | Hacer las cuatro preguntas que ubican el negocio | company-profile |  | Dirección general |
| Perfil y arquetipo | Construir el glosario del giro | company-profile |  | Dirección general |
| Perfil y arquetipo | Asignar el arquetipo y validarlo en voz alta | company-profile | mapeo-<empresa>/00-PERFIL.md | Dirección general |
| Perfil y arquetipo | Cerrar con el plan adaptado y el alcance de la sesión | company-profile | mapeo-<empresa>/00-PERFIL.md | Dirección general |
| Inventario técnico | Recorrer las once categorías del inventario | process-map |  | Responsable de sistemas |
| Inventario técnico | Distinguir app personal de plataforma con API en cada canal de mensajería | process-map |  | Responsable de sistemas |
| Inventario técnico | Calificar el semáforo de integrabilidad de cada sistema | process-map |  | Responsable de sistemas |
| Inventario técnico | Registrar el costo mensual de la pila y los accesos huérfanos | process-map | mapeo-<empresa>/02-inventario.md | Responsable de sistemas |
| Inventario técnico | Nunca registrar una contraseña, llave o token | process-map | mapeo-<empresa>/02-inventario.md | Responsable de sistemas |
| Brief de negocio | Enviar la solicitud de documentos en un solo mensaje | company-intake |  | Dirección general |
| Brief de negocio | Abrir la entrevista de negocio en abierto | company-intake |  | Dirección general |
| Brief de negocio | Pedir el último caso concreto, nunca el promedio | consultant |  | Dirección general |
| Brief de negocio | Levantar el organigrama real contra el formal | company-intake | mapeo-<empresa>/01-personas.md | Dirección general |
| Brief de negocio | Capturar la oferta: productos, servicios y términos | company-offer | mapeo-<empresa>/01-oferta/OFERTA.md | Dirección general |
| Brief de negocio | Escribir el brief de negocio sin proponer soluciones | company-intake | mapeo-<empresa>/01-empresa.md | Dirección general |
| Arqueología documental | Leer la estructura de carpetas antes de abrir un archivo | company-evidence |  | Quien resguarda los archivos |
| Arqueología documental | Muestrear entre 15 y 30 documentos de transacción | company-evidence | mapeo-<empresa>/07-datos/ | Consultor |
| Arqueología documental | Buscar patrones en correo y hojas de cálculo | company-evidence |  | Consultor |
| Arqueología documental | Registrar qué no se pudo revisar, y por qué | company-evidence | mapeo-<empresa>/04-evidencia/fuentes.md | Consultor |
| Arqueología documental | Escribir la tabla de contrastes | company-evidence | mapeo-<empresa>/04-evidencia/HALLAZGOS.md | Consultor |
| Procesos | Elegir entre 8 y 15 procesos, empezando por los dos obligatorios | process-map |  | Consultor |
| Procesos | Entrevistar a quien ejecuta, no a quien administra | process-map |  | Quien ejecuta el proceso |
| Procesos | Pedir de tres a cinco instancias fechadas, nunca un promedio | process-map |  | Quien ejecuta el proceso |
| Procesos | Obtener las excepciones con la pregunta negativa | process-map |  | Quien ejecuta el proceso |
| Procesos | Calcular el costo mensual de cada proceso | process-map |  | Consultor |
| Procesos | Aplicar el filtro de higiene a cada proceso | process-map |  | Consultor |
| Procesos | Escribir el índice de procesos ordenado por costo | process-map | mapeo-<empresa>/03-procesos/INDICE.md, mapeo-<empresa>/03-procesos/PXX-<nombre>.md | Consultor |
| Cobertura y devolución | Calificar cada criterio con la rúbrica X4 | coverage | mapeo-<empresa>/98-COBERTURA.md | Consultor |
| Cobertura y devolución | Convertir cada hueco en pregunta, documento, extracción u observación | coverage | mapeo-<empresa>/99-preguntas-abiertas.md | Consultor |
| Cobertura y devolución | Agrupar las preguntas por persona, no por sub-fase | coverage | mapeo-<empresa>/99-preguntas-abiertas.md | Consultor |
| Cobertura y devolución | Emitir el veredicto de cobertura | coverage | mapeo-<empresa>/98-COBERTURA.md | Consultor |
| Cobertura y devolución | Hacer la devolución con el veredicto a dirección | consultant |  | Dirección general |
| Portafolio y priorización | Extraer una oportunidad por cada señal de desperdicio | consultant |  | Consultor |
| Portafolio y priorización | Aplicar el filtro de higiene antes de puntuar | consultant |  | Consultor |
| Portafolio y priorización | Puntuar cada candidato en sesión conjunta | process-access |  | Dueño del proceso, Responsable técnico |
| Portafolio y priorización | Calcular el retorno con el extremo bajo del rango | process-access | mapeo-<empresa>/05-backlog.md | Consultor |
| Portafolio y priorización | Elegir el primer proceso conectado por credibilidad, no por puntaje | consultant |  | Consultor, Patrocinador |
| Portafolio y priorización | Escribir las tres listas de descarte | consultant |  | Consultor, Comité de IA |
| Arquitectura, datos y plataforma | Designar el sistema de registro de cada entidad de negocio | consultant |  | Responsable de sistemas |
| Arquitectura, datos y plataforma | Probar la conexión con credencial real antes de firmar | consultant |  | Responsable de sistemas |
| Arquitectura, datos y plataforma | Correr la prueba de veinte registros | consultant |  | Responsable de sistemas |
| Arquitectura, datos y plataforma | Firmar la decisión de plataforma con los cinco criterios | consultant |  | Patrocinador |
| Arquitectura, datos y plataforma | Separar el ambiente de pruebas y versionar prompts fuera de la plataforma | consultant |  | Responsable de sistemas |
| Arquitectura, datos y plataforma | Dibujar la arquitectura objetivo en una página | consultant |  | Responsable de sistemas |
| Gobernanza, riesgo y cumplimiento | Abrir la ventana de amnistía de IA en la sombra | consultant |  | Dirección general |
| Gobernanza, riesgo y cumplimiento | Registrar cada sistema de IA en el inventario único | consultant |  | Responsable de gobernanza de IA |
| Gobernanza, riesgo y cumplimiento | Clasificar el riesgo por el peor resultado plausible | consultant |  | Dueño del proceso, Responsable de gobernanza de IA |
| Gobernanza, riesgo y cumplimiento | Probar el interruptor de apagado de cada caso R3 y R4 | consultant |  | Responsable de gobernanza de IA |
| Gobernanza, riesgo y cumplimiento | Firmar la política de uso aceptable de IA | consultant |  | Dirección general |
| Gobernanza, riesgo y cumplimiento | Revisar las cláusulas de cada proveedor con el área legal | consultant |  | Área legal del cliente |
| Personas y adopción | Mapear los actores de cada proceso conectado del piloto | consultant |  | Dueño del proceso |
| Personas y adopción | Nombrar campeones con tiempo liberado formal | consultant |  | Patrocinador, Dueño del proceso |
| Personas y adopción | Sostener la conversación sobre el empleo | consultant |  | Patrocinador |
| Personas y adopción | Correr el programa de capacitación de cuatro semanas | consultant |  | Dueño del proceso |
| Personas y adopción | Actualizar descripciones de puesto e incentivos | consultant |  | Recursos humanos, Patrocinador |
| Personas y adopción | Publicar el tablero de adopción con uso real semanal | consultant |  | Patrocinador |
| Implementación y operación | Escribir la especificación antes de construir | automate-spec | mapeo-<empresa>/06-specs/<AXX>-<nombre>.md | Dueño del proceso |
| Implementación y operación | Correr el piloto en modo sombra antes de producción | consultant |  | Dueño del proceso |
| Implementación y operación | Migrar a credenciales de servicio antes de producción | consultant |  | Responsable de sistemas |
| Implementación y operación | Encender el monitoreo y probar cada notificación de falla | consultant |  | Dueño operativo |
| Implementación y operación | Escribir el runbook y el registro de la automatización | automate-handover | mapeo-<empresa>/06-specs/REGISTRO.md | Dueño operativo |
| Implementación y operación | Aplicar la regla de las tres ocurrencias a cada excepción | consultant |  | Dueño operativo |
| Medición de valor | Congelar la línea base antes de tocar el proceso | baseline | mapeo-<empresa>/08-linea-base.md | Quien ejecuta el proceso |
| Medición de valor | Nombrar la métrica de nivel 3 de cada caso | consultant |  | Dueño del proceso |
| Medición de valor | Elegir el método de atribución y llevar la bitácora de cambios concurrentes | report |  | Consultor |
| Medición de valor | Publicar el tablero del CAIO | consultant |  | Consultor, Patrocinador |
| Medición de valor | Calcular el retorno del programa con tres escenarios | report |  | Finanzas del cliente |
| Medición de valor | Entregar el reporte trimestral al consejo | report |  | Patrocinador |
| Madurez y ruta de 12 meses | Contestar las veinte afirmaciones con fuente y evidencia | consultant |  | Consultor, Patrocinador |
| Madurez y ruta de 12 meses | Calificar el nivel por dimensión con la regla del mínimo | consultant |  | Consultor |
| Madurez y ruta de 12 meses | Nombrar el patrón de estancamiento que amenaza a esta empresa | consultant |  | Consultor |
| Madurez y ruta de 12 meses | Aterrizar la ruta de doce meses por trimestre | consultant |  | Patrocinador, Dirección general |
| Madurez y ruta de 12 meses | Verificar los cinco criterios de salida del acompañamiento | consultant |  | Patrocinador |
| Madurez y ruta de 12 meses | Agendar la conversación de renovación o cierre | consultant |  | Patrocinador, Dirección general |
| Cierre y traspaso | Cerrar el alcance contratado contra lo entregado | consultant |  | Patrocinador |
| Cierre y traspaso | Traspasar accesos y credenciales, y revocar las del consultor | consultant |  | Responsable de sistemas |
| Cierre y traspaso | Firmar el acta de cierre y traspaso | consultant |  | Patrocinador, Dirección general |
| Cierre y traspaso | Confirmar que la capacidad interna quedó instalada | consultant |  | Responsable interno |
