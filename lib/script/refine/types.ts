import { z } from "zod";
import { AssetTypeSchema, ContentTypeSchema } from "@/lib/canvas/types";

const ELEMENT_TEXT =
	"The element's content: the spoken line for narration and character; the prompt for image, video, sound and music; the look for asset_avatar and asset_style. asset_voice and asset_references have none, so omit it.";

const newElement = z.object({
	type: ContentTypeSchema,
	attrs: z.record(z.string(), z.string()).optional(),
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
	attrs: z.record(z.string(), z.string()).optional(),
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
	scene: z
		.boolean()
		.optional()
		.describe(
			"Move the whole scene holding `id`, next to the scene holding `anchor_id`.",
		),
});

const setOp = z.object({
	op: z.literal("set"),
	id: z.string(),
	attrs: z.record(z.string(), z.string().nullable()).optional().nullable(),
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
