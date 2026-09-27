import dedent from "dedent";

/** Exported so the mock LLM can recognise a review prompt. */
export const REVIEW_INSTRUCTION = "Thoroughly review this script";

export const NO_FINDINGS = "NO FINDINGS";

export function reviewPrompt(script: string, format?: string): string {
	return dedent`
		${REVIEW_INSTRUCTION} against the given rules.${format ? ` It was intended as a ${format}, so judge it accordingly.` : ""}

		Judge only the script below. Metadata elements are outside the scope of this review.

		Read it as if you're watching a video generated from these prompts, then check it against those rules:
		- Format: only the elements that format allows, and the startFrame, continuity,
		  trimToDialogue and loop rules stated with it.
		- Each tag element, attribute and value as outlined by their rules.
		- Video prompts: every requirement of that section, in every video prompt.
		- Language: each part of the script in the language that section assigns it.

		Then judge what those rules cannot state, reading the script whole:
		- Continuity: characters, place, light and props hold from one visual to the next, and
		  each video's startFrame and continuity match what its pictures actually do.
		- Dialogue: everyday words, idiomatic to the format, true to who says it and to what just
		  happened. It should be appropriate, simple, and make perfect sense in its context.
		- Pacing and beats: the video progresses at a natural speed, with no sudden awkward cuts or overly dragged out scenes.
		- Prompts: all prompts are clear, specific, and give the model enough information to generate the intended visuals and audio.

		Work through every scene and give each element a single finding.

		Write each finding as one bullet, three fields in this order:

		- <element id> | <the rule it breaks> | <the smallest change that fixes it>

		Copy the id from that element's id attribute exactly. Name the rule concisely based on the section it comes from.
		Say what to change, not what is wrong, and keep the bullet to one line:

		- kM2pQ7rT9wXz4bNc | Format: trimToDialogue | set trimToDialogue="false", because the next video continues from it
		- V1StGXR8_Z5jdHi6 | Continuity: props | Red's basket is missing; put it back in her hands

		When nothing breaks a rule, reply with exactly ${NO_FINDINGS} and nothing else.

		<script>
		${script}
		</script>
	`;
}
