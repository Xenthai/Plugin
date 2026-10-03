/**
 * The one table of name Types and the emoji each one carries. Everything that names a routine, a
 * chat, a session or an artifact reads its emoji from here, so a Type is never paired with a
 * second emoji somewhere else. All ten are confirmed by Derian; changing one means changing this table only.
 */
export const TYPES = Object.freeze({
  Rutina: "⏱️",
  Infra: "🖥️",
  Proyectos: "📚",
  Costos: "💰",
  Contenido: "🎨",
  Canvas: "🧩",
  Slides: "📊",
  Docs: "📄",
  Web: "🌐",
  Sheets: "📈",
});

/**
 * Separator between segments. A segment may not contain it, which is what lets `parseName` read a
 * name back without guessing where one segment ends.
 */
const SEPARATOR = ": ";

/**
 * Checks one segment and returns it. Rejects the empty segment, one that is not a string, one with
 * surrounding whitespace or a trailing colon (which would fuse with the separator), a line break,
 * and the separator itself.
 */
const segment = (label, value) => {
  if (typeof value !== "string") throw new Error(`naming: ${label} must be a string`);
  if (value.trim() === "") throw new Error(`naming: ${label} is empty`);
  if (value !== value.trim()) throw new Error(`naming: ${label} has surrounding whitespace: ${JSON.stringify(value)}`);
  if (/[\r\n]/.test(value)) throw new Error(`naming: ${label} contains a line break`);
  if (value.includes(SEPARATOR) || value.endsWith(":")) {
    throw new Error(`naming: ${label} contains "${SEPARATOR}", which separates segments: ${JSON.stringify(value)}`);
  }
  return value;
};

/**
 * Builds a name from its parts: `Emoji Empresa: Tipo: [Subtipo:] Nombre`. The emoji comes from the
 * Type and is never passed in. At most one Subtipo is accepted, as a string; absent means `null`
 * or `undefined`, and an empty string is an error rather than a silent omission.
 */
export const formatName = ({ company, type, subtype, name } = {}) => {
  if (typeof type !== "string" || !Object.hasOwn(TYPES, type)) {
    throw new Error(`naming: type ${JSON.stringify(type)} is not in the table (${Object.keys(TYPES).join(", ")})`);
  }
  const parts = [segment("company", company), type];
  if (subtype !== undefined && subtype !== null) parts.push(segment("subtype", subtype));
  parts.push(segment("name", name));
  return `${TYPES[type]} ${parts.join(SEPARATOR)}`;
};

/**
 * Reads a name back into `{ emoji, company, type, subtype, name }`, with `subtype` null when the
 * name has none, or throws. It rejects what `formatName` would never produce: a missing or wrong
 * emoji, a Type outside the table, and a segment count other than three or four.
 */
export const parseName = (text) => {
  if (typeof text !== "string") throw new Error("naming: name must be a string");
  const space = text.indexOf(" ");
  if (space < 1) throw new Error(`naming: no leading emoji: ${JSON.stringify(text)}`);
  const emoji = text.slice(0, space);
  const parts = text.slice(space + 1).split(SEPARATOR);
  if (parts.length < 3 || parts.length > 4) {
    throw new Error(`naming: expected Empresa: Tipo: [Subtipo:] Nombre, found ${parts.length} segment(s): ${JSON.stringify(text)}`);
  }
  const [company, type, ...rest] = parts;
  if (!Object.hasOwn(TYPES, type)) throw new Error(`naming: type ${JSON.stringify(type)} is not in the table`);
  if (emoji !== TYPES[type]) {
    throw new Error(`naming: ${type} carries ${TYPES[type]}, found ${JSON.stringify(emoji)}`);
  }
  const name = rest.pop();
  const subtype = rest.length ? rest[0] : null;
  return { emoji, company: segment("company", company), type, subtype: subtype === null ? null : segment("subtype", subtype), name: segment("name", name) };
};

/**
 * Characters Windows and Drive refuse in a file name. A segment holding one is rewritten, never
 * rejected: the title it came from is valid, and the export still has to be saved.
 */
const FILE_FORBIDDEN = /[\\/:*?"<>|]/g;

/**
 * The file name for an exported artifact: the title read back with `parseName`, the emoji dropped
 * and ` - ` between segments, as `Empresa - Tipo - [Subtipo - ]Nombre.ext`. An exported file never
 * carries the emoji, which belongs to the title inside the app. Throws when the title is not a
 * valid name, so a malformed title is caught at export instead of saved under a wrong name.
 */
export const fileName = (text, extension) => {
  if (typeof extension !== "string" || !/^[A-Za-z0-9]+$/.test(extension)) {
    throw new Error(`naming: extension must be letters and digits without a dot: ${JSON.stringify(extension)}`);
  }
  const { company, type, subtype, name } = parseName(text);
  const clean = (s) => s.replace(FILE_FORBIDDEN, "-").trim();
  return `${[company, type, subtype, name].filter((s) => s !== null).map(clean).join(" - ")}.${extension}`;
};
