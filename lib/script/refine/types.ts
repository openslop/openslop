import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import uniq from "lodash/uniq";
import { z } from "zod";
import {
	everyAttributeDef,
	type TypedAttributeDef,
} from "@/lib/canvas/element-connector";
import { AssetTypeSchema, ContentTypeSchema } from "@/lib/canvas/types";
import { optionsOf } from "@/lib/connectors/attributes/schema";
import { conjunction } from "@/lib/format";

const ELEMENT_TEXT = `The element's content: the spoken line for speech; the prompt for every other content type; the look for asset_avatar and asset_style. asset_voice and asset_references have none, so omit it.`;

const optionsByModel = (typed: TypedAttributeDef[]): string =>
	uniq(
		typed.flatMap(({ model, def }) =>
			model ? [`${model.model}: ${optionsOf(def).join(", ")}.`] : [],
		),
	).join(" ");

/** A key's value on every type and model that carries it: a per-model key's options merged, else the value they share. */
function attributeValue(typed: TypedAttributeDef[]): z.ZodType<string> {
	const [{ def: first }] = typed;
	const value = first.perModel
		? z.enum(uniq(typed.flatMap(({ def }) => optionsOf(def))))
		: (first.edit?.value ?? z.string());
	const types = uniq(typed.map(({ type }) => type));
	return value.describe(
		[
			value.description,
			`On ${conjunction(types)}.`,
			first.unit && `Unit: ${first.unit}.`,
			first.perModel && `By model: ${optionsByModel(typed)}`,
		]
			.filter(Boolean)
			.join(" "),
	);
}

const ATTRIBUTES = mapValues(
	groupBy(everyAttributeDef(), ({ def }) => def.key),
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
