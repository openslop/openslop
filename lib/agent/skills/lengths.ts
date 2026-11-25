import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const lengths = {
	name: "lengths",
	description:
		"How long speech, visuals and the whole video run, and fitting a script to a target length. Load it when the user asks about length or timing, or to lengthen or shorten a script.",
	content: dedent`
		- Never guess how long speech runs. estimate_speech_lengths estimates each line's length from its words, and estimate_total_length how long the whole video runs against the target length.
		- To hit a target, add or cut speech with edit_script, then estimate again.
		- A video's duration follows its speech: fit_durations sets it, so change the speech, not the duration.
	`,
} as const satisfies Skill;
