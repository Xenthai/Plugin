# Scheduling doctrine — where a routine runs, and how it fails

`ROUTINES.md` in a company's store records **which** routines were agreed and how their absence
becomes visible. This file is about **where** each one actually runs, because the three available
mechanisms fail in different ways and choosing wrong produces a routine that looks configured and
silently never runs.

## 1. The three mechanisms, and the one question that picks between them

| | Cloud routine | Desktop scheduled task | `/loop`, `CronCreate` |
| --- | --- | --- | --- |
| Runs on | Anthropic's infrastructure | This machine | This machine |
| **Reads local files** | **No — fresh clone** | **Yes** | Yes |
| Needs the machine on | No | Yes | Yes |
| Needs the app open | No | **Yes** | Yes, and an open session |
| Survives a restart | Yes | Yes | **No** |
| Minimum interval | 1 hour | 1 minute | 1 minute |
| Costs subscription usage | Yes, plus a daily run cap | Yes | Yes |
| Expires | No | No | **After 7 days** |

**Every routine in this plugin runs as a Desktop scheduled task.** It is the only mechanism that
both persists and reads the company's local files, and the journal on the client's machine is the
entire input to all of them.

An operating-system task running `node` is technically better for the deterministic ones — it costs
nothing, needs no app open, and cannot stall on a permission prompt. **It was deliberately not
chosen**, and the reasoning is operational rather than technical:

- **One place to look.** The Desktop Routines page lists every routine with its run history and its
  skipped runs, each with the reason. Task Scheduler is a separate interface nobody opens, so a
  routine that stopped there stops invisibly.
- **No administrator command on a client's machine.** Registering an OS task needs elevated
  PowerShell, which a client's own IT may refuse — and a setup step that sometimes cannot be
  performed is worse than a slightly weaker one that always can.
- **Pause, resume and run-now are in the same interface** the operator is already in.

What that costs, stated once so nobody rediscovers it: a Desktop task runs only while the app is open
and the machine is awake, so **a routine that stopped is ambiguous from outside the machine** — the
machine was off, the app was closed, or the task stalled. See §2.

Keep the question anyway, because it decides the *model* and the *prompt*: a routine that needs no
judgement gets the cheapest model and a prompt that runs one command and stops. Giving a deterministic
routine a capable model and an open-ended prompt is how it starts interpreting things nobody asked it
to interpret.

### Why a cloud routine is wrong here, specifically

Cloud routines are the better mechanism for most people and the wrong one for this plugin, for three
independent reasons — any one of them is disqualifying:

1. **No access to local files.** The published comparison says "No (fresh clone)". The execution
   journal lives on the client's machine and is the entire input to every routine here. A cloud
   routine cannot see it.
2. **They belong to a person, not an engagement.** "Routines belong to your individual claude.ai
   account… they count against your account's daily run allowance." Created on the client's machine
   they are the client's, consume the client's allowance, and act as the client.
3. **They are repository-centric.** The form requires GitHub repositories, cloned each run. A
   company's material is in its Drive and deliberately not in a repository.

`/loop` and `CronCreate` are disqualified by a single line: session-scoped, and recurring jobs expire
after seven days. A client routine that quietly stops after a week is worse than none.

## 2. The silent failure this mechanism has, and how to close it

A Desktop scheduled task carries its own permission mode. If it runs in a mode where a tool it needs
is not pre-approved, **the run stalls waiting for a person** — it does not fail, and it does not
retry. The session sits open in the sidebar and the routine has effectively stopped, with no error
anywhere.

So creating the task is not finishing it. **Click Run now once, answer every permission prompt with
"always allow", and confirm the output appeared.** Future runs then auto-approve the same tools. A
routine created and never run once is a routine nobody has proved, and that is the same standard
`doctor` applies to the install and `automate-handover` applies to a failure path.

Two more properties worth writing into the prompt rather than discovering:

**A run can arrive very late.** Tasks fire only while the app is open and the machine is awake; a
missed schedule gets exactly one catch-up run for the most recently missed time, within seven days,
and older misses are discarded. A task set for 9am can therefore run at 11pm. Every routine prompt
here must state its own window — *"si ya pasó el día que le corresponde, no lo escribas como si fuera
de hoy"* — or a late run produces a document with the wrong date on it.

**Each run starts fresh with no memory of any conversation.** The prompt must be self-contained:
which document, which folder, which command, what done looks like. A prompt that says "continue what
we discussed" runs against nothing.

### Never write this plugin's own path into a routine's prompt

A plugin is cached at `cache/<marketplace>/<plugin>/<version>/`, so **its absolute path changes every
time the plugin is updated.** A routine prompt carrying a hardcoded plugin path therefore works until
the next release and then fails, and the only symptom is a routine that stopped — which §1 already
says is ambiguous from outside the machine. The operator would go looking at the machine, the app and
the schedule, and the cause would be a release.

The session's own start-up announcement carries the resolved path, and it fires in a scheduled
session exactly as in a manual one. So a routine prompt reads the path from that announcement, and
**refuses rather than guessing** when the line is not there. The company's own folder path is stable
and may be written in.

This is the same class of failure as a hardcoded `store.root`: a value that is correct on the day it
is written and silently wrong later. Anything version-shaped, install-shaped or machine-shaped gets
resolved at run time or refused.

**A permission approval has the same shape.** Approving a task's command once is recorded against the
command as written, so a release that moves the path can require approving again — and until somebody
does, the run stalls. Two consequences: check the digest after every plugin update, and treat a
routine that stopped right after a release as that first, before anything about the engagement.

## 3. What gets scheduled at setup, and what deliberately does not

Only one routine is justified on day one:

| Routine | Mechanism | Cadence | Why day one |
| --- | --- | --- | --- |
| **Status digest** | Desktop scheduled task running `tools/watch.mjs`, cheapest model | Daily | It is monitoring, not a deliverable. It needs no agreement with the client because it produces nothing they read, and its absence is what makes an abandoned engagement visible |

**Every other routine waits for its cadence to be agreed with the client.** `ROUTINES.md` says a
cadence that does not answer a distinct question is not activated, and that the annual review asks of
each row whether anyone read it. Provisioning six routines at setup produces exactly the outcome that
rule exists to prevent: a client trained to ignore all of them.

So the rest are configured **when** agreed, and the configuration is written here so that agreeing
takes minutes rather than a design session.

## 4. The configurations, ready to create when the cadence is agreed

Each one is a Desktop scheduled task: **Code tab → Routines → New routine → Local**, with the working
folder set to the engagement folder. The instructions below are the whole prompt — self-contained by
construction, with the lateness guard already in them.

### Claims sweep — monthly

> Abre `PROOF.md` en el almacén de la empresa. Lista cada afirmación cuya fecha de reverificación
> caiga dentro de los próximos 60 días, y cada una que ya esté vencida. Para cada vencida, marca en
> el documento que no es publicable hasta reverificarse, con la fecha de hoy. No inventes una
> reverificación ni extiendas una fecha. Termina con la lista de las que requieren que una persona
> confirme algo, y a quién. Si hoy no es el día que le corresponde a esta rutina, hazlo igual y
> escribe la fecha real de ejecución, no la programada.

Why monthly: a claim true in March gets republished in December if nothing checks it, and 60 days is
the shortest window that leaves time to re-confirm before it expires.

### Baseline re-measure — quarterly

> Vuelve a medir lo que `BASELINE.md` ya define, con **las mismas definiciones congeladas** que están
> en el documento. Mismos procesos, mismo instrumento, misma unidad. Si una definición ya no aplica,
> **no la cambies**: anótalo como defecto de la serie y di por qué, porque cambiar la definición
> rompe la comparación con todas las mediciones anteriores. Agrega la medición nueva con su fecha y
> quién la midió; nunca sobreescribas la anterior. Si hoy no es el día programado, escribe la fecha
> real.

Why quarterly: the shortest window in which most mapped processes accumulate enough instances for a
median to be stable.

### Presence recapture — quarterly

> Agrega una observación fechada nueva a `PRESENCE.md`, siguiendo el formato que el documento ya usa.
> **Nunca edites ni borres una observación anterior** — el documento es de sólo-agregar, y su valor es
> la serie. Observa únicamente estado público visible, y no afirmes alcance, impresiones ni ingresos.
> Si hoy no es el día programado, escribe la fecha real de la observación.

### Opportunities scan — semiannual

> Corre `node "${CLAUDE_PLUGIN_ROOT}/tools/opportunities.mjs" --journal <raíz-del-almacén>` y lee la
> skill `opportunities` antes de interpretar nada. Cada patrón es una repetición medida, no una
> recomendación: aplica la prueba de autónomo, recurrente y revisable, y deja los hallazgos en
> `PROCESSES.md` con su procedencia visible. Si la bitácora no cubre suficientes periodos, dilo y no
> bajes el umbral.

### The cadence reports — per the cadences agreed in `ROUTINES.md`

These are the one case where a scheduled task is **the wrong answer even though it would work**. A
report is a client-facing deliverable that carries claims, and `REPORTING.md` requires attribution
written by a person who can defend it. Schedule a **reminder** instead of the report:

> Recuérdame que hoy toca el reporte <cadencia> de <empresa>. Corre
> `node "${CLAUDE_PLUGIN_ROOT}/tools/report.mjs" --help` y deja preparado el comando con el mes
> correcto, pero **no escribas el reporte ni lo publiques**: la atribución la redacta una persona.

## 5. Cross-references

| File | Read it when |
| --- | --- |
| `<store>/ROUTINES.md` | Always — it records which routines were agreed and how each absence shows |
| `capabilities/report/doctrine/REPORTING.md` | §2b, on designing absence detection rather than execution |
| `INSTALL.md` | §6b, for the digest's OS task and the folder share |
| `tools/watch.mjs --help` | Before quoting anything about the digest |
