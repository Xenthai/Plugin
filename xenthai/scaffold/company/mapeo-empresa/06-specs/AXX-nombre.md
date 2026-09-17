# 06-specs/<AXX>-<nombre> — ESPECIFICACIÓN (A7 · X2.5) — <automatización> · <empresa>

> Una por automatización aprobada. Lo suficientemente completa para que la construya alguien que no
> estuvo en la sala, y para que sepa cuándo terminó.
> [03-procesos/INDICE.md](../03-procesos/INDICE.md) decide **qué** se automatiza. [REGISTRO.md](REGISTRO.md) registra
> **quién responde** cuando ya corre. Este archivo es lo que va en medio.

**Esquema:** 1 · **Proceso de origen:** — pendiente — · **Aprobada por:** — pendiente — (rol y fecha)
· **Escalón objetivo:** — pendiente — · **Fecha:** <fecha>

---

## 1. Objetivo y techo de autonomía

| Campo | Valor |
| --- | --- |
| Qué deja de hacer una persona, en una frase | — pendiente — |
| Costo del error del proceso *(de la ficha de proceso §6, escala 1-5)* | — pendiente — |
| Los tres controles de datos, ¿se cumplen? | — pendiente — |
| **Escalón objetivo, y qué lo limita** | — pendiente — |

Costo del error en 1 o 2 obliga a dejar una aprobación humana en el camino, sin importar el puntaje
de investigación. Un control de datos que no se cumple impide pasar del escalón 1 a cualquier proceso
que toque datos personales o de clientes: es acción prohibida, no riesgo que el cliente pueda aceptar.

## 2. Criterios de aceptación

**Se escriben antes que el flujo.** Cada uno verificable mirando.

| # | Criterio | ¿Cómo se comprueba? |
| --- | --- | --- |
| 1 | — pendiente — | |

Un criterio que nadie puede comprobar observando es una intención. Esto es además la condición de
salida de la fase: la especificación está lista cuando estos están escritos y acordados.

## 3. Disparador

| Campo | Valor |
| --- | --- |
| Evento o calendario | — pendiente — |
| Si es calendario: intervalo, y consumo mensual de la unidad de cobro de la plataforma | — pendiente — |
| Qué pasa si se dispara dos veces con lo mismo | — pendiente — |

## 4. Datos

| Campo | Valor |
| --- | --- |
| Origen: sistema y **nombres exactos** de campo | — pendiente — |
| Destino: sistema y **nombres exactos** de campo | — pendiente — |
| **Qué pasa si el registro ya existe** *(actualizar / omitir / duplicar / avisar — no hay opción por defecto)* | — pendiente — |
| Identificador único que hace inofensiva una segunda corrida | — pendiente — |
| Campos opcionales y qué hacer si faltan | — pendiente — |

### Reglas de negocio aplicadas

Del proceso capturado, incluidas las no escritas que apareció la fase 2. **Cada una cita de dónde salió.**

| Regla | De dónde salió |
| --- | --- |
| — pendiente — | |

## 5. Ramas de error

Los siete modos de falla de `REGISTRO.md` son el piso. **Toda rama termina en un aviso que recibe
un rol con nombre.**

| Modo de falla | Qué hace la automatización | Qué ve el cliente | Quién actúa |
| --- | --- | --- | --- |
| Entrada mala o incompleta | — pendiente — | | |
| Un sistema no responde | — pendiente — | | |
| Salida equivocada que se ve bien | — pendiente — | | |
| Corre dos veces | — pendiente — | | |
| Credencial vencida | — pendiente — | | |
| El volumen sube | — pendiente — | | |
| El proceso cambió y nadie avisó | — pendiente — | | |

## 6. La persona en el camino

| Campo | Valor |
| --- | --- |
| Qué requiere aprobación manual | — pendiente — |
| Qué rol aprueba | — pendiente — |
| **Qué evidencia permitiría quitar esa aprobación** | — pendiente — |

Todo lo que sale hacia un cliente final se redacta automático y lo envía una persona, cuando menos el
primer periodo en vivo.

## 7. Plan de prueba

Mínimo cinco casos y al menos tres de falla.

| Caso | Entrada | Resultado esperado | ¿Pasó? |
| --- | --- | --- | --- |
| Normal | — pendiente — | | |
| Campo faltante | — pendiente — | | |
| Duplicado | — pendiente — | | |
| Sistema caído | — pendiente — | | |
| Carácter especial o acento | — pendiente — | | |

## 8. Credenciales

**Nunca un valor, nunca un fragmento.** Solo qué se necesita y qué rol lo custodia.

| Servicio | Alcance necesario | Rol que la custodia | ¿Solo lectura? | ¿Cuenta de servicio? |
| --- | --- | --- | --- | --- |
| — pendiente — | | | | |

## 9. Puesta en marcha y operación

| Campo | Valor |
| --- | --- |
| Modo sombra: corre y no escribe, cuántos días, quién valida | — pendiente — |
| Piloto con un usuario: cuánto, quién valida | — pendiente — |
| En vivo: quién autoriza el corte | — pendiente — |
| Dueño del workflow | — pendiente — |
| Cómo se nota que dejó de funcionar | — pendiente — |
| Costo mensual de operarlo | — pendiente — |
| **Procedimiento manual de respaldo** | — pendiente — |

## 10. Plataforma

**Se llena al final, nunca antes.**

| Campo | Valor |
| --- | --- |
| Plataforma elegida | — pendiente — |
| Por qué esa | — pendiente — |
| Cómo cobra, y consumo mensual esperado | — pendiente — |
| Quién la administra | — pendiente — |
| Precio y límites consultados el | — pendiente — (fecha) |

## 11. Lo que esta especificación NO incluye

El borde del alcance. Lo que esté aquí es un cambio, no un pendiente.

- — pendiente —
