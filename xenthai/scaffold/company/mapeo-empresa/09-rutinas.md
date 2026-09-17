# 09-rutinas (A7 §S5) — RUTINAS — <empresa>

> Las tareas planeadas y su periodicidad. Cada una se acuerda **una vez** y después corre sola sin
> volver a pedir permiso. Este documento nace en el setup, no al cerrar el mapeo: el digest de
> estado ya está corriendo desde el día uno, y una rutina que no está escrita no se puede notar
> ausente. Las cadencias de reporte sí se acuerdan al cerrar el mapeo, con el cliente, y hasta
> entonces quedan en `— pendiente —`.

**Esquema:** 1 · **Estado del documento:** — pendiente — · **Acordado el:** <fecha> · **Con quién:** <nombre y puesto>

---

## Por qué esto se escribe

Una rutina que no está escrita es una sorpresa. Y una rutina que sí está escrita es lo que permite
que corra **sin compuerta de aprobación**: se aprobó una vez, aquí, por escrito, y esa es la
aprobación.

También es lo que hace posible quitarla. En la revisión anual se pregunta de cada renglón: **¿alguien
la leyó?** Una rutina que nadie lee cuesta atención del cliente y no compra nada. Se quita.

---

## 1. Reportes acordados

Cada cadencia responde una pregunta que las otras no pueden. **Cinco reportes diciendo lo mismo a
distintos intervalos entrenan al cliente a dejar de leerlos todos**, así que si una cadencia no
responde algo distinto, no se activa.

| Cadencia | La pregunta que responde | ¿Activa? | Día | A quién llega | Formato |
| --- | --- | --- | --- | --- | --- |
| Quincenal | ¿Algo está roto y nadie me dijo? | — pendiente — | | | 1 página |
| Mensual | ¿Está aterrizando el trabajo? | — pendiente — | | | 2 páginas |
| Trimestral | ¿Cambió el número que medimos antes? | — pendiente — | | | 4–6 páginas |
| Semestral | ¿Fuimos nosotros? | — pendiente — | | | Documento + sesión |
| Anual | ¿Esto valió, y qué deberíamos dejar de hacer? | — pendiente — | | | Documento + sesión |

**Recomendación por defecto:** quincenal y mensual desde el primer mes; trimestral desde el primer
trimestre completo después del baseline; semestral y anual siempre. **El trimestral es el primero
que puede afirmar un resultado** — antes de eso no hay instancias suficientes para que una mediana
sea estable, y un número que después se revierte cuesta más credibilidad que tres meses callados.

### Lo que ninguno de estos reportes va a contener

Se dice aquí, al acordar la rutina, y no cuando alguien pida una cifra que no existe:

- **Horas ahorradas.** No existe: no hay una versión del semestre pasado en que el trabajo no se
  hizo. Lo que sí hay es tiempo de atención medido antes contra tiempo de atención medido ahora, en
  el mismo proceso, con su métrica de calidad — y cuántas instancias puede llevar una persona en
  paralelo, que es lo que la pregunta de duración no ve.
- **Alcance, impresiones o ingresos** de cualquier plataforma sin acceso del lado de la plataforma.
  No se estiman.
- **Cualquier cosa "certificada" o "verificada".** No existe acreditación para este trabajo. La
  frase exacta es *medido y evidenciado, autorreportado*.
- **Una cifra de causalidad.** El reporte semestral afirma una contribución plausible y evidenciada,
  con las explicaciones alternativas nombradas y respondidas. Nunca una magnitud causal.

---

## 1b. Dónde corre cada rutina, y qué pasa cuando no corre

**Una rutina programada en el escritorio sólo corre mientras esa computadora está encendida y la
aplicación abierta.** Eso significa que una rutina puede dejar de correr sin avisar: nadie recibe un
error, simplemente no llega el reporte. Y un reporte que silenciosamente no llega es peor que no
tener la rutina, porque el cliente deja de revisarlo y nadie se da cuenta.

Por eso cada rutina declara dónde vive y cómo se nota su ausencia.

| Rutina | Dónde corre | ¿Qué pasa si esa máquina está apagada? | Cómo se nota que no corrió |
| --- | --- | --- | --- |
| Digest de estado | Tarea programada de Claude Desktop, en esta máquina | No se escribe. El archivo queda con la fecha del último día que sí corrió | La fecha de `digest/estado.md` deja de avanzar. Es lo primero que revisa Xenth AI. Si se detuvo, la causa puede ser la máquina apagada, la app cerrada o la tarea atorada, y eso sólo se ve en la página de Rutinas de esta máquina |
| — pendiente — | escritorio del operador / nube | | |

**La detección de ausencia es lo que hay que diseñar, no la ejecución.** La ejecución falla poco; la
ausencia silenciosa pasa siempre desapercibida. Dos formas que sí funcionan:

- **El reporte lleva número de secuencia.** El quincenal #14 después del #12 hace visible que faltó
  el #13. Un reporte sin secuencia no deja hueco visible.
- **El destinatario sabe cuándo esperarlo.** Un día fijo acordado en la sección 4 convierte la
  ausencia en algo que la persona nota sola.

**Nunca prometer una cadencia que depende de que una laptop esté abierta**, salvo que quede
declarado aquí y el cliente lo acepte con esa condición dicha en voz alta.

## 2. Otras rutinas

| Rutina | Qué hace | Cadencia | ¿Activa? | Notas |
| --- | --- | --- | --- | --- |
| Digest de estado | Escribe `digest/estado.md` con conteos, fechas y veredictos del compromiso | Diaria | **Sí, desde el día uno** | Lo que calcula es aritmética sobre la bitácora local, así que el resultado no puede estar mal y nadie tiene que revisarlo. Corre dentro de una sesión programada, así que necesita esta máquina prendida y la app abierta. **No lleva ningún dato de la empresa** — ni nombres de archivo, ni personas, ni contenido. La carpeta `digest` se comparte con Xenth AI como Lector y el cliente la puede revocar cuando quiera |
| Barrido de afirmaciones | Revisa [PROOF.md](../comunicacion/PROOF.md) por afirmaciones cuya fecha de reverificación se vence en 60 días | Mensual | — pendiente — | Una afirmación cierta en marzo se republica en diciembre si nada la revisa |
| Producción contra el plan | Genera las piezas del plan aprobado | Según [SOCIAL.md](../comunicacion/SOCIAL.md) | — pendiente — | |
| Re-medición del baseline | Vuelve a medir [08-linea-base.md](08-linea-base.md) con las definiciones congeladas | Trimestral | — pendiente — | Mismo instrumento, mismos procesos, o la serie se rompe |
| Recaptura de presencia | Agrega una observación fechada a [PRESENCE.md](../comunicacion/PRESENCE.md) | Trimestral | — pendiente — | Nunca edita la anterior |
| Revisión de contenido sin mantenimiento | Revisa lo publicado que nadie mantiene | Cada 3 años como piso | — pendiente — | La prueba: si dejarlo así estorbaría a una persona no especialista |
| Escaneo de oportunidades | Lee el journal y propone el siguiente proceso que vale automatizar | Mensual | — pendiente — | Acción repetida sobre el mismo tipo de objetivo, consultas concentradas en un proceso, escalaciones que siempre se resuelven igual. **Los dos primeros meses va a decir que no hay historia suficiente** — el piso son 3 periodos distintos — y eso no es que la rutina esté rota |
| Revisión de accesos | Confirma que [03-procesos/INDICE.md](03-procesos/INDICE.md) sigue diciendo quién tiene qué | Semestral | — pendiente — | Quien se fue y sigue con acceso es el hallazgo |
| Salud de la instalación | Corre `doctor` | Mensual | — pendiente — | Barato, y evita descubrir un conector roto en una entrega |

**El digest detecta; el escaneo interpreta.** Son dos renglones y no se duplican. El digest corre
solo, todos los días, y sólo dice cuántos hallazgos disparó cada detector y cuántos periodos abarca
el más ancho — sin sujetos, porque no lleva ningún dato de la empresa. El escaneo abre esos mismos
hallazgos con nombre y objetivo, en sesión, y decide qué significa cada uno; eso necesita el
proceso, la gente y las prioridades del cliente, y ninguna de las tres cabe en una tarea programada.
Borrar cualquiera de los dos deja al otro sin la mitad que le falta.

---

## 3. Lo que cuesta cada rutina

Se registra porque una rutina barata para nosotros puede ser cara para el cliente.

| Rutina | Tiempo del cliente | Tiempo nuestro | ¿Vale? |
| --- | --- | --- | --- |
| — pendiente — | | | |

**Regla de la revisión anual:** de cada rutina activa se pregunta si alguien la leyó y si cambió
alguna decisión. Si la respuesta a las dos es no, se quita. Un proceso que no produce señal es
desperdicio, no rigor.

---

## 4. Quién recibe qué

| Persona | Puesto | Qué reportes | Por qué esa persona |
| --- | --- | --- | --- |
| — pendiente — | | | |

**Un reporte sin destinatario nombrado no se lee.** "Dirección" no es un destinatario.

---

## 5. Historial de cambios a las rutinas

Se agrega un renglón cada vez que una rutina se activa, se apaga o cambia de cadencia. **Nunca se
borra un renglón**: por qué se apagó una rutina es información para la siguiente empresa.

| Fecha | Rutina | Qué cambió | Quién lo pidió | Por qué |
| --- | --- | --- | --- | --- |
| — pendiente — | | | | |

---

## 6. Pendientes

- — pendiente —
