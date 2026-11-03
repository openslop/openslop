# Philosophy

Why we write code the way we do here.

**We don't want OpenSlop to turn into a big ball of mud.**

Writing code is cheaper than it's ever been. An agent can write a thousand lines before you finish your coffee. Reading those lines, understanding them, and deciding if they belong is not any cheaper. So the bottleneck has moved. It's not writing anymore. It's good review.

That changes what kills a project. It used to be running out of people to write code. Now it's code piling up faster than anyone can understand it. Merging a pile of unreviewed, agent-written code is the fastest way we know to kill a codebase today.

Agents are great, and we use them every day. But they don't hold the full picture. They don't know the business context, which keeps changing. They don't know why a module boundary sits where it does, how a user actually moves through the editor, or what the next person will need to understand when they open the file. Each change looks fine on its own. The damage only shows up across a hundred of them.

[CONVENTIONS.md](CONVENTIONS.md) is the what. This doc is the why. There are eight principles that govern how we work:

1. _Review is the bottleneck, so we write for the reviewer._ Code gets written once and read many times, and now it gets written by agents faster than ever. Every choice should make the next review faster: small diffs, one change per PR, one obvious way to do things. If a PR takes an hour to understand, it's too big or too clever, even if it works.

2. _A human understands every line that lands._ An agent can write the code and leave review comments. Only a person approves. Whoever approves a PR should be able to explain it, and the author should have read their own diff first. "The agent wrote it" isn't an answer to "why is it like this?" People are the ones who connect the code to the users and the business, and that context lives in our heads, not in the repo.

3. _Be strategic, not tactical._ This comes from John Ousterhout's _A Philosophy of Software Design_. Tactical programming means getting this feature working right now. Strategic programming means spending a bit more time so the next ten changes stay cheap. Tactical is faster at first, then it stalls. Agents are tactical by default, and they write a lot of code, so a team that only works tactically gets to the mud a lot sooner.

4. _Complexity creeps in one shortcut at a time._ No single PR makes a codebase hard to work in. It's the one-off flag, the copied helper, the extra `if` for one caller, each one small and reasonable. Ousterhout calls this out directly: complexity is incremental. So we say no to each small shortcut, even when it's "just this once."

5. _Watch for the three symptoms._ Ousterhout names three signs that code is getting too complex. **Change amplification**: one simple change has to touch many files. **Cognitive load**: you have to hold too much in your head to make a change safely. **Unknown unknowns**: it's not even clear what you need to change, because something is coupled in a way you can't see. Most of our rules exist to keep one of these three down.

6. _Deep modules, nothing leaks._ A good module has a simple interface and does a lot behind it. A shallow module has an interface almost as complicated as what it does, so it hides nothing. We pull complexity down into the module so callers don't have to deal with it. When the same design decision shows up in two places (Ousterhout calls this information leakage), the next change will have to find both.

7. _Write the rules down._ Rules that live in someone's head don't get followed, by people or by agents. Written rules make review faster, because "this breaks rule X" is a quick conversation and "I don't like this" is a long one. They also make agents a lot better. Our nightly bot, [Nightshift](https://github.com/openslop/nightshift), has opened over 500 PRs here since March 2026. Jobs that follow written rules, like conventions and readability, get approved over 90% of the time. Open-ended jobs, like "go find bugs," land under 50%.

8. _Keep it boring._ Simple, flat, declarative code that reads like config. One canonical way to build each thing. Popular libraries over hand-rolled ones. Boring code is easy to review, easy to delete, and easy for the next person (or agent) to copy correctly. Clever code gets copied wrong.

None of this is about being anti-agent. It's the opposite. Agents copy whatever patterns they find. A clean, consistent codebase teaches them good habits, and a messy one teaches them bad ones, at scale. Keeping the codebase simple is how we get to keep using agents without losing control of it.

Each diff gets checked when it comes in, but some problems only show up across many diffs: dead code, the same logic in three places, two modules that slowly grew into each other. So we also sweep the whole codebase on a schedule. The nightly bot runs one narrow job at a time and opens a PR. Same as everyone else's, a human approves it or it doesn't land, and rejected ideas get logged so they don't come back.

## Why CONVENTIONS.md is so strict

CONVENTIONS.md says it's "deliberately rigid and opinionated." That's on purpose. Every rule there is a strong default that keeps review fast and one of the three symptoms down. Here's the reasoning behind the big ones.

- **One canonical way to build each feature.** If there are two ways to do something, every reviewer has to check which one you picked and why, and every agent picks one at random. One way means less to think about (cognitive load) and fewer surprises.
- **No special-case, one-off wiring.** One-offs are where complexity creeps in. Each one is small, and together they're the mud. If a feature needs special wiring, that's a sign the design should change so it fits what's already there.
- **Prefer deep modules, keep handlers thin.** Straight from Ousterhout. Complexity pushed down into a module is handled once. Complexity left in the callers gets handled everywhere, and changes ripple out (change amplification).
- **Separate policy from mechanism.** Low-level helpers that don't have opinions can be reused anywhere. The opinions live in one place up top, so changing a decision is one edit, not a hunt.
- **Grow out, not down.** Adding a sister module is easy to review. Adding another layer of nesting hides bugs and makes every reader dig.
- **Wait for the third use before extracting.** The wrong abstraction is worse than a little duplication (Sandi Metz). Agents love to abstract early, and a bad shared helper couples things that shouldn't be coupled (unknown unknowns).
- **Nothing leaks, dependencies point one way.** `lib/` never imports from `app/`, and imports never cycle. When coupling is visible and one-directional, you can see what a change will break. Hidden coupling is exactly what unknown unknowns are.
- **Define errors out of existence, fail loudly.** Another Ousterhout idea. Design the API so the bad case can't happen. When something unexpected does happen, throw. Swallowed errors are bugs nobody sees until a user does.
- **Parse, don't validate.** Check outside input once, at the edge, then trust the types. Otherwise every function re-checks the same thing in a slightly different way.
- **Comments are a smell.** If code needs a comment to make sense, a better name, type, or structure usually does the job and can't go stale. History goes in the commit message, not the file.
- **Use what's in the stack before adding a dependency.** Every new library is something else for reviewers and agents to learn. Next.js, React, Remotion, Zustand, and Supabase already do a lot.
- **Lint-enforced where we can.** A rule a machine checks is a rule nobody has to argue about in review.

## What this means when you open a PR

- Agent-written code is welcome. The bar is the same as for everything else.
- Read your own diff before you push. If you can't explain a line, don't send it.
- Keep it small. One change per PR. Smaller PRs get reviewed faster and more carefully.
- Fit what's there. If the conventions get in your way, open an issue and let's talk about changing the rule, rather than working around it.
- Deleting code counts as progress. Often it's the best kind.

If you want to go deeper, read _A Philosophy of Software Design_ by John Ousterhout. Most of this doc is borrowed from it.

_The OpenSlop maintainers_
