import { dedent } from "@/lib/dedent";
import { NO_FRAME, START_FRAME_ATTR } from "@/lib/connectors/video/start-frame";
import type { Skill } from "./registry";

export const animateImage = {
	name: "animate-image",
	description:
		"Turning an <image> into a <video> that opens on that picture and brings it to life. Load it with osml and video-prompts when the user asks to animate an image.",
	content: dedent`
		## Start frame
		Look at the image with view_result. If it has a picture, set the video's ${START_FRAME_ATTR} to that picture's URL so the video opens on it. If it has none, use ${START_FRAME_ATTR}="${NO_FRAME}" and write the video from the image's prompt.

		## Video prompt
		- Shot 1 opens on exactly what the image shows: the same place, framing, light, characters and poses. Describe it from the image's prompt and, when there is a picture, from what you see in it.
		- Then add the movement a still can't show: one clear action and expression per character, and what moves around them, like hair, cloth, water, smoke or light.
		- Turn the image's motion into the camera move, like a slow push-in for kenBurnsIn.
		- Use one shot for a quiet moment. Add a second only when the speech under it describes an action.
		- Keep the speech in its own elements and keep every {{Name}}. Add a Sound line for what the scene sounds like.

		## The edit
		One edit_script call: insert the video before the image, then remove the image.
	`,
} as const satisfies Skill;
