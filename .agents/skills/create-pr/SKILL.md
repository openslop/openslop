---
name: create-pr
description: >
  Commit all changes and create a GitHub PR. Ensures you're on a feature branch,
  stages everything, commits with a concise message, pushes, and opens the PR.
---

# Create PR

Commit all current changes and open a GitHub pull request.

## Steps

### 1. Ensure feature branch

- Run `git branch --show-current` to get the current branch.
- If the branch is `main` or `master`, create and switch to a new branch:
  - Derive a short kebab-case name from the staged changes (2-4 words max).
  - Branch name format: `$USER/<feature-name>` (use the system `$USER` env var).
  - Run `git checkout -b $USER/<feature-name>`.

### 2. Squash existing commits (if any)

- Run `git fetch origin` first. Squash against `origin/master`, not the local
  `master` ref, which is often stale. Resetting onto a stale base silently pulls
  other people's commits into yours.
- Run `git log --oneline origin/master..HEAD` to check for existing commits on the branch.
- If there are commits ahead, note the current HEAD sha, then soft-reset so all
  changes become staged: `git reset --soft origin/master`
- Confirm nothing was lost before continuing: `git diff --cached <that sha>` should
  be empty (or show only your uncommitted work). The reset is recoverable via
  `git reflog` if it is not.
- This ensures everything (previous commits + uncommitted work) goes into a single commit.

### 3. Stage and commit

- Run `git add -A` to stage all changes.
- Run `git diff --cached --stat` and `git diff --cached` to understand what changed.
- Write a single commit message following these rules:

#### Commit message rules

Follow the spirit of https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/commit-messages/.

- **Subject line**: `<type>: <subject>`. Imperative, lowercase after the prefix, no
  period, ~50-72 chars. Make it distinguishable from other commits.
  - Types in use here: `feat`, `fix`, `refactor`, `perf`, `chore`, `docs`. No scopes.
  - The subject doubles as the PR title. GitHub appends `(#NNN)` on squash-merge, so
    never write a PR number yourself.
- **Body**: skip it only when the subject genuinely says it all. Otherwise explain
  *why*, in full sentences. For anything non-trivial that means naming what was
  wrong before and what the change makes true instead. Several paragraphs is
  normal and matches the repo's history. Do not pad a trivial change to reach it.
- Mention what changed from the user's perspective first, implementation details second.
- If there are known side effects or things the change does NOT do, say so briefly.
- Reference an issue with a `Closes #NNN` line when the change resolves one.
- No emoji, plain text, no markdown.

Example good messages:
```
fix: keep enum attribute editors visible when the key is absent
```

```
refactor: stop smuggling the tag name into OSML attributes

parseXmlTag returned one flat Record where the element type shared a
namespace with the parsed attributes, so callers had to know to pull
`tag` back out, and an OSML tag carrying a literal `tag="..."` attribute
would silently become that element type instead.

Return `{ tag, attributes }` so the two can't collide.
```

- Commit using a HEREDOC to preserve formatting:
```bash
git commit -m "$(cat <<'EOF'
<message here>
EOF
)"
```

### 4. Push and create PR

- Push the branch: `git push -u origin HEAD --force-with-lease`
  - Force push is expected here because step 2 rewrites history via squash.
- Create the PR with `gh pr create`:
  - **Title**: same as the commit subject line.
  - **Body**: use this template:
    ```
    ## Summary
    <1-3 bullet points describing changes>

    ## Test plan
    <brief checklist of how to verify>
    ```
- Return the PR URL to the user.
