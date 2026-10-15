# Interface copy

Implements: fuera del playbook (X9)

The words inside a product: labels, buttons, hints, errors, empty states, dialogs, toasts, tooltips. Persuasive page
copy is `brand-copy`'s. How a new string is marked and tabled in a mockup is in `MOCKUP.md`.

## Voice is inherited, tone flexes

1. Before writing, read the copy around the surface and the dictionary keys of its section. The existing copy is the
   voice; a local change does not invent a new one.
2. One concept, one word, everywhere. If the menu says "Archivar", the toast, the dialog and the help say "Archivar".
   Search the dictionary for the term before coining one.
3. Tone moves with the stakes, the voice does not:

| Moment | Tone |
|---|---|
| First use, success, empty state | Warm, brief; light only if the product already is |
| Routine action, settings | Neutral, the fewest words that work |
| Error, destructive confirmation | Calm and literal; no jokes, no exclamation marks |
| Money, security, data loss | Serious, explicit about consequence and reversibility |

## Plain language

1. Front-load: the first two words of a label, heading or message carry its meaning, because people scan.
2. One idea per sentence. Cut every word that does no work; "Para poder" is "Para".
3. Words a tired person understands on the first read. No internal jargon, no idioms, no wordplay that will not
   survive translation.
4. Numerals for numbers ("3 archivos"), and the real value, never "algunos" when the count is known.
5. Address the reader directly. In errors avoid a first-person "we" that sounds like an excuse; state the fact.
6. Match the device: "toque" on touch, "haga clic" with a pointer, "seleccione" when both apply.

## Client language (es-MX)

1. Client-facing strings are es-MX and use *usted* unless the company's own material records another register.
2. Buttons and menu commands use the infinitive: "Guardar cambios", "Enviar respuesta". Instructions and hints use the
   *usted* imperative: "Escriba el correo de su contacto".
3. Sentence case always; title case is an English habit in Spanish and reads as a translation.
4. Gender-neutral by construction where it costs nothing: "Le damos la bienvenida" over "Bienvenido", "Las personas
   del equipo" over "Los usuarios".
5. Anglicisms and regulated claims follow `capabilities/social/doctrine/COPY.md`.
6. Dates, times, numbers and currency are formatted by the locale API (`Intl` with `es-MX`), never by hand.

## Strings are templates

1. A sentence with a variable is one dictionary entry with placeholders, never fragments joined in code: word order
   differs by language.
2. Counts use the dictionary's plural forms (ICU `plural` or the library's equivalent), including zero.
3. Spanish runs longer than English; the layout must absorb it. Say so to `design-ui-layout` when a string grows.
4. Brand names, code tokens and identifiers inside a string carry `translate="no"`.
5. Accessible names, `alt` text and visually-hidden text are dictionary strings too.

## By component

**Buttons.** Start with a verb and name the outcome on its object: "Eliminar proyecto", "Enviar respuesta". Never "OK",
"Sí", "Aceptar" on a consequential action. In a multi-step flow pick one verb per role ("Continuar" to advance,
"Finalizar" to close) and never alternate synonyms.

**Confirmation dialogs.** The title asks the action with its object: "¿Eliminar el proyecto Ventas?". The body states
the consequence and whether it can be undone, in one or two sentences. The confirm button repeats the verb ("Eliminar
proyecto"), so the dialog can be answered from the buttons alone; the other is "Cancelar". Confirm only what is
destructive or costly; a confirmation on every action trains people to click through.

**Errors.** Say what happened and how to fix it, next to where it happened, keeping what the person typed. No blame,
no "Ups", no "inválido" alone, no error codes as the message (a code may follow, for support). For a system failure,
say whether anything was saved and what to do now. If the same error keeps firing, change the interaction instead
of the words.

**Hints.** Shown before the mistake, phrased as what to do ("Use al menos 8 caracteres"), not what not to do.

**Placeholders.** An example of the format, "nombre@empresa.com", never the label and never an instruction the
person needs after typing.

**Empty states.** First use: what this place holds and the one action that fills it. No results: echo the query and
offer the exit ("Sin resultados para «factura». Quitar filtros"). Cleared work: say it is done, briefly. Never put
information there that the person needs once content exists.

**Toggles and checkboxes.** Label the on state: "Enviar resumen semanal", never a negative that makes off a double
negative.

**Links.** The text names the destination and makes sense alone, because screen-reader users list links. Two "Ver
más" on one screen get their object: "Ver más sobre facturación".

**Toasts and status.** Past tense outcome, object first: "Respuesta enviada". An error toast says what failed and
offers the fix. A loading message names what loads.

**Tooltips.** On an icon-only button, the verb of its action ("Archivar"). Never the only place an essential fact
lives.

**Settings references.** Link to the setting instead of describing a path through menus.

## Reviewing copy

Check every label against the action it triggers in the code, every error for a stated fix, every term against the
dictionary. Report one row per root cause with every location:

| Severity | Location | Before | After | Rule |
|---|---|---|---|---|

High: misleads, or hides how to recover. Medium: breaks voice, terminology or casing consistency. Low: isolated
polish. End with `Block` while any High remains, otherwise `Approve`.

## Before you finish

- Every string came from, or is proposed for, the i18n dictionaries in both locales.
- Terms match the dictionary; one word per concept across the surface.
- Buttons start with a verb and name the outcome; dialogs name the action and repeat it on the confirm button.
- Errors state what happened and the fix, beside the field, without blame.
- Empty states give the next step; placeholders are examples; toggles name the on state.
- es-MX: *usted*, infinitive buttons, sentence case, locale formatting, no concatenated sentences.
- Every factual sentence was checked against what the code does.
