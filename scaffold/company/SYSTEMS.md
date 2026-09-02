# SYSTEMS — <empresa>

> Qué software usa la empresa, qué se puede conectar y qué no.
> Único dueño del detalle técnico de cada sistema. [PEOPLE.md](PEOPLE.md) es dueño de quién tiene
> la llave; [PROCESSES.md](PROCESSES.md) es dueño de qué proceso lo toca.
>
> **La superficie de integración de este archivo es lo que hace cotizable una automatización.**
> Sin ella, cualquier precio es una adivinanza.

**Esquema:** 1 · **Fuente principal:** — pendiente (lista del cliente / factura mensual de software / lo que abre en la mañana) — · **Fecha:** <fecha>

---

## 1. El inventario

| Sistema | Para qué se usa | Superficie de integración | Verificado por | Fuente |
| --- | --- | --- | --- | --- |
| — pendiente — | | | | |

**Superficie de integración**, y esta columna la verifica el consultor, no el cliente — es la
pregunta que los clientes casi nunca pueden contestar:

| Valor | Qué significa | Qué implica para el precio |
| --- | --- | --- |
| `api` | Tiene API documentada y credenciales obtenibles | Lo más barato y lo más estable |
| `export` | Sólo exporta archivos (CSV, Excel, PDF) | Funciona, con un paso de archivo en medio |
| `pantalla` | Sólo interfaz, sin API ni exportación | Frágil y caro; cualquier cambio de interfaz lo rompe |
| `— pendiente —` | Nadie lo ha verificado todavía | **No se cotiza sobre esto.** Se cotiza una revisión aparte |

Una fila en `pendiente` no es un hueco menor: es la diferencia entre un proyecto de seis semanas y
uno que no se puede hacer.

## 2. Qué esperar en México

No es una lista de opciones, es lo que aparece de verdad — y hay que **preguntar, nunca asumir**:

- **SAP Business One** tiene penetración profunda en el segmento medio mexicano
- **CONTPAQi** para contabilidad y nómina
- **Excel más WhatsApp** operando procesos completos, en empresas de cualquier tamaño
- **CFDI 4.0 del SAT** es obligatorio desde julio de 2023, así que **cualquier proceso de
  facturación, nómina o gastos lo cruza**. Es línea base, no un hallazgo

Una pregunta que rinde más que "qué sistemas usan": **qué abre en una mañana normal.** Saca las
hojas de cálculo y los grupos de WhatsApp que nadie llama "sistema" y que de todos modos operan.

## 3. Dónde vive cada dato

Para saber qué se teclea dos veces, y para saber qué datos personales toca una automatización.

| Dato | Dónde se origina | Dónde más se guarda | Se teclea de nuevo |
| --- | --- | --- | --- |
| — pendiente — | | | sí / no |

La última columna, sumada, es el conteo de **puntos de doble captura** de la capa de madurez del
baseline. Se verifica trazando una transacción real de punta a punta — es casi imposible de
simular, porque la API existe o no existe.

## 4. Qué registra cada sistema hoy

| Sistema | ¿Deja bitácora? | Desde cuándo | Qué guarda | Cuánto lo retiene |
| --- | --- | --- | --- | --- |
| — pendiente — | sí / no | | | |

La columna "desde cuándo" se lee de la propia bitácora del sistema, no de lo que alguien recuerde:
una bitácora que empezó ayer no sirve como "antes".

## 5. Datos personales y regulación

| Sistema | Guarda datos personales | De quién | Restricción que aplica |
| --- | --- | --- | --- |
| — pendiente — | sí / no | | |

Si un sistema guarda datos de clientes o de empleados, eso limita qué puede leer una automatización
y qué se puede registrar en bitácora. La bitácora del plugin guarda **referencias, no contenido**,
precisamente por esto.

## 6. Lo que falta verificar

| Sistema | Qué falta | Cómo se verificaría | Bloquea |
| --- | --- | --- | --- |
| — pendiente — | | | |

Esta tabla es la que se convierte en la propuesta de revisión pagada cuando el cliente no puede
contestar. No se cotiza contra el hueco: se cotiza cerrarlo.

## 7. Pendientes

- — pendiente —
