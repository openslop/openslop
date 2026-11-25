import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const lengths = {
	name: "lengths",
	description:
		"How long speech, visuals and the whole video run, and fitting a script to a target length. Load it when the user asks about length or timing, or to lengthen or shorten a script.",
	content: dedent`
		- Never guess lengths. estimate_speech_lengths gives each line's length, and estimate_total_length gives the whole video's length next to the target.
		- To hit a target, add or cut speech with edit_script, then estimate again.
		- fit_durations sets each video's duration from its speech, so change the speech, not the duration.
	`,
} as const satisfies Skill;
