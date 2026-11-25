import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const editScript = {
	name: "edit-script",
	description:
		"Changing a script already on the canvas with edit_script, from one word to a rewrite: fewest operations, animating images, swapping models. Load it with osml, and video-prompts or music-prompts when you write those prompts.",
	content: dedent`
		Every change to a script already on the canvas, however large, goes through edit_script. write_script would throw the rest of the script away.

		- Read the script with read_script before your first edit, and reference only ids you read.
		- Send the fewest operations that do the job.
		- Write each part in the language the osml skill assigns it, whatever language the request is in.
		- To animate an image, insert a video that starts from it before the image, then remove the image.
		- Before setting an attribute that depends on the model, like duration, or switching an element's model, check what that model allows with read_model_attributes.
	`,
} as const satisfies Skill;
