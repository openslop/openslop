import { dedent } from "@/lib/dedent";
import { nameRef } from "@/lib/connectors/name-refs";
import type { Skill } from "./registry";

// Based on ByteDance's Seedance prompt guides: https://docs.volcengine.com/docs/ark/seedance-2-0-prompt-guide and https://docs.volcengine.com/docs/ark/seedance-2-5-prompt-guide (English copies on docs.byteplus.com/en/docs/ModelArk)
export const seedance = {
	name: "seedance",
	description:
		"How Seedance video models (2 Fast, 2.5) read a <video> prompt: shot order, one camera move per shot, slow clear motion, emotion through the body.",
	content: dedent`
		Seedance follows numbered shots in story order. Write the prompt as video-prompts says, with these additions:

		- Never give a shot a time range like "0-3s". Seedance doesn't keep exact timings, and forcing them can break the clip. Number the shots and let the length follow.
		- Write each shot in this order: the camera move or transition, then each character's action and expression, then the place or any change in it, then the sound.
		- Use one camera move per shot. Two moves in one shot make the picture unstable. The moves Seedance knows: push in, pull out, pan, tilt, track, orbit, follow, rise, lower, zoom, at a wide, medium or close-up size.
		- Make motion specific, slow and continuous: which body part, how far, how fast, how hard, like "slowly raises a hand" or "tilts the head slightly". Avoid sprints, big jumps and rolls.
		- Write how one action flows into the next, like "turning, then raising a hand with the momentum".
		- Show feeling through the body, not the word: not "sad" but "head down, shoulders trembling, eyes reddening".
		- Give every shot its sound.
		- Keep writing ${nameRef("Name")}. OpenSlop turns each into Seedance's own image reference and attaches the character's voice, so never write @Image tags or describe a voice yourself.

		Seedance 2.5 makes long clips in one go, so a longer scene can stay one video. The same rules apply.
	`,
} as const satisfies Skill;
