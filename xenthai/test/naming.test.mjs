import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TYPES, formatName, parseName } from "../lib/naming.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DOCTRINE = readFileSync(join(ROOT, "capabilities", "naming", "doctrine", "naming.md"), "utf8");

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

const VALID = [
  [{ company: "Xenth AI", type: "Rutina", subtype: "Gmail", name: "Organizar correo" }, "⏱️ Xenth AI: Rutina: Gmail: Organizar correo"],
  [{ company: "Xenth AI", type: "Infra", subtype: "Zapier", name: "WhatsApp Skill" }, "🖥️ Xenth AI: Infra: Zapier: WhatsApp Skill"],
  [{ company: "Capital X", type: "Proyectos", name: "Inicio" }, "📚 Capital X: Proyectos: Inicio"],
  [{ company: "Xenth AI", type: "Costos", subtype: "Automatización", name: "Comparativa de plataformas" }, "💰 Xenth AI: Costos: Automatización: Comparativa de plataformas"],
  [{ company: "Xenth AI", type: "Contenido", subtype: "Higgsfield", name: "Cinematic Promo" }, "🎨 Xenth AI: Contenido: Higgsfield: Cinematic Promo"],
  [{ company: "Xenth AI", type: "Canvas", name: "Manual de marca" }, "🧩 Xenth AI: Canvas: Manual de marca"],
  [{ company: "Xenth AI", type: "Slides", name: "Presentación comercial" }, "📊 Xenth AI: Slides: Presentación comercial"],
  [{ company: "Xenth AI", type: "Docs", subtype: "Plantilla", name: "Propuesta comercial" }, "📄 Xenth AI: Docs: Plantilla: Propuesta comercial"],
  [{ company: "Xenth AI", type: "Web", name: "Manual de marca" }, "🌐 Xenth AI: Web: Manual de marca"],
];

const INVALID = [
  "Rutina: Gmail - Organizar correo",
  "Xenth AI: Canvas: Manual de marca",
  "⏱️ Xenth AI: Automatización: Gmail",
  "🎨 Xenth AI: Rutina: Gmail",
  "⏱️ Xenth AI: Rutina: Gmail: Fase 2: Organizar correo",
];

check("each of the nine valid examples is produced by formatName and read back by parseName", () => {
  const bad = [];
  for (const [parts, expected] of VALID) {
    const made = formatName(parts);
    if (made !== expected) bad.push(`format ${JSON.stringify(made)}`);
    const back = parseName(made);
    if (back.company !== parts.company || back.type !== parts.type || back.name !== parts.name || back.subtype !== (parts.subtype ?? null)) {
      bad.push(`round trip ${expected}`);
    }
    if (back.emoji !== TYPES[parts.type]) bad.push(`emoji ${expected}`);
  }
  return [bad.length === 0, bad.join("; ") || `${VALID.length} round trips`];
});

check("each of the five invalid examples is refused by parseName", () => {
  const accepted = INVALID.filter((text) => {
    try {
      parseName(text);
      return true;
    } catch {
      return false;
    }
  });
  return [accepted.length === 0, accepted.length ? `accepted: ${accepted.join(" | ")}` : `${INVALID.length} refused`];
});

check("every Type in the table has an emoji, and no two Types share one", () => {
  const entries = Object.entries(TYPES);
  const missing = entries.filter(([, e]) => typeof e !== "string" || e.length === 0).map(([t]) => t);
  const distinct = new Set(entries.map(([, e]) => e)).size === entries.length;
  return [entries.length === 10 && missing.length === 0 && distinct, `${entries.length} types; missing ${missing.join(",") || "none"}; distinct ${distinct}`];
});

check("formatName refuses a Type outside the table, including one inherited from Object", () => {
  const bad = ["Automatización", "rutina", "", undefined, "toString", "constructor"].filter((type) => {
    try {
      formatName({ company: "Xenth AI", type, name: "Algo" });
      return true;
    } catch {
      return false;
    }
  });
  return [bad.length === 0, bad.length ? `accepted: ${bad.join(", ")}` : "all refused"];
});

check("formatName refuses an empty or missing company or name", () => {
  const attempts = [
    { company: "", type: "Rutina", name: "Algo" },
    { company: "   ", type: "Rutina", name: "Algo" },
    { type: "Rutina", name: "Algo" },
    { company: "Xenth AI", type: "Rutina", name: "" },
    { company: "Xenth AI", type: "Rutina" },
    { company: "Xenth AI", type: "Rutina", name: "Algo", subtype: "" },
  ];
  const accepted = attempts.filter((a) => {
    try {
      formatName(a);
      return true;
    } catch {
      return false;
    }
  });
  return [accepted.length === 0, accepted.length ? `accepted ${JSON.stringify(accepted)}` : `${attempts.length} refused`];
});

check("formatName refuses a second Subtipo, however it is passed", () => {
  const attempts = [
    { company: "Xenth AI", type: "Rutina", subtype: ["Gmail", "Fase 2"], name: "Algo" },
    { company: "Xenth AI", type: "Rutina", subtype: "Gmail: Fase 2", name: "Algo" },
  ];
  const accepted = attempts.filter((a) => {
    try {
      formatName(a);
      return true;
    } catch {
      return false;
    }
  });
  return [accepted.length === 0, accepted.length ? "a second Subtipo got through" : "both refused"];
});

check("formatName refuses a segment holding the separator, a trailing colon, padding or a line break", () => {
  const segments = ["A: B", "Foo:", " Foo", "Foo ", "Foo\nBar"];
  const accepted = [];
  for (const field of ["company", "subtype", "name"]) {
    for (const value of segments) {
      try {
        formatName({ company: "Xenth AI", type: "Rutina", subtype: "Gmail", name: "Algo", [field]: value });
        accepted.push(`${field}=${JSON.stringify(value)}`);
      } catch {}
    }
  }
  return [accepted.length === 0, accepted.length ? `accepted: ${accepted.join(", ")}` : `${segments.length * 3} refused`];
});

check("parseName refuses an emoji that is not the Type's, a missing emoji and a non-string", () => {
  const attempts = ["🎨 Xenth AI: Rutina: Gmail", "Xenth AI: Rutina: Gmail", "⏱ Xenth AI: Rutina: Gmail", "", null, undefined, 7, "⏱️ Xenth AI: Rutina"];
  const accepted = attempts.filter((a) => {
    try {
      parseName(a);
      return true;
    } catch {
      return false;
    }
  });
  return [accepted.length === 0, accepted.length ? `accepted: ${accepted.join(" | ")}` : `${attempts.length} refused`];
});

check("the doctrine's table is exactly TYPES, so nothing else carries a second copy", () => {
  const rows = [...DOCTRINE.matchAll(/^\| (\S+) \| (\S+) \|/gm)].filter(([, t]) => t !== "Tipo" && !t.startsWith("---"));
  const docTable = Object.fromEntries(rows.map(([, t, e]) => [t, e]));
  const same = JSON.stringify(docTable) === JSON.stringify(TYPES);
  return [same, same ? `${rows.length} rows match` : `doctrine ${JSON.stringify(docTable)}`];
});

check("every valid example appears in the doctrine, and every invalid one is listed as invalid", () => {
  const validHere = VALID.map(([, expected]) => expected).filter((e) => !DOCTRINE.includes(`\`${e}\``));
  const invalidHere = INVALID.filter((e) => !DOCTRINE.includes(`\`${e}\``));
  return [validHere.length === 0 && invalidHere.length === 0, `missing valid ${validHere.length}, invalid ${invalidHere.length}`];
});

let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  let detail = "";
  try {
    [ok, detail] = fn();
  } catch (err) {
    detail = `threw: ${err.message}`;
  }
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ->  ${detail}` : ""}`);
}
console.log("");
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
