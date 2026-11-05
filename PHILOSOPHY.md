# Philosophy

Why we write code the way we do. [CONVENTIONS.md](CONVENTIONS.md) is the what.

## 01. Writing is cheap, review isn't

> Software should be designed for ease of reading, not ease of writing.

Agents write code faster than anyone can read it, so review is now the bottleneck. Merging code nobody has read is the quickest way to turn a codebase into a big ball of mud.

## 02. A human understands every line

Agents don't know the business, why a boundary sits where it does, or how people actually use the editor. We do, so a person reads, understands, and approves every change. "The agent wrote it" isn't an answer. See [AI_POLICY.md](AI_POLICY.md).

## 03. Strategic, not tactical

> Working code isn't enough.

> Almost every software development organization has at least one developer who takes tactical programming to its logical extreme: a tactical tornado.

An agent left alone is a tactical tornado that never gets tired.

## 04. Complexity is incremental

> Complexity isn't caused by a single catastrophic error; it accumulates in lots of small chunks.

Every shortcut looks fine in review, so we say no to "just this once."

## 05. Watch for the three symptoms

Change amplification (one change, many files), cognitive load (too much to keep in your head), and unknown unknowns (you can't tell what will break). Nearly every rule we have keeps one of these down.

## 06. Deep modules, nothing leaks

> It is more important for a module to have a simple interface than a simple implementation.

> Information leakage occurs when a design decision is reflected in multiple modules.

## 07. Write the rules down

Rules in someone's head don't get followed, by people or agents. Our nightly bot, [Nightshift](https://github.com/openslop/nightshift), gets over 90% of its rule-following PRs approved and under 50% of its open-ended ones. If a rule gets in your way, open an issue to change it.

## 08. Boring on purpose

Agents copy whatever they see, so give them boring, clean code to copy.

## 09. Small PRs, and deleting counts

Small diffs get read, big ones get skimmed. Deleting code is progress.

---

Quotes are from John Ousterhout's _A Philosophy of Software Design_. Read it.
