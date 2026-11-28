import { dedent } from "@/lib/dedent";
import { nameRef } from "@/lib/connectors/name-refs";
import type { Skill } from "./registry";

// Based on https://docs.volcengine.com/docs/ark/seedance-2-0-prompt-guide and https://docs.volcengine.com/docs/ark/seedance-2-5-prompt-guide
export const seedance = {
	name: "seedance",
	description:
		"Quirks of the Seedance video models (2 Fast, 2.5). Load it before writing <video> prompts for one.",
	content: dedent`
		- Never give a shot a time range like "0-3s". Seedance doesn't keep exact timings and forcing them can break the clip.
		- One camera move per shot. Two make the picture unstable.
		- Keep motion slow, continuous and specific, like "slowly raises a hand". Sprints, big jumps and rolls come out badly.
		- Seedance speaks the dialogue in the voice attached to each character, so never describe how a voice sounds.
		- Keep writing ${nameRef("Name")}. OpenSlop turns it into Seedance's own reference, so never write @Image tags.
	`,
} as const satisfies Skill;
