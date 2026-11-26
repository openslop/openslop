import { dedent } from "@/lib/dedent";
import { NO_FRAME, START_FRAME_ATTR } from "@/lib/connectors/video/start-frame";
import type { Skill } from "./registry";

export const animateImage = {
	name: "animate-image",
	description:
		"Turning an image into a video that starts from it. Load it with osml, video-formats and video-prompts when the user asks to animate an image.",
	content: dedent`
		- Work out what the image shows and what it means in the story. Read the scenes around it and the speech over it, and look at it with view_result.
		- If the image has a picture, set the video's ${START_FRAME_ATTR} to its URL. If not, use ${START_FRAME_ATTR}="${NO_FRAME}".
		- Write a video prompt that starts on what the image shows and moves the way the story needs.
		- Set the duration and other video settings to fit the story.
		- In one edit_script call, insert the video before the image and remove the image.
	`,
} as const satisfies Skill;
