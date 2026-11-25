import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const mediaLibrary = {
	name: "media-library",
	description:
		"Using what the user uploaded to the media library: images as scenes, a song for a music video, a long video cut into clips, avatars. Load it before a first script when read_media shows uploads, or whenever the user asks to use their files.",
	content: dedent`
		Before your first script, check the user's uploads with read_media and view_media and decide how to use them. For example:
		- Images meant as exact scenes: put each one on its scene.
		- A song for a music video: caption it with caption_media, get the word timings with view_media, put it on a music element, and time the scenes to the words.
		- A long video to cut into clips: caption it with caption_media and get the word timings with view_media. Then put it on one video element per clip, with trimStart and trimEnd set to where the clip starts and ends, in seconds.
		- Avatars: put each one on its character's asset_avatar.
	`,
} as const satisfies Skill;
