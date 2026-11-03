# Philosophy

This is why we write code the way we do. [CONVENTIONS.md](CONVENTIONS.md) covers the what, and this covers the why.

## 01. Writing is cheap, review isn't

An agent can write a thousand lines before your coffee cools, but reading those lines, understanding them, and deciding whether they belong hasn't gotten any cheaper. The bottleneck has moved from writing code to reviewing it well, and that changes what kills a project. It used to be running out of people to write the code, and now it's code piling up faster than anyone can understand it.

## 02. Mud is the default

Left alone, every codebase slowly turns into a big ball of mud, and agents just get there faster. Merging a pile of unreviewed, agent-written code is the quickest way we know to kill a project today.

## 03. Agents don't have the whole picture

We use agents every day and they're great, but they don't know the business, which keeps changing. They don't know why a module boundary sits where it does, how a user actually moves through the editor, or what the next person will need to understand when they open the file. Each change looks fine on its own, and the damage only shows up across a hundred of them.

## 04. A human understands every line that lands

Agents can write code and leave review comments, but only people approve. Whoever approves a PR should be able to explain it, and whoever opens one should have read their own diff first, because "the agent wrote it" isn't an answer to "why is it like this?" People are the ones who connect the code to our users and the business, and that context lives in our heads, not in the repo.

## 05. Strategic, not tactical

John Ousterhout splits programming into two styles. Tactical programming gets this feature working right now, while strategic programming spends a bit more time so the next ten changes stay cheap. Tactical feels faster at first and then stalls, and since agents are tactical by default and write a lot of code, a team that only works tactically reaches the mud much sooner.

## 06. Complexity is incremental

No single PR makes a codebase hard to work in. It's the one-off flag, the copied helper, and the extra `if` for one caller, each small and reasonable on its own and together the whole mess. So we say no to each shortcut, even when it's "just this once."

## 07. Watch for the three symptoms

Ousterhout names three signs that code is getting too complex. Change amplification is when a simple change has to touch many files, cognitive load is when you have to hold too much in your head to change something safely, and unknown unknowns are when you can't even tell what needs to change because something is coupled in a way you can't see. Nearly every rule we have exists to keep one of these down.

## 08. Deep modules, nothing leaks

A good module hides a lot behind a simple interface, while a shallow one has an interface almost as complicated as what it does, so it hides nothing. We pull complexity down into the module so callers don't have to carry it. When the same design decision shows up in two places, Ousterhout calls it information leakage, and the next change will have to find both.

## 09. Write the rules down

Rules that live in someone's head don't get followed, by people or by agents. "This breaks rule X" is a quick conversation and "I don't like this" is a long one, so written rules make review faster and make agents a lot better. Our nightly bot, [Nightshift](https://github.com/openslop/nightshift), has opened over 500 PRs here since March 2026, and the jobs that follow written rules get approved over 90% of the time, while open-ended ones like "go find bugs" land under 50%. If a rule gets in your way, open an issue to change it rather than working around it.

## 10. Boring on purpose

Boring code is easy to review, easy to delete, and easy for the next person or agent to copy correctly, while clever code gets copied wrong. Agents copy whatever patterns they find, so a clean codebase teaches them good habits and a messy one teaches them bad ones at scale. Keeping things boring is how we get to keep using agents without losing control of the codebase.

## 11. Check every diff, and sweep the whole codebase

Every diff gets reviewed as it comes in, but some problems only show up across many diffs, like dead code, the same logic in three places, or two modules that slowly grew into each other. So Nightshift also sweeps the codebase on a schedule, one narrow job at a time. A human approves its PRs like anyone else's, and rejected ideas get logged so they don't come back.

## 12. Small PRs, and deleting counts

Keep each PR to one change, because small diffs get read carefully and big ones get skimmed. And deleting code counts as progress, often the best kind.

---

Most of this is borrowed from John Ousterhout's _A Philosophy of Software Design_, which is worth reading in full.
