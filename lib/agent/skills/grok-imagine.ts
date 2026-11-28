import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

// Based on https://docs.x.ai/developers/model-capabilities/images/prompting-guide and https://runware.ai/docs/models/xai-grok-imagine-image-2-0/guides/prompting.md
export const grokImagine = {
	name: "grok-imagine",
	description:
		"Quirks of the Grok Imagine image model (2.0). Load it before writing <image> prompts for it.",
	content: dedent`
		- Open with the subject. A prompt that starts with mood, film stock or exclusions gets a styled scene with a stand-in subject.
		- Never list what to leave out. Long negative lists get ignored and can even add what they exclude, so describe what you want instead.
		- "Underexposed" and "crushed shadows" darken the whole image, and asking for grain, dust, scratches or fringing renders them as defects.
		- Describe each texture once, on its own surface. A texture word said twice lands on the wrong object.
	`,
} as const satisfies Skill;
