import { dedent } from "@/lib/dedent";
import { nameRef } from "@/lib/connectors/name-refs";
import type { Skill } from "./registry";

// Based on https://kling.ai/quickstart/klingai-video-3-omni-model-user-guide, https://kling.ai/quickstart/kling-4-model-user-guide and https://kling.ai/blog/kling-video-3-omni-reference-workflows-multi-element
export const klingOmni = {
	name: "kling-omni",
	description:
		"Quirks of the Kling Omni video models (3 Omni, 3 Omni Pro, 4 Omni). Load it before writing <video> prompts for one.",
	content: dedent`
		- Kling speaks the dialogue itself, in the voice that comes with each character's picture, so never describe how a voice sounds. Keep the speaker's face in frame.
		- Kling 3 Omni speaks only Chinese, English, Japanese, Korean and Spanish. Kling 4 Omni also speaks Portuguese, German, French and Hindi.
		- Keep writing ${nameRef("Name")}. OpenSlop turns it into Kling's own reference, so never write <<<element_N>>> or @Element tags.
		- Kling 4 Omni handles fast action well: tracking, orbiting and close-ups inside moving scenes.
	`,
} as const satisfies Skill;
