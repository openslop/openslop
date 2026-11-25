import compact from "lodash/compact";
import mapValues from "lodash/mapValues";
import { z } from "zod";
import { attributeSchemaFor } from "@/lib/canvas/element-connector";
import {
	AssetTypeSchema,
	ContentTypeSchema,
	ElementTypeSchema,
	type ElementType,
} from "@/lib/canvas/types";
import type { AttributeDef } from "@/lib/connectors/attributes/schema";

const ELEMENT_TEXT = `The element's content: the spoken line for speech; the prompt for every other content type; the look for asset_avatar and asset_style. asset_voice and asset_references have none, so omit it.`;

const MODEL_VALUE =
	"Depends on the element's model: read_model_attributes lists its values.";

/** A model's own values are checked on apply, against the element's model. */
function valueOf({ edit, perModel }: AttributeDef): z.ZodType<string> {
	if (perModel) return z.string();
	return edit?.value ?? z.string();
}

function attributeValue(def: AttributeDef) {
	const value = valueOf(def);
	const notes = compact([
		value.description,
		def.unit && `Unit: ${def.unit}.`,
		def.perModel && MODEL_VALUE,
	]);
	return value.describe(notes.join(" "));
}

const shapeOf = (defs: readonly AttributeDef[]) =>
	Object.fromEntries(defs.map((def) => [def.key, attributeValue(def)]));

// A generated key infers as possibly undefined, which parsed JSON never holds.
const attrsFor = (type: ElementType) =>
	z.strictObject(shapeOf(attributeSchemaFor(type).defs)).partial() as z.ZodType<
		Record<string, string>
	>;

const everyAttribute = shapeOf(
	ElementTypeSchema.options.flatMap((type) => attributeSchemaFor(type).defs),
);

const attrEdits = z
	.strictObject(mapValues(everyAttribute, (value) => value.nullable()))
	.partial();

const text = z.string().optional().describe(ELEMENT_TEXT);

const elementOf = <Type extends ElementType>(type: Type) =>
	z.object({ type: z.literal(type), attrs: attrsFor(type).optional(), text });

// discriminatedUnion takes a non-empty tuple, which .map never infers.
const oneOfType = <Option extends ReturnType<typeof elementOf>>([
	first,
	...rest
]: Option[]) => z.discriminatedUnion("type", [first, ...rest]);

const newElement = oneOfType(ContentTypeSchema.options.map(elementOf));

export type NewElement = z.infer<typeof newElement>;

const placement = {
	anchor_id: z.string().optional(),
	position: z
		.enum(["before", "after"])
		.optional()
		.describe("Which side of the anchor; after when omitted."),
};

const insertOp = z.object({
	op: z.literal("insert"),
	...placement,
	elements: z
		.array(newElement)
		.min(1)
		.describe("The new elements, in the order they appear."),
});

const assetOp = oneOfType(
	AssetTypeSchema.options.map((type) =>
		elementOf(type).extend({ op: z.literal("asset") }),
	),
);

const removeOp = z.object({
	op: z.literal("remove"),
	id: z.string(),
});

const moveOp = z.object({
	op: z.literal("move"),
	id: z.string(),
	...placement,
});

const setOp = z.object({
	op: z.literal("set"),
	id: z.string(),
	attrs: attrEdits.optional().nullable(),
	text,
});

export const refineOpSchema = z.discriminatedUnion("op", [
	insertOp,
	assetOp,
	removeOp,
	moveOp,
	setOp,
]);

export type RefineOp = z.infer<typeof refineOpSchema>;
