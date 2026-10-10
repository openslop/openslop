import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { NARRATOR } from "@/lib/canvas/assets";
import { attributeSchemaFor } from "@/lib/canvas/element-connector";
import { ElementTypeSchema, type ElementType } from "@/lib/canvas/types";
import {
	type AttributeEdit,
	TOGGLE_VALUES,
} from "@/lib/connectors/attributes/schema";
import { EffectType } from "@/lib/connectors/image/enums";
import { MusicLength } from "@/lib/connectors/music/enums";
import { VIDEO_PROMPT_FORMAT } from "@/lib/script/prompt/video-prompt";
import { refineOpSchema } from "@/lib/script/refine/types";
import { Pencil } from "@/components/ui/icon";
import { defineTool } from "./define-tool";

const enumeration = (values: readonly string[]) => `(${values.join(" | ")})`;

const PICTURE_ATTRIBUTES = [
	"characters",
	`overlays ${enumeration(Object.values(EffectType))}`,
];

/** Attributes the OSML prompt teaches that no schema carries. */
const SCRIPT_ATTRIBUTES: Partial<Record<ElementType, string[]>> = {
	character: ["name"],
	image: PICTURE_ATTRIBUTES,
	video: [
		...PICTURE_ATTRIBUTES,
		'startFrame (none | previous, or a picture URL: an image\'s URL from view_image, with continuity="false" so the look before it does not fight that picture; leave a URL already set alone)',
	],
	music: [`length ${enumeration(Object.values(MusicLength))}`],
};

/** Attributes Sloppy can write by hand: enums with their options, and free text. */
const describeAttribute = (key: string, edit?: AttributeEdit): string[] => {
	if (edit?.kind === "enum") return [`${key} ${enumeration(edit.options)}`];
	if (edit?.kind === "toggle") return [`${key} ${enumeration(TOGGLE_VALUES)}`];
	return edit?.kind === "text" ? [key] : [];
};

// TODO(#743): this reads each type's recommended model, which holds while a type
// has one or two models. Once a canvas mixes providers/models within a type, Sloppy
// needs a tool that resolves the schema for one element's own pair before editing it.
const attributesFor = (type: ElementType): string[] =>
	Object.entries(attributeSchemaFor(type, {}).allAttributes).flatMap(
		([key, { edit }]) => describeAttribute(key, edit),
	);

const attributesByType = (types: readonly ElementType[]) =>
	types
		.map((type) => ({
			type,
			attributes: [...(SCRIPT_ATTRIBUTES[type] ?? []), ...attributesFor(type)],
		}))
		.filter(({ attributes }) => attributes.length > 0)
		.map(({ type, attributes }) => `- ${type}: ${attributes.join(", ")}`)
		.join("\n");

const ASSETS = dedent`
	Assets sit ahead of the first scene and are global to the project. They are edited the
	same way: insert one with no anchor, and set or remove one by its \`id\`. An insert whose
	asset already exists changes that one instead. The title is not an asset: change it with
	set_title.
	A character is the asset_avatar and asset_voice sharing a \`name\`: the exact name their
	lines and every \`characters\` list use, which never changes. A character has either or both.
	- asset_avatar: what a character looks like, as its text, written like an image
	  prompt. Their avatar is drawn from it, and every visual that lists them is drawn from that
	  avatar.
	- asset_voice: how a speaker sounds, as its attributes and no text. A voice is described,
	  never picked; always set its language to the one its lines are in. The narrator is the asset_voice named ${NARRATOR}: it speaks every line no
	  character does, and has no avatar.
	- asset_style: the art style every visual is drawn in, as its text: the medium,
	  linework, colors and lighting. Never a place, setting, subject or time of day.
	- asset_references: the pictures every visual is drawn after. The user uploads these.
`;

export const editScript = defineTool({
	description: dedent`
	  Change the canvas: add, remove, rewrite, retype or reorder the script's elements, and
	  set up the assets it draws on. Every element carries an \`id\`. Reference ids you read;
	  never invent one.

	  - insert: place a new element before or after \`anchor_id\`. Omit \`anchor_id\` to append,
	    or to prepend with position "before". Each insert resolves independently, so several
	    at one anchor must each repeat it; they stack in the order you emit them. Never send
	    an \`id\` on an insert.
	  - remove: delete the element with \`id\`.
	  - set: change an element. Send only what changes, and the full replacement \`text\` when
	    text changes. Set an attribute to null to drop it.

	  To move an element, remove it and insert it again.

	  Element types: ${ElementTypeSchema.options.join(", ")}

	  ${ASSETS}

	  Attributes by type, all string values:
	  ${attributesByType(ElementTypeSchema.options)}

	  ${VIDEO_PROMPT_FORMAT}

	  Send the fewest operations that do the job. Write element text in the language of the
	  surrounding script, whatever language the request is in. Image, video, sound and music
	  prompts, avatar and style text are always in English, except speech quoted inside a video prompt.
	`,
	input: z.object({
		ops: z
			.array(refineOpSchema)
			.min(1)
			.describe("Operations to apply, in order."),
	}),
	output: z.string(),
	icon: Pencil,
	label: ({ ops }) =>
		`Editing the script (${ops?.length ?? 0} change${ops?.length === 1 ? "" : "s"})`,
	execute: async ({ ops }, ctx) => {
		const { applied, failures } = ctx.editScript(ops);
		if (failures.length === 0) {
			return `Applied ${applied} operation${applied === 1 ? "" : "s"}. The script has changed; read it again before editing further.`;
		}
		return [
			`Applied ${applied} of ${ops.length} operations.`,
			`Failed: ${failures.join("; ")}.`,
			"Read the script again before retrying; the ids you used may be stale.",
		].join(" ");
	},
	draftsScript: true,
});
