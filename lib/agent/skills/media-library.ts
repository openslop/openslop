import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const mediaLibrary = {
	name: "media-library",
	description:
		"Using what the user uploaded to the media library: images as scenes, a song for a music video, a long video cut into clips, avatars. Load it before a first script when read_media shows uploads, or whenever the user asks to use their files.",
	content: dedent`
		Before your first script, look at what the user uploaded with read_media and view_media, and use your judgement on what to do with it. For example:
		- Images meant as exact scenes: put each one on its scene.
		- A song with lyrics for a music video: caption it with caption_media, read its word times with view_media, put it on a music element, and time the scenes to the words.
		- A long video to cut into clips: caption it with caption_media and read its word times with view_media, then put it on one video element per clip, with trimStart and trimEnd set to the seconds in the video where that clip starts and stops.
		- Avatars: put each one on the asset_avatar of the character it shows.
	`,
} as const satisfies Skill;
