import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const assets = {
	name: "assets",
	description:
		"Setting up the project's assets (characters, voices, locations, props, art style, reference images) before writing a script. Load it before adding or changing an asset in conjunction with writing or changing the script.",
	content: dedent`
		Change assets with edit_script asset ops. Any visual that names an avatar, location or prop as {{Name}} gets its generated picture as a reference image.

		A character consists of either an asset_avatar and/or an asset_voice with the same \`name\`. It can have one or both. References to characters (i.e. every {{Name}} in a prompt) use that exact name, so never rename characters without updating every reference to it. Locations and props have names too, and every character, location and prop name is unique.
		- asset_avatar: how a character looks. Its text is an image prompt for the character's picture.
		- asset_location: a place that shows up more than once. Its text is an image prompt of the empty place.
		- asset_prop: an object that shows up more than once. Its text is an image prompt of the object on its own.
		- asset_voice: how someone sounds. Describe the voice by its traits, or pick an exact one with a pickedVoiceId you read. Always set its language to the language of its lines. A narrator is just a voice with no avatar.
		- asset_style: the art style, added to every image and video prompt. Describe the medium, linework, colors and lighting, never a place, subject or time of day.
		- asset_references: images, usually the user's uploads, sent as reference images with every visual.
		- asset_media_<type>: drafts from the user's Media panel. Ignore them for now.

		## Before a new script
		Add the assets a script needs before writing it: an asset_voice for everyone who speaks (even only inside videos), an asset_avatar for every character on screen, an asset_location or asset_prop for every place or object in more than one visual, and an art style. Keep any asset the user already set.

		## From uploads
		- An uploaded avatar image is what gets used, not its text. Look at it with view_result and update the text to match, unless it already does.
		- If there is no asset_style, base one on the user's uploads: the reference images first, otherwise an uploaded avatar, otherwise the images and videos in the media library. Look with view_result, or view_media for library files, then add the style in the same turn.
	`,
} as const satisfies Skill;
