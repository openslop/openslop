import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const editScript = {
	name: "edit-script",
	description:
		"Changing a script already on the canvas with edit_script, from one word to a rewrite: fewest operations, animating images, swapping models. Load it with osml, and video-prompts or music-prompts when you write those prompts.",
	content: dedent`
		Use edit_script for every change to an existing script, however big. write_script replaces the whole script.

		- Run read_script before your first edit, and only use ids you read.
		- Use as few operations as you can.
		- Write each part in the language the osml skill gives it, whatever language the user writes in.
		- To animate an image, insert a video before it that starts from it, then remove the image.
		- Before changing a model, or a setting that depends on it like duration, check what the model allows with read_model_attributes.
	`,
} as const satisfies Skill;
