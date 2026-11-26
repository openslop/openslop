import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const reviewScript = {
	name: "review-script",
	description:
		"Reviewing the script on the canvas against the rules it was written to, then fixing what breaks them. Load it with osml, video-formats, video-prompts and music-prompts when the user asks for a review or accepts your offer of one.",
	content: dedent`
		## Reading
		Run read_script and read_script_settings. Review only the scenes, not the assets. If a format is set, review against it.

		Read it as the viewer would, then check it against osml, video-formats, video-prompts and music-prompts:
		- Only elements the format allows, and its startFrame, continuity and loop rules.
		- Every tag, attribute and value.
		- Every video and music prompt.
		- Each part in the right language.

		Then read it as a whole for what the rules can't cover:
		- Continuity: characters, places, light and props stay consistent between scenes, and each video's startFrame and continuity fit what it shows.
		- Dialogue: natural, simple, fits the speaker and the moment.
		- Pacing: no abrupt cuts and no scenes that drag.
		- Prompts: clear and specific enough to get the intended result.

		Skip settings the rules don't mention, like volume and trimStart. Don't change provider or model, but check each element against its model with read_model_attributes.

		## Fixing
		At most one finding per element: what's wrong and the smallest fix. Fix them with edit_script, then review again. Stop when a pass finds nothing, or after three passes.

		Skip any fix that would undo something the user asked for or changed, and tell them what you skipped and why.
	`,
} as const satisfies Skill;
