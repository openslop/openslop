# Philosophy

Why we write code the way we do. [CONVENTIONS.md](CONVENTIONS.md) is the what. This is the why.

## 01. Writing is cheap. Review isn't.

An agent writes a thousand lines before your coffee cools. Someone still has to read them. The bottleneck isn't writing code anymore. It's reviewing it well.

## 02. Mud is the default

Left alone, every codebase turns into a big ball of mud. Agents just get there faster. Merging unreviewed agent code is the quickest way to kill a project that we know of.

## 03. Agents don't know what we know

They don't know the business, which changes every week. Or why a boundary sits where it does. Or how a user actually moves through the editor. Or what the next person needs to understand. We do.

## 04. A human understands every line

Agents write and comment. People approve. If you can't explain a line, don't ship it. "The agent wrote it" isn't a reason.

## 05. Strategic, not tactical

Tactical code gets this feature working today. Strategic code keeps the next ten changes cheap. Tactical feels faster. Then it stalls. Agents are tactical by default.

## 06. Complexity is incremental

No single PR ruins a codebase. One flag, one copied helper, one extra `if`. Each is reasonable. Together they're the mud. So we say no to "just this once."

## 07. Three symptoms

Change amplification: one change, many files. Cognitive load: too much to hold in your head. Unknown unknowns: you can't see what will break. Every rule we have exists to keep one of these down.

## 08. Deep, not shallow

A simple interface with a lot of work behind it. Pull complexity down so callers don't carry it. If one decision lives in two places, it leaks.

## 09. Written rules > taste

Rules in someone's head don't get followed, by people or agents. "This breaks rule X" is a short review. "I don't like this" is a long one. Our nightly bot, [Nightshift](https://github.com/openslop/nightshift), shows it: jobs that follow written rules get approved over 90% of the time. Open-ended ones, under 50%.

## 10. Boring on purpose

One obvious way to do each thing. Boring code is easy to review, easy to delete, and easy to copy right. Agents copy whatever they see, so give them something good to copy. That's how we keep using them without losing the codebase.

## 11. Small PRs, every time

One change per PR. Small diffs get read. Big ones get skimmed.

## 12. Deleting is progress

The best PR often removes more than it adds.

---

Most of this comes from John Ousterhout's _A Philosophy of Software Design_. Read it.
