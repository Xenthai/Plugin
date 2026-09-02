# PRODUCTS — <empresa>

> Lo que esta empresa vende como cosa: con existencia, proveedor y tiempo de entrega.
> Único dueño del catálogo de productos. Los términos comerciales que aplican a todo lo que vende
> —pago, garantía, descuentos, CFDI— viven en [OFFER.md](OFFER.md).
>
> Si la empresa no vende productos, este archivo se queda vacío y se dice por qué. No se borra:
> una empresa que hoy sólo da servicio puede empezar a vender algo el año que entra.

**Esquema:** 1 · **Fuente principal:** — pendiente (lista de precios / catálogo / inventario) — · **Fecha:** <fecha>

---

## 1. El catálogo

| SKU o clave | Cómo se le llama al cliente | Precio | Unidad | Vigencia del precio |
| --- | --- | --- | --- | --- |
| — pendiente — | | | | |

**Todo precio lleva vigencia.** Un precio sin fecha se republica un año después, y ese es el mismo
error que la caducidad de [PROOF.md](PROOF.md) previene para las afirmaciones.

La segunda columna es la que se publica. La clave interna casi nunca sirve frente a un cliente.

## 2. Existencia y reabastecimiento

Esto es lo que decide si una cotización se puede prometer, y es la razón por la que un producto
necesita su propio archivo.

| SKU | Dónde se consulta la existencia | Quién la actualiza | Cada cuánto | Tiempo de entrega |
| --- | --- | --- | --- | --- |
| — pendiente — | | | | |

La segunda columna es un sistema concreto, y su superficie de integración vive en
[SYSTEMS.md](SYSTEMS.md). Si la existencia se consulta en una hoja que alguien actualiza a mano
los martes, **una cotización automática puede prometer lo que no hay** — y eso es un hallazgo, no
un detalle.

## 3. Proveedores

| SKU o familia | Proveedor | Plazo del proveedor | Quién le compra | Qué pasa si no tiene |
| --- | --- | --- | --- | --- |
| — pendiente — | | | | |

## 4. Reglas que cambian el precio de un producto

| Regla | De qué depende | Quién la puede aplicar |
| --- | --- | --- |
| — pendiente — | | |

Ejemplos de qué buscar: volumen, cliente recurrente, temporada, tipo de cambio si el proveedor
factura en otra moneda. Esa última es la que más se olvida y la que más mueve el precio.

## 5. Lo que se dejó de vender

| Qué era | Hasta cuándo | Qué se ofrece en su lugar |
| --- | --- | --- |
| — pendiente — | | |

Sirve para que el contenido no prometa algo descontinuado y para que una automatización sepa
responder en vez de cotizar algo que ya no existe.

## 6. Pendientes

- — pendiente —
