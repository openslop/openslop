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

function attributeValue({ edit, unit, perModel }: AttributeDef) {
	const value = perModel ? z.string() : (edit?.value ?? z.string());
	return value.describe(
		[value.description, unit && `Unit: ${unit}.`, perModel && MODEL_VALUE]
			.filter(Boolean)
			.join(" "),
	);
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

const elementOf = <Type extends ElementType>(type: Type) =>
	z.object({
		type: z.literal(type),
		attrs: attrsFor(type).optional(),
		text: z.string().optional().describe(ELEMENT_TEXT),
	});

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
	text: z.string().optional().describe(ELEMENT_TEXT),
});

export const refineOpSchema = z.discriminatedUnion("op", [
	insertOp,
	assetOp,
	removeOp,
	moveOp,
	setOp,
]);

export type RefineOp = z.infer<typeof refineOpSchema>;
