---
name: openslop-update
description: >
  Draft and post the OpenSlop product update in the Discord #✨-whats-new channel.
  Reads the last post for style, pulls the merged PRs on GitHub since that post,
  writes the five-line update in the house voice from the user's point of view,
  types it into the Discord message box via browser-harness, and only sends after
  the user says "post it". Use when asked to "make an openslop update", "draft the
  whats-new post", "write the discord update", or "post an update to discord".
---

# OpenSlop update

Runs the whole loop: read Discord, read GitHub, draft, type into Discord, wait, post,
verify. Follow every step. Do not skip the verification screenshots.

## Fixed facts

| Thing | Value |
| --- | --- |
| Discord channel URL | `https://discord.com/channels/1468342425704726691/1508161357328154675` |
| Channel name | `#✨-whats-new` in the OpenSlop server |
| Feedback channel mention | typed as `#🗣️-feedback`, Discord resolves it into a channel pill |
| Posting account | tcbrah (the user's Discord account, already logged in) |
| GitHub repo | `openslop/openslop`, default branch `master` |
| Browser tool | `browser-harness` heredoc form, on the user's running Chrome |
| Hosted video model name | `Slop Video v1 Fast` is Kling 3 Turbo on the hosted key |

## Step 1. Find or open the Discord tab

Never `goto_url`, it navigates whatever tab the user is looking at. Look for an existing
tab on the channel first and reuse it. If none exists, open a new one, wait for it to
load, and use its target id for every later step.

```bash
browser-harness <<'PY'
CHANNEL = "https://discord.com/channels/1468342425704726691/1508161357328154675"
target = next((t['targetId'] for t in list_tabs() if '1508161357328154675' in t['url']), None)
if target:
    switch_tab(target)
else:
    new_tab(CHANNEL)
    wait_for_load()
    wait(3)
    target = current_tab()['targetId']
print(target)
PY
```

After opening a fresh tab, take a screenshot and check the channel actually rendered
messages. If Discord shows a login page, stop and ask the user to log in; do not type
credentials. If it opened on a different channel or the server picker, wait a few more
seconds and re-screenshot before proceeding. Scroll the message list to the bottom so
the newest post is rendered before Step 2.

## Step 2. Read the last posts

Extract every message currently rendered, with timestamps and author. The newest
post by tcbrah is the "last update". Its `datetime` is the cutoff for GitHub.

```bash
browser-harness <<'PY'
switch_tab('<TARGET_ID>')
print(js("""
(() => [...document.querySelectorAll('[id^="chat-messages-"]')].map(m => {
  const ts = m.querySelector('time')?.getAttribute('datetime') || '';
  const author = m.querySelector('[class*="username"]')?.textContent || '';
  const body = m.querySelector('[id^="message-content-"]')?.innerText || '';
  return `=== ${ts} ${author}\\n${body}`;
}).join('\\n\\n'))()
"""))
PY
```

Also dump the last post's HTML with emoji `img` tags replaced by their `alt` so you see
the exact emoji and bold markers. Match them precisely.

Replies from other members under the posts are user feedback. Read them. If one maps
to a merged change, frame that bullet as a direct answer to it.

## Step 3. Pull what merged since the last post

Use the last post's ISO timestamp as the cutoff. Read PR bodies, not just titles.

```bash
git fetch -q origin master
git log origin/master --since="<ISO>" --format='%h %ad %s' --date=iso
gh pr list --state merged --search "merged:>=<ISO>" --json number,title,mergedAt,body --limit 50
gh pr view <n> --json body -q .body   # for each user-facing PR
```

Keep only user-facing changes. Drop anything internal: nightly conventions sweeps,
maintainability refactors, architecture rethinks, security lockfile audits, docs,
test-only PRs. If a PR is user-facing but not yet deployed to app.openslop.ai, say so
in the final message so the user can decide to hold it.

## Step 4. Draft in the house format

Exact shape. Five lines after the header, one blank line after the header, no blank
lines between bullets, no trailing period on bullets.

```
🍝 **OpenSlop Update**

🚀 **New**: ...
✨ **Better**: ...
🐛 **Fixed**: ...
🧪 **Try it**: ...
💬 **Tell us what broke**: 💬｜Let us know in the #🗣️-feedback channel
```

The last line is verbatim every time, including the fullwidth bar `｜` after the second
speech balloon. The `Try it` line is one concrete action the reader can do right now in
the app, phrased as an instruction ("Create a new slop, ...", "Click on ...").

### Voice rules (from the user, non-negotiable)

- Write from the user's point of view. Say what is in it for them, not what we built.
- Simple enough for a five year old and for readers with weak English. Short
  sentences. Common words. One idea per sentence.
- Frame each bullet as a direct answer to feedback. Think about why the change was
  made, name the pain the reader felt, then say what changed. Pattern:
  "Did you get a `<error>` when doing X? Try Y." or "Z used to happen. Now we do W."
- Use the exact error text users saw, not the internal cause. Example: the dropped
  poll fix is described as the `Failed to fetch` error from bad wifi, not as "poll
  retry". The moderation error is described as `content flagged` when animating a
  photo of a real person, and the answer is `Slop Video v1 Fast`.
- Sloppy bullets: say what Sloppy can now see or do for the reader, and give the
  literal thing to ask it in double quotes, e.g. ask Sloppy "what went wrong?".
- Backticks around anything that is an identifier: model names, error strings, UI
  labels a user would copy. Things a person says to Sloppy stay in double quotes.
- No em dashes. No exclamation-heavy hype. No internal names like PR numbers,
  connectors, gateway, poll, Lambda, Remotion.
- Multiple fixes can share the `Fixed` line as separate short sentences.

### Reference post (2026-09-06)

```
🍝 **OpenSlop Update**

🚀 **New**: Did you get a `content flagged` error when animating a photo of a real person? Try the new `Slop Video v1 Fast` model. It works with real people. You can also now set the resolution, loop, and volume on each clip
✨ **Better**: Sloppy can now see if an element is done, stale, or failed. If something breaks, ask Sloppy "what went wrong?" and it will help you fix it
🐛 **Fixed**: Bad wifi used to give a `Failed to fetch` error and stop your generation. Now we keep going. 4K exports also no longer time out
🧪 **Try it**: Animate a photo of a person with `Slop Video v1 Fast`, then ask Sloppy "did everything generate?"
💬 **Tell us what broke**: 💬｜Let us know in the #🗣️-feedback channel
```

## Step 5. Type it into the message box, do not send

Focus the composer, clear it, insert the whole text in one `type_text` call with `\n`
between lines. One call with newlines gives single line breaks. Do NOT type line by line
with Shift+Enter: that produced double spacing between bullets.

```bash
browser-harness <<'PY'
switch_tab('<TARGET_ID>')
js("""(() => { document.querySelector('[role="textbox"][data-slate-editor="true"]').focus(); return true; })()""")
sel = {"key": "a", "code": "KeyA", "modifiers": 2, "windowsVirtualKeyCode": 65, "nativeVirtualKeyCode": 65}
cdp("Input.dispatchKeyEvent", type="rawKeyDown", **sel)
cdp("Input.dispatchKeyEvent", type="keyUp", **sel)
d = {"key": "Delete", "code": "Delete", "windowsVirtualKeyCode": 46, "nativeVirtualKeyCode": 46}
cdp("Input.dispatchKeyEvent", type="rawKeyDown", **d)
cdp("Input.dispatchKeyEvent", type="keyUp", **d)
wait(0.3)
type_text("\n".join([
 "🍝 **OpenSlop Update**",
 "",
 "🚀 **New**: ...",
 "✨ **Better**: ...",
 "🐛 **Fixed**: ...",
 "🧪 **Try it**: ...",
 "💬 **Tell us what broke**: 💬｜Let us know in the #🗣️-feedback channel",
]))
wait(0.5)
capture_screenshot("<scratchpad>/discord.png")
PY
```

Use `cdp(method, **params)` keyword form. Passing a params dict positionally raises
`Message may have string 'sessionId' property`.

Read the screenshot. Check: header, one blank line, five compact bullets, the feedback
mention rendered as a channel pill, backticks rendering as inline code, cursor at the
end. Then show the user the draft text in a fenced block and stop. Do not press Enter.

## Step 6. Revise on request

Every revision is a full clear-and-retype of the composer using the Step 5 snippet, then a
fresh screenshot. Expect these rounds in this order, and apply them proactively on the
first draft so fewer rounds are needed:

1. Reword from the user's point of view, answering feedback, simple language.
2. Make it compact (single line breaks).
3. Make every point shorter and easier for non-native readers.
4. Backticks on model names and error strings.

## Step 7. Post only when told

Send only after the user explicitly says "post it" or "send it". Send with a real
Enter keyDown carrying `text: "\r"`:

```bash
browser-harness <<'PY'
switch_tab('<TARGET_ID>')
js("""(() => { document.querySelector('[role="textbox"][data-slate-editor="true"]').focus(); return true; })()""")
k = {"key": "Enter", "code": "Enter", "windowsVirtualKeyCode": 13, "nativeVirtualKeyCode": 13, "text": "\r"}
cdp("Input.dispatchKeyEvent", type="keyDown", **k)
cdp("Input.dispatchKeyEvent", type="keyUp", **{x: v for x, v in k.items() if x != "text"})
wait(2)
capture_screenshot("<scratchpad>/discord.png")
PY
```

Tell the user before sending that they should keep their hands off the keyboard for a
few seconds, since keystrokes typed while the harness holds focus land in the composer.

## Step 8. Verify, and edit if needed

Read the screenshot and the last message's `innerText`. Confirm the author, timestamp,
all five lines, and that the composer is empty. If the sent text has a defect, fix it in
place rather than reposting:

1. Clear the composer (select-all + Delete, rawKeyDown form).
2. Hover the last message (`Input.dispatchMouseEvent` mouseMoved over it), then
   `m.querySelector('[aria-label="Edit"]').click()` from JS.
3. The edit editor is the first `[data-slate-editor]`. Focus it, move the caret with a
   collapsed Range at the end, then `End` and `Backspace` as rawKeyDown events.
4. Save with the same Enter event as Step 7. Confirm the message shows "(edited)".

## Final message to the user

Lead with "Posted." or "Draft is in the box, not sent." Then the full post text in a
fenced block. Mention any user-facing PR you left out and why, and any change that
might not be deployed yet. Nothing else.
