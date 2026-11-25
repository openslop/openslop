import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const assets = {
	name: "assets",
	description:
		"The project's assets (characters, voices, locations, props, art style, reference images): what each holds, and setting them up before a script and from the user's uploads. Load it before adding or changing an asset.",
	content: dedent`
		Ahead of the scenes sit the project's assets, which every scene draws on. Set them with edit_script asset ops.

		A character is the asset_avatar and asset_voice sharing a \`name\`: the exact name their lines and every {{Name}} in a prompt use, which never changes. A character has either or both. Locations and props are named the same way, and no two characters, locations or props share a name.
		- asset_avatar: what a character looks like, as its text, written like an image prompt. Their avatar is drawn from it, and every visual that names them is drawn from that avatar.
		- asset_location: a place that recurs, as its text, written like an image prompt of the place with nobody in it. Every visual that names it is drawn from its image.
		- asset_prop: an object that recurs, as its text, written like an image prompt of the object alone. Every visual that names it is drawn from its image.
		- asset_voice: how a speaker sounds, as its attributes and no text. A voice is described by its traits, or pinned by a pickedVoiceId you read; always set its language to the one its lines are in. A narrator, for example, is just a voice with no avatar.
		- asset_style: the art style every visual is drawn in, as its text: the medium, linework, colors and lighting. Never a place, setting, subject or time of day.
		- asset_references: the images every visual is drawn after, usually the user's uploads.
		- asset_media_<type>: the user's Media panel drafts. Ignore them for now.

		## Before a new script
		A script is written against the assets already on the canvas, so put what it needs there first: an asset_voice for everyone who speaks (even if they only speak in video elements), an asset_avatar for every character a visual shows, an asset_location or asset_prop for every place or object more than one visual shows, and the art style. An asset the user already set stands.

		## From uploads
		- An uploaded asset_avatar looks like that image, not like its text. Look at it with view_result and set its text to what you see, unless the text already describes that exact image.
		- When there is no asset_style element, take the art style from what the user uploaded: the reference images first, otherwise an uploaded asset_avatar. Look with view_result, then insert the style in the same turn.
	`,
} as const satisfies Skill;
