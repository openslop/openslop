import dedent from "dedent";

/** The instruction the review opens with, so the mock can recognise its own prompt. */
export const REVIEW_INSTRUCTION = "Thoroughly review this OSML script";

/** What a clean review replies, so the caller knows there is nothing left to fix. */
export const NO_FINDINGS = "NO FINDINGS";

/**
 * A second reader for a script, given the rules it was written to rather than a
 * summary of them: restating a rule here is how the two drift apart.
 */
export function reviewPrompt(script: string, format?: string): string {
	return dedent`
	  ${REVIEW_INSTRUCTION} against the given rules.${format ? ` It was intended as a ${format}, so judge it accordingly.` : ""}

	  Judge only the OSML below. The title, art style, narrator and characters reach it as
	  project settings rather than as tags inside it, so never report a metadata tag as
	  missing or wrong, whatever the Order section says about them.

	  Read it as if you're watching a video generated from these prompts, then check it against those rules section
	  by section:
	  - Format: only the elements that format allows, and the startFrame, continuity,
	    trimToDialogue and loop rules stated with it.
	  - Order, Speech, <image>, <video>, <sound> and <music>: every tag, attribute and value
	    as those sections define them.
	  - Video prompts: every requirement of that section, in every video prompt.
	  - Language: each part of the script in the language that section assigns it.
	  - Art Style, Narration Voice and Characters: honoured exactly as given.

	  Then judge what those rules cannot state, reading the script whole:
	  - Continuity: characters, place, light and props hold from one visual to the next, and
	    each video's startFrame and continuity match what its pictures actually do.
	  - Dialogue: everyday words, one thought per line, true to who says it and to what just
	    happened. It should be appropriate, simple, and make perfect sense in its context even to a 5-year old.
	  - Pacing and beats: the video progresses at a natural speed, with no sudden awkward cuts or overly dragged out scenes.

	  Work through every scene to the last one, however long the script runs, and give any one
	  element a single finding.

	  Write each finding as one bullet, three fields in this order:

	  - <element id> — <the rule it breaks> — <the smallest change that fixes it>

	  Copy the id from that element's id attribute; never invent one. Name the rule in a few
	  words, after the section it comes from. Say what to change, not what is wrong, and keep
	  the bullet to one line:

	  - kM2pQ7rT9wXz4bNc — Format: trimToDialogue — set trimToDialogue="false", because the next video continues from it
	  - V1StGXR8_Z5jdHi6 — Continuity: props — Red's basket is missing; put it back in her hands

	  When nothing breaks a rule, reply with exactly ${NO_FINDINGS} and nothing else.

	  <script>
	  ${script}
	  </script>
	`;
}
