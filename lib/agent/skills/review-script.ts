import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const reviewScript = {
	name: "review-script",
	description:
		"Reviewing the script on the canvas against the rules it was written to, then fixing what breaks them. Load it with osml, video-formats, video-prompts and music-prompts when the user asks for a review or accepts your offer of one.",
	content: dedent`
		Review only when the user explicitly asks for one or accepts your offer. Never just because you wrote or edited the script.

		## Reading
		read_script and read_script_settings. Judge only the scenes: the assets ahead of the first scene are outside the scope of the review. When a format is set, judge the script as that format.

		Read it as if you're the audience for what these prompts generate, then check it against the rules in osml, video-formats, video-prompts and music-prompts:
		- Format: only the elements that format allows, and its startFrame, continuity and loop rules.
		- Each tag, attribute and value as its rules outline.
		- Video and music prompts: every requirement of their skills, in every prompt.
		- Language: each part of the script in the language osml assigns it.

		Then judge what those rules cannot state, reading the script whole:
		- Continuity: characters, place, light and props hold from one scene to the next, and each video's startFrame and continuity match what its pictures actually do.
		- Dialogue: everyday words, idiomatic to the format, true to who says it and to what just happened. It should be appropriate, simple, and make perfect sense in its context.
		- Pacing and beats: the story moves at a natural speed, with no sudden awkward cuts or overly dragged out scenes.
		- Prompts: every prompt is clear, specific, and gives the model enough to generate the intended visuals and audio.

		Attributes the rules never mention, like volume and trimStart, are app settings and outside the review. Leave provider and model as they are, but check each element against what its model allows with read_model_attributes.

		## Fixing
		Give each element at most one finding: the rule it breaks and the smallest change that fixes it. Fix the findings with edit_script, then review again. Stop when a pass finds nothing, or after three passes.

		Skip a finding if fixing it would undo something the user asked for or changed themselves, and tell them which one you skipped and why.
	`,
} as const satisfies Skill;
