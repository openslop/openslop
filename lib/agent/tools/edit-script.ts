import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { NARRATOR } from "@/lib/canvas/assets";
import { attributeSchemaFor } from "@/lib/canvas/element-connector";
import {
	ContentTypeSchema,
	ElementTypeSchema,
	isMediaDraftType,
	NON_SPEECH_TYPES,
} from "@/lib/canvas/types";
import type { AttributeDef } from "@/lib/connectors/attributes/schema";
import {
	NO_FRAME,
	PREVIOUS_VISUAL,
	START_FRAME_ATTR,
} from "@/lib/connectors/video/start-frame";
import { CHARACTER_REFS_RULE } from "@/lib/script/prompt/character-refs";
import { MUSIC_PROMPT_FORMAT } from "@/lib/script/prompt/music-prompt";
import { VIDEO_PROMPT_FORMAT } from "@/lib/script/prompt/video-prompt";
import { refineOpSchema } from "@/lib/script/refine/types";
import { Pencil } from "@/components/ui/icon";
import { conjunction, plural } from "@/lib/format";
import { defineTool } from "./define-tool";

/** Attributes Sloppy can write by hand: a list of options, a count of seconds, and free text. */
const describeAttribute = ({ key, edit }: AttributeDef): string[] => {
	if (edit?.kind === "enum" || edit?.kind === "toggle")
		return [`${key} (${edit.value.options.join(" | ")})`];
	if (edit?.kind === "seconds") return [`${key} (seconds)`];
	return edit?.kind === "text" ? [key] : [];
};

// TODO(#743): an element's model-specific options show only as the value it already holds.
// Sloppy needs a tool that resolves one element's schema.
const ATTRIBUTES_BY_TYPE = ElementTypeSchema.options
	.filter((type) => !isMediaDraftType(type))
	.flatMap((type) => {
		const attributes =
			attributeSchemaFor(type).baseDefs.flatMap(describeAttribute);
		return attributes.length > 0 ? [`- ${type}: ${attributes.join(", ")}`] : [];
	})
	.join("\n");

const ASSETS = dedent`
	A character is the asset_avatar and asset_voice sharing a \`name\`: the exact name their
	lines and every {{Name}} in a prompt use, which never changes. A character has either or both.
	- asset_avatar: what a character looks like, as its text, written like an image
	  prompt. Their avatar is drawn from it, and every visual that names them is drawn from that
	  avatar.
	- asset_voice: how a speaker sounds, as its attributes and no text. A voice is described,
	  never picked; always set its language to the one its lines are in. The narrator is the asset_voice named ${NARRATOR}: it speaks every line no
	  character does, and has no avatar.
	- asset_style: the art style every visual is drawn in, as its text: the medium,
	  linework, colors and lighting. Never a place, setting, subject or time of day.
	- asset_references: the pictures every visual is drawn after. The user uploads these.
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

	  Attributes by type:
	  ${ATTRIBUTES_BY_TYPE}

	  A video's ${START_FRAME_ATTR} is ${NO_FRAME}, ${PREVIOUS_VISUAL} or a picture URL: a picture's URL from
	  view_result. Leave a URL already set alone.

	  The attributes above work with every model. Some models have extra attributes of their own;
	  read_script shows the ones an element already has.

	  To change a model, set provider and model to a pair from list_models. Narration and
	  character lines have none of their own: they speak with their asset_voice's.

	  ${CHARACTER_REFS_RULE}

	  ${VIDEO_PROMPT_FORMAT}

	  ${MUSIC_PROMPT_FORMAT}

	  Send the fewest operations that do the job. Write element text in the language of the
	  surrounding script, whatever language the request is in. Prompts for ${conjunction(NON_SPEECH_TYPES)},
	  and avatar and style text, are always in English, except speech quoted inside a video prompt.
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
		const { applied, failures } = ctx.editScript(ops);
		if (failures.length === 0) {
			return `Applied ${applied} ${plural(applied, "operation")}. The script has changed; read it again before editing further.`;
		}
		return [
			`Applied ${applied} of ${ops.length} operations.`,
			`Failed: ${failures.join("; ")}.`,
			"Read the script again before retrying; the ids you used may be stale.",
		].join(" ");
	},
	draftsScript: true,
});
