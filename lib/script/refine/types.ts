import compact from "lodash/compact";
import { z } from "zod";
import { attributeSchemaFor } from "@/lib/canvas/element-connector";
import {
	AssetTypeSchema,
	ContentTypeSchema,
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

const shapeOf = (type: ElementType) =>
	Object.fromEntries(
		attributeSchemaFor(type).defs.map((def) => [def.key, attributeValue(def)]),
	);

// A generated key infers as possibly undefined, which parsed JSON never holds.
const attrsFor = (type: ElementType) =>
	z.strictObject(shapeOf(type)).partial() as z.ZodType<Record<string, string>>;

const text = z.string().optional().describe(ELEMENT_TEXT);

const elementOf = <Type extends ElementType>(type: Type) =>
	z.object({ type: z.literal(type), attrs: attrsFor(type).optional(), text });

// discriminatedUnion takes a non-empty tuple, which .map never infers.
const oneOfType = <Option extends z.core.$ZodTypeDiscriminable>([
	first,
	...rest
]: Option[]) => z.discriminatedUnion("type", [first, ...rest]);

const contentElements = ContentTypeSchema.options.map(elementOf);
const assetElements = AssetTypeSchema.options.map(elementOf);

const newElement = oneOfType(contentElements);

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

const assetOp = z.object({
	op: z.literal("asset"),
	element: oneOfType(assetElements),
});

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
	element: oneOfType([...contentElements, ...assetElements]),
	drop: z.array(z.string()).optional().describe("Attributes to clear, by key."),
});

export const refineOpSchema = z.discriminatedUnion("op", [
	insertOp,
	assetOp,
	removeOp,
	moveOp,
	setOp,
]);

export type RefineOp = z.infer<typeof refineOpSchema>;
