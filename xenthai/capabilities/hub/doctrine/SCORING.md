# Hub priority rubric

Implements: fuera del playbook (X9)

How candidate hubs are ordered into waves. Read it once the candidates exist. Show the per-criterion
score in the map so the company sees why each hub landed where it did.

---

Score each candidate 1–5 on each criterion.

| Criterion | Weight | 1 | 3 | 5 |
|---|---|---|---|---|
| **Use**: how many people would consult it, how often | 5 | A few, occasionally | A whole area, weekly | Several areas, daily |
| **Knowledge at risk**: how much lives only in people | 4 | Already documented | Half documented | Depends on one or two people |
| **Exposure**: cost of getting it wrong (regulatory, money, customers) | 4 | Low | Annoyance or rework | Fines, losses or customer harm |
| **Newcomers**: people joining or rotating in the area | 2 | Almost nobody | Some per year | Frequent joins or high turnover |
| **Sources**: how much material exists to build it | 3 | Nothing; everything to gather | Some, scattered | Documents or code ready |
| **Effort** (inverse): how easy it is to finish | 2 | Many areas and interviews | One area, several interviews | One person can fill it |

Score = Use×5 + Risk×4 + Exposure×4 + Newcomers×2 + Sources×3 + Effort×2. The weights sum to 20,
so the maximum is 100.

- **70 or more** → wave 1.
- **50 to 69** → wave 2.
- **Below 50** → wave 3, or merge into another hub.
- **No owner identified** → never wave 1, whatever the score; it is listed as blocked.

Ties: Exposure first, then Use. A manual adjustment always carries its written reason in the map
("Personas goes first because six people join next week").

A plugin document counts as a source only when it exists and is current: `03-procesos/` raises
Operaciones' Sources, `comunicacion/` raises Marketing's. "Knowledge at risk" is asked as *who would
we lose this with*, never as a self-reported percentage — the same reason the plugin never accepts a
single self-reported number.

## Before you finish

- Every candidate shows six criterion scores and the total.
- Every hub without an owner is out of wave 1.
- Every manual adjustment carries its reason.
