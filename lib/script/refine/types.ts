import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import uniq from "lodash/uniq";
import { z } from "zod";
import { attributeSchemaFor } from "@/lib/canvas/element-connector";
import {
	AssetTypeSchema,
	connectorOf,
	ContentTypeSchema,
	ElementTypeSchema,
	isMediaDraftType,
	NON_SPEECH_TYPES,
	SPEECH_TYPES,
	type ElementType,
} from "@/lib/canvas/types";
import { listModels } from "@/lib/connectors/models";
import { conjunction } from "@/lib/format";

const ELEMENT_TEXT = `The element's content: the spoken line for ${conjunction(SPEECH_TYPES)}; the prompt for ${conjunction(NON_SPEECH_TYPES)}; the look for asset_avatar and asset_style. asset_voice and asset_references have none, so omit it.`;

/** Every attribute an element of `type` can hold, under any of its models. */
const defsOf = (type: ElementType) => {
	const connector = connectorOf(type);
	const models = connector ? listModels(connector) : [undefined];
	return models.flatMap((model) => attributeSchemaFor(type, model).defs);
};

const TYPED_DEFS = ElementTypeSchema.options
	.filter((type) => !isMediaDraftType(type))
	.flatMap((type) => defsOf(type).map((def) => ({ type, def })));

/** A key's value on every type and model that carries it: their options merged, else the value they share. */
function attributeValue(typed: typeof TYPED_DEFS): z.ZodType<string> {
	const [{ def }] = typed;
	const options = uniq(
		typed.flatMap(({ def: { edit } }) =>
			edit?.kind === "enum" || edit?.kind === "toggle"
				? edit.value.options
				: [],
		),
	);
	const value =
		options.length > 0 ? z.enum(options) : (def.edit?.value ?? z.string());
	const types = uniq(typed.map(({ type }) => type));
	return value.describe(
		[
			value.description,
			`On ${conjunction(types)}.`,
			def.unit && `Unit: ${def.unit}.`,
			def.perModel && "The options depend on the model.",
		]
			.filter(Boolean)
			.join(" "),
	);
}

const ATTRIBUTES = mapValues(
	groupBy(TYPED_DEFS, ({ def }) => def.key),
	attributeValue,
);

// A generated key infers as possibly undefined, which parsed JSON never holds.
const attrs = z.strictObject(ATTRIBUTES).partial() as z.ZodType<
	Record<string, string>
>;

const attrEdits = z
	.strictObject(mapValues(ATTRIBUTES, (value) => value.nullable()))
	.partial() as z.ZodType<Record<string, string | null>>;

const newElement = z.object({
	type: ContentTypeSchema,
	attrs: attrs.optional(),
	text: z.string().optional().describe(ELEMENT_TEXT),
});

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
	type: AssetTypeSchema,
	attrs: attrs.optional(),
	text: z.string().optional().describe(ELEMENT_TEXT),
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
