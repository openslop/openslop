import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const editScript = {
	name: "edit-script",
	description:
		"Making any change to a script already on the canvas with edit_script. Load it with osml, and video-prompts or music-prompts when you write those prompts.",
	content: dedent`
		- Use as few operations as you can.
		- To animate an image, insert a video before it that starts from it, then remove the image.
	`,
} as const satisfies Skill;
