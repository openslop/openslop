import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { ContentTypeSchema } from "@/lib/canvas/types";
import {
	PREVIOUS_VISUAL,
	START_FRAME_ATTR,
} from "@/lib/connectors/video/start-frame";
import { CHARACTER_REFS_RULE } from "@/lib/script/prompt/character-refs";
import { MUSIC_PROMPT_FORMAT } from "@/lib/script/prompt/music-prompt";
import { VIDEO_PROMPT_FORMAT } from "@/lib/script/prompt/video-prompt";
import { refineOpSchema } from "@/lib/script/refine/types";
import { Pencil } from "@/components/ui/icon";
import compact from "lodash/compact";
import { plural } from "@/lib/format";
import { defineTool } from "./define-tool";

const ASSETS = dedent`
	A character is the asset_avatar and asset_voice sharing a \`name\`: the exact name their
	lines and every {{Name}} in a prompt use, which never changes. A character has either or both.
	- asset_avatar: what a character looks like, as its text, written like an image
	  prompt. Their avatar is drawn from it, and every visual that names them is drawn from that
	  avatar.
	- asset_voice: how a speaker sounds, as its attributes and no text. A voice is described by
	  its traits, or pinned by a pickedVoiceId you read; always set its language to the one its
	  lines are in. A narrator, for example, is just a voice with no avatar.
	- asset_style: the art style every visual is drawn in, as its text: the medium,
	  linework, colors and lighting. Never a place, setting, subject or time of day.
	- asset_references: the images every visual is drawn after, usually the user's uploads.
	- asset_media_<type>: the user's Media panel drafts. Ignore them for now.
`;

export const editScript = defineTool({
	description: dedent`
	  Change the canvas: add, remove, rewrite or reorder the script's elements, and
	  set up the assets it draws on. Reference ids you read; never invent one.

	  - insert: place new \`elements\` before or after \`anchor_id\`, in the order you list them.
	    Omit \`anchor_id\` to append, or to prepend with position "before". To add several
	    elements in a row, send them as one insert: you cannot anchor on an element this call adds.
	  - asset: create an asset, or update the one with the same \`type\` and \`name\`. Assets sit
	    outside the script, so they take no anchor.
	  - remove: delete the element with \`id\`.
	  - move: move the element with \`id\` before or after \`anchor_id\`, or to the start or end
	    as insert does. It keeps its id, attributes and result.
	  - set: change an element. Send only what changes, and the full replacement \`text\` when
	    text changes. Set an attribute to null to drop it.

	  To change an element's type, insert the new one before it, then remove it: that is a
	  new, ungenerated element holding only what you send. To animate an image,
	  insert a video that starts from it before the image, then remove the image.

	  Script types: ${ContentTypeSchema.options.join(", ")}

	  ${ASSETS}

	  A video's ${START_FRAME_ATTR} URL is an image's or frame's URL from view_result, and
	  ${PREVIOUS_VISUAL} opens on the visual before it. Leave a URL already set alone.

	  To change a model, set provider and model to a pair from list_models. A speech element
	  speaks on the model of the asset_voice its \`name\` names, so it always needs one.

	  ${CHARACTER_REFS_RULE}

	  ${VIDEO_PROMPT_FORMAT}

	  ${MUSIC_PROMPT_FORMAT}

	  Send the fewest operations that do the job. Write element text in the language of the
	  surrounding script, whatever language the request is in. Every other element's prompt, and
	  avatar and style text, are always in English, except speech quoted inside a video prompt and
	  the lyrics in a music prompt.
	`,
	input: z.object({
		ops: z
			.array(refineOpSchema)
			.min(1)
			.describe("Operations to apply, in order."),
	}),
	output: z.string(),
	icon: Pencil,
	label: ({ ops }) => {
		const count = ops?.length ?? 0;
		return `Editing the script (${count} ${plural(count, "change")})`;
	},
	execute: async ({ ops }, ctx) => {
		if (!ctx.isScriptReadCurrent())
			throw new Error(
				"The script has been modified since read, either by the user or by a tool. Read it again before attempting to edit it.",
			);
		const { applied, failures, inserted } = ctx.editScript(ops);
		return compact([
			failures.length === 0
				? `Applied ${applied} ${plural(applied, "operation")}.`
				: `Applied ${applied} of ${ops.length} operations.`,
			inserted.length > 0 && `Inserted ${inserted.join(", ")}, in order.`,
			failures.length > 0 &&
				`Failed: ${failures.join("; ")}. Read the script before retrying.`,
		]).join(" ");
	},
	draftsScript: true,
});
