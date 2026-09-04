# DESIGN — <empresa>

> El sistema visual en tokens que el motor de render lee tal cual, más el porqué de cada uno.
> El bloque cercado `css` es el contrato: el motor lo inyecta sin transformarlo y **falla en voz alta**
> si falta un token obligatorio, en vez de renderizar con un color por defecto.

**Esquema:** 1 · **Fase de captura:** 1 · **Última actualización:** <fecha>

---

## 1. Tokens

Markdown con bloque cercado y no JSON, a propósito: JSON no admite comentarios, y el razonamiento de
por qué un color es casi blanco o por qué la tipografía va expandida es lo que se pierde primero y
cuesta más recuperar.

```css
:root {
  /* Fondo y superficies. --ground se queda como está: es el lienzo de todas las piezas. */
  --ground: #000000;
  --surface: #08090c;
  --surface-lift: #0e1116;

  /* Tinta, de más a menos presente. --ink-faint es textura: no puede cargar el mensaje. */
  --ink: #f2f5f9;
  --ink-soft: #b9c3d1;
  --ink-muted: #8f9aa9;
  --ink-faint: #616b78;

  /* El único acento. Nunca rellena un bloque grande. */
  --signal: #dce9ff;
  --line: rgba(198, 214, 235, 0.11);

  /* Familias. Por defecto la paleta OFL que trae el plugin; una fuente propia se declara abajo. */
  --display: "Archivo", sans-serif;
  --body: "Hanken Grotesk", sans-serif;
  --mono: "JetBrains Mono", monospace;

  /* Ancho del eje variable de la display. A 100% no se lee como la marca. */
  --stretch-h1: 116%;
  --stretch-h2: 112%;
}
```

**Obligatorios:** `--ground`, `--ink`, `--ink-soft`, `--ink-muted`, `--ink-faint`, `--signal`,
`--line`, `--display`, `--body`, `--mono`. Los demás tienen valor por defecto en la plantilla.

Los valores de arriba son la paleta neutra del plugin. **Reemplázalos por los de la empresa** y
conserva los comentarios explicando por qué — un token sin razón se cambia por gusto seis meses
después y nadie sabe qué se rompió.

## 2. Fuente propia de la empresa

Si la empresa tiene tipografía de marca, se declara aquí y **sus archivos viven en el almacén de la
empresa, nunca en el repositorio público del plugin** — la mayoría de las fuentes comerciales no son
redistribuibles.

```css
/* Ejemplo. Borrar si la empresa usa la paleta por defecto.
@font-face {
  font-family: "NombreDeLaFuente";
  src: url("file:///ruta/absoluta/en/el/almacen/NombreDeLaFuente.woff2") format("woff2");
  font-weight: 400 800;
}
*/
```

Y entonces `--display` (o `--body`, o `--mono`) apunta a ese nombre. El motor **verifica la familia
que realmente renderizó**: si el archivo no carga y el sistema sustituye la fuente, la pieza falla
en vez de salir con la fuente equivocada.

| Fuente | Licencia verificada | Redistribuible |
| --- | --- | --- |
| Paleta por defecto (Archivo, Hanken Grotesk, JetBrains Mono) | SIL OFL 1.1, sin nombre reservado | Sí, va en el plugin |
| Fuente propia de la empresa | — pendiente — | Casi nunca. Se queda en su almacén |

## 3. Logotipo

| Dato | Valor |
| --- | --- |
| SVG inline, con `fill="currentColor"` | — pendiente — |
| PNG (si no hay SVG) | — pendiente — |
| Proporción del isotipo, si es distinto del logotipo | — pendiente — |

**SVG preferido, PNG aceptado.** El SVG se recolorea con la tinta y escala sin pérdida; un PNG
funciona pero no se recolorea y pierde nitidez en formatos grandes. Si sólo hay PNG, se usa y queda
aquí como pendiente — la fase 1 no se detiene por esto.

Al portar un SVG: quitar los `id` internos de Illustrator (colisionan cuando hay varios SVG en la
misma página) y cambiar el `fill` fijo por `currentColor`.

## 4. Reglas propias de composición

La doctrina general del plugin (`LAYOUT.md`) manda salvo lo que aquí se declare distinto. Lo típico:

| Regla | Valor para esta empresa |
| --- | --- |
| ¿Esquinas redondeadas? | no |
| ¿Degradados? | no |
| ¿Sombras? | no |
| Pie de toda pieza | `https://…` |
| Segunda línea del pie, si aplica | WhatsApp, correo |

## 5. Pendientes

- — pendiente —
