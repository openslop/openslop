---
name: file-issue
description: >
  File a well-formed GitHub issue for openslop from user feedback or a bug, then
  fully classify it: native Issue Type (Bug/Feature/Task), priority/size/type labels,
  and the Priority + Size fields on the roadmap Project. Use when asked to "file an
  issue", "create a gh issue", "add this feedback to issues", or "turn this into an issue".
---

# File a GitHub issue (openslop)

Turn user feedback or a reported bug into a grounded, fully-classified GitHub issue.
Repo: `openslop/openslop`. Every issue gets three axes — **type** (native Issue Type),
**priority**, and **size** — represented BOTH as labels and as Project fields.

## Iron rules

- **Never invent feedback.** Quote the user verbatim in a "Reported by" section.
- **Ground in code.** Point at real `file:line` paths. If you don't know the code, use an
  `Explore` agent to map it before writing (see Step 2).
- **Check for duplicates first** (Step 1). Fold into an existing issue if one already covers it
  (edit that issue's body) rather than filing a near-dup.
- **Always classify** every new issue across all three axes + Project (Steps 4–5). Don't leave
  an issue with only a title.

## Step 1 — Dedup

```bash
gh issue list --repo openslop/openslop --state all --limit 300 --json number,title,state \
  -q '.[] | "\(.number) [\(.state)] \(.title)"' | grep -iE "<keywords>"
```

Read candidate bodies (`gh issue view <n>`). If one already covers the feedback, **fold it in**:
add a "Reported symptom"/"Reported by" block to that issue's body via `gh issue edit <n> --body`,
and stop. Otherwise continue.

## Step 2 — Ground in code

If the relevant files aren't already known, launch an `Explore` agent: "map the 3-6 most
relevant files (path + line numbers, one-line note each) for <feature>; flag whether any
partial version already exists." Use the result to write the "Relevant code" section.

## Step 3 — Write the body

Use this structure (omit sections that don't apply):

```markdown
## Problem
<what's wrong / missing, grounded in how it works today>

## Reported by (verbatim feedback)
- "<exact user quote>"

## Relevant code
- `path/to/file.ts:line` — one-line note

## Suggested direction
<the clean fix; solve the class of problem, not just the instance>

## Acceptance criteria
- [ ] ...

## Related
- #NNN (why)
```

Footer (append to every created body):

```
\n\n---\n🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Create it:

```bash
gh issue create --repo openslop/openslop --title "<title>" --body "<body+footer>"
```

## Step 4 — Classify (type + labels)

Decide the three axes:

**Type** (native Issue Type → label): `Bug`→`bug` · `Feature`→`enhancement` · `Task`→`task`.
- Bug = broken/incorrect behavior. Feature = new user-facing capability. Task = maintenance,
  infra, refactor, licensing, perf/internal.

**Priority** (`priority: high|medium|low`):
- high = reliability bug on a core flow, data loss, core output quality/control, or a
  foundational unblocker. medium = meaningful but non-blocking. low = polish/niche/large-speculative.

**Size** (`size: XS|S|M|L|XL`), judged from real code scope:
- XS = one small edit/CSS/copy, single file. S = one component/hook, localized.
- M = a few files + new component/state/wiring, no new backend. L = new subsystem or
  cross-cutting; new API route/connector/data-model. XL = multi-subsystem / external integration
  / major new surface.

**`good first issue`** — add ONLY when XS or S, isolated, clear fix, low context. Never for
anything touching the generation pipeline, connectors, LLM/OSML, queue, or cross-cutting state.

Apply (native type needs the REST API — gh 2.46 has no `--type` flag):

```bash
N=<issue-number>
gh api --method PATCH /repos/openslop/openslop/issues/$N -f type=Feature   # or Bug / Task
gh issue edit $N --add-label "enhancement" --add-label "priority: high" --add-label "size: L"
# add --add-label "good first issue" when warranted
```

## Step 5 — Add to the roadmap Project + set fields

Project **#1** ("openslop roadmap", org `openslop`). IDs (refresh if the project is ever recreated — see below):

| Thing | ID |
|---|---|
| Project | `PVT_kwDOD7D_684BbnD6` |
| Priority field | `PVTSSF_lADOD7D_684BbnD6zhWWaPQ` |
| &nbsp;&nbsp;High / Medium / Low | `894f709f` / `59f8d3ed` / `df9efa0d` |
| Size field | `PVTSSF_lADOD7D_684BbnD6zhWWaQ8` |
| &nbsp;&nbsp;XS / S / M / L / XL | `d82b7b7e` / `ca2ca9e3` / `22761514` / `e75d0f80` / `a15bff16` |

```bash
PROJECT_ID="PVT_kwDOD7D_684BbnD6"
PRIO_FIELD="PVTSSF_lADOD7D_684BbnD6zhWWaPQ"; SIZE_FIELD="PVTSSF_lADOD7D_684BbnD6zhWWaQ8"
IID=$(gh project item-add 1 --owner openslop \
  --url https://github.com/openslop/openslop/issues/$N --format json \
  | python3 -c "import json,sys;print(json.load(sys.stdin)['id'])")
gh project item-edit --id $IID --project-id $PROJECT_ID --field-id $PRIO_FIELD --single-select-option-id <prio-opt>
gh project item-edit --id $IID --project-id $PROJECT_ID --field-id $SIZE_FIELD --single-select-option-id <size-opt>
```

Requires the `project` token scope (`gh auth refresh -s project --hostname github.com`, run in a
real interactive terminal — the device flow needs a TTY).

## Step 6 — Verify

```bash
gh api /repos/openslop/openslop/issues/$N -q .type.name
gh issue view $N --json labels -q '[.labels[].name]'
```

Confirm: native type set, one `priority:` + one `size:` + one type label (and `good first issue`
if applicable), and the Project item shows Priority + Size. Report the issue URL.

## Refreshing Project IDs (only if the project was recreated)

```bash
gh project list --owner openslop                              # project number
gh project field-list 1 --owner openslop --format json \
  | python3 -c "import json,sys;[print(f['name'],f['id'],[(o['name'],o['id']) for o in f.get('options',[])]) for f in json.load(sys.stdin)['fields'] if f.get('options')]"
```

## Notes on the invariant

- Type lives in the **native Issue Type** field; the `bug`/`enhancement`/`task` labels mirror it.
  Keep them in sync if you change one.
- Priority/Size live in BOTH labels and Project fields (intentional duplication). Update both when
  changing a value — there's no auto-sync.
- For batch sizing/triage of many issues, fan out `Explore` agents (one per batch) with this same
  rubric and apply the results.
