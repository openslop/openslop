# Philosophy

This is why we write code the way we do. [CONVENTIONS.md](CONVENTIONS.md) covers the what, and this covers the why.

## 01. Writing is cheap, review isn't

> Software should be designed for ease of reading, not ease of writing.

An agent can write a thousand lines before your coffee cools, but reading those lines, understanding them, and deciding whether they belong hasn't gotten any cheaper. The bottleneck has moved from writing code to reviewing it well, and that changes what kills a project. It used to be running out of people to write the code, and now it's code piling up faster than anyone can understand it.

## 02. Mud is the default

Left alone, every codebase slowly turns into a big ball of mud, and agents just get there faster. Merging a pile of unreviewed, agent-written code is the quickest way we know to kill a project today.

## 03. Agents don't have the whole picture

We use agents every day and they're great, but they don't know the business, which keeps changing. They don't know why a module boundary sits where it does, how a user actually moves through the editor, or what the next person will need to understand when they open the file. Each change looks fine on its own, and the damage only shows up across a hundred of them.

## 04. A human understands every line that lands

Agents can write code and leave review comments, but only people approve. Whoever approves a PR should be able to explain it, and whoever opens one should have read their own diff first, because "the agent wrote it" isn't an answer to "why is it like this?" People are the ones who connect the code to our users and the business, and that context lives in our heads, not in the repo. [AI_POLICY.md](AI_POLICY.md) spells out what this means for your PR.

## 05. Strategic, not tactical

> Working code isn't enough.

> Almost every software development organization has at least one developer who takes tactical programming to its logical extreme: a tactical tornado.

Tactical code gets this feature working, while strategic code keeps the next ten changes cheap. An agent left alone is a tactical tornado that never gets tired, and a team that only works tactically reaches the mud much sooner.

## 06. Complexity is incremental

> Complexity isn't caused by a single catastrophic error; it accumulates in lots of small chunks.

The one-off flag, the copied helper, the extra `if` for one caller, each one looks reasonable in review. So we say no to each shortcut, even when it's "just this once."

## 07. Watch for the three symptoms

> Complexity is anything related to the structure of a software system that makes it hard to understand and modify the system.

It shows up in three ways. Change amplification is when a simple change has to touch many files, cognitive load is when you have to hold too much in your head to change something safely, and unknown unknowns are when you can't even tell what needs to change because something is coupled in a way you can't see. Nearly every rule we have exists to keep one of these down.

## 08. Deep modules, nothing leaks

> It is more important for a module to have a simple interface than a simple implementation.

> Information leakage occurs when a design decision is reflected in multiple modules.

So we pull complexity down where callers don't have to carry it, and give each decision one home so the next change only has to find it once.

## 09. Write the rules down

Rules that live in someone's head don't get followed, by people or by agents. "This breaks rule X" is a quick conversation and "I don't like this" is a long one, so written rules make review faster and make agents a lot better. Our nightly bot, [Nightshift](https://github.com/openslop/nightshift), has opened over 500 PRs here since March 2026, and the jobs that follow written rules get approved over 90% of the time, while open-ended ones like "go find bugs" land under 50%. If a rule gets in your way, open an issue to change it rather than working around it.

## 10. Boring on purpose

Boring code is easy to review, easy to delete, and easy for the next person or agent to copy correctly, while clever code gets copied wrong. Agents copy whatever patterns they find, so a clean codebase teaches them good habits and a messy one teaches them bad ones at scale. Keeping things boring is how we get to keep using agents without losing control of the codebase.

## 11. Check every diff, and sweep the whole codebase

Every diff gets reviewed as it comes in, but some problems only show up across many diffs, like dead code, the same logic in three places, or two modules that slowly grew into each other. So Nightshift also sweeps the codebase on a schedule, one narrow job at a time. A human approves its PRs like anyone else's, and rejected ideas get logged so they don't come back.

## 12. Small PRs, and deleting counts

Keep each PR to one change, because small diffs get read carefully and big ones get skimmed. And deleting code counts as progress, often the best kind.

---

Quotes are from John Ousterhout's _A Philosophy of Software Design_, where most of this comes from. It's worth reading in full.
