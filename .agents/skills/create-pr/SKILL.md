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

- Run `git log --oneline master..HEAD` to check for existing commits on the branch.
- If there are commits ahead of master, soft-reset them so all changes become unstaged:
  - `git reset --soft master`
- This ensures everything (previous commits + uncommitted work) goes into a single commit.

### 3. Stage and commit

- Run `git add -A` to stage all changes.
- Run `git diff --cached --stat` and `git diff --cached` to understand what changed.
- Write a single commit message following these rules:

#### Commit message rules

Follow the spirit of https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/commit-messages/ but keep it casual and brief:

- **Subject line**: short, imperative, lowercase, no period. Describe the *what* in ~50 chars. Make it distinguishable from other commits.
- **Body** (optional, only if non-obvious): 1-3 short lines explaining *why*, not *what*. Use sentence fragments, imperfect grammar is fine. Skip if the subject says it all.
- Mention what changed from the user's perspective first, implementation details second.
- If there are known side effects or things the change does NOT do, mention briefly.
- No emoji, no conventional-commits prefixes (feat:, fix:, etc.), no ticket IDs unless the user mentions one.
- Plain text, no markdown.

Example good messages:
```
Add openslop provider for tts and music

Wires up the openslop client to call our own public api
for tts and music connectors. sfx still stubbed.
```

```
fix video polling returning wrong status
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
