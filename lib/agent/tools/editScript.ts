import dedent from "dedent";
import { z } from "zod";
import {
	CANVAS_ELEMENT_TYPES,
	type CanvasElementType,
	ELEMENT_TYPES,
} from "@/lib/canvas/types";
import {
	type AttributeEdit,
	TOGGLE_VALUES,
} from "@/lib/connectors/attributes/schema";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { EffectType } from "@/lib/connectors/image/enums";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { MusicLength } from "@/lib/connectors/music/enums";
import { refineOpSchema } from "@/lib/script/refine/types";
import { Pencil } from "@/components/ui/icon";
import { defineTool } from "./defineTool";

const enumeration = (values: readonly string[]) => `(${values.join(" | ")})`;

const PICTURE_ATTRIBUTES = [
	"characters",
	`overlays ${enumeration(Object.values(EffectType))}`,
];

/** Attributes the OSML prompt teaches that no connector schema carries. */
const SCRIPT_ATTRIBUTES: Partial<Record<CanvasElementType, string[]>> = {
	character: ["name"],
	image: PICTURE_ATTRIBUTES,
	animated_image: PICTURE_ATTRIBUTES,
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
const attributesFor = (type: CanvasElementType): string[] => {
	const connector = ELEMENT_TYPES[type].connector;
	const schema = resolveAttributeSchema(connector, DEFAULT_MODELS[connector]);
	return Object.entries({
		...schema.badgeAttributes,
		...schema.settingsAttributes,
	}).flatMap(([key, { edit }]) => describeAttribute(key, edit));
};

const ELEMENT_TYPE_NAMES = [...CANVAS_ELEMENT_TYPES];

const ATTRIBUTES_BY_TYPE = ELEMENT_TYPE_NAMES.map(
	(type) =>
		`- ${type}: ${[...(SCRIPT_ATTRIBUTES[type] ?? []), ...attributesFor(type)].join(", ")}`,
).join("\n");

export const editScript = defineTool({
	description: dedent`
	  Change the script on the canvas: add, remove, rewrite, retype or reorder elements.
	  Every element carries an \`id\`. Reference ids you read; never invent one.

	  - insert: place a new element before or after \`anchor_id\`. Omit \`anchor_id\` to append,
	    or to prepend with position "before". Each insert resolves independently, so several
	    at one anchor must each repeat it; they stack in the order you emit them. Never send
	    an \`id\` on an insert.
	  - remove: delete the element with \`id\`.
	  - set: change an element. Send only what changes, and the full replacement \`text\` when
	    text changes. Set an attribute to null to drop it.

	  \`deps\` goes on a \`set\` and reuses a result the element already has, instead of
	  throwing it away. Send it whenever you retype an element into one built on what it
	  already made: an image becoming an animated_image sends
	  \`deps: {"still": "<the image's id>"}\`, so the animation opens on the picture that
	  image already made instead of generating a new one. Retyping keeps the id, so that is
	  the id you already read. \`still\` is the only name \`deps\` takes today.

	  To move an element, remove it and insert it again.

	  Element types: ${ELEMENT_TYPE_NAMES.join(", ")}

	  Attributes by type, all string values:
	  ${ATTRIBUTES_BY_TYPE}

	  Send the fewest operations that do the job. Write element text in the language of the
	  surrounding script, whatever language the request is in. Image, animated_image
	  (including videoPrompt), sound and music descriptions are always English.
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
	rewritesCanvas: true,
});
