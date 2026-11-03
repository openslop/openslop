# AI Policy

Use AI tools as much as you like. Most of this codebase was written with them. What we don't take is code nobody has read. A person has to stand behind every PR, and that person needs to understand and be able to explain every line in it. [PHILOSOPHY.md](PHILOSOPHY.md) has the why.

## Rules

1. **You own it.** Every PR needs a human author who has read, run, and checked every changed line. "The agent wrote it" doesn't count as an explanation.
2. **Answer review yourself.** When a maintainer asks a question, answer it in your own words. Don't paste review comments into an LLM and paste its reply back without checking it. If you don't know the answer, say so, that's fine.
3. **Big stuff starts with an issue.** For new features, refactors, or anything that touches a lot of files, open an issue and agree on the approach before writing the code. See [CONTRIBUTING.md](CONTRIBUTING.md#before-you-start).
4. **Don't split to sneak past review.** One logical change goes in one PR. Breaking a big change into a bunch of small PRs to skip rule 3 will get them all closed.
5. **No unattended agent PRs.** PRs opened by a bot with no person behind them get closed. Our own nightly bot, [Nightshift](https://github.com/openslop/nightshift), is run by maintainers, and a maintainer reads and approves every PR it opens before it lands.
