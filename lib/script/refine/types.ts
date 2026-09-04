import { z } from "zod";
import { CanvasElementTypeSchema } from "@/lib/canvas/types";

const insertOp = z.object({
	op: z.literal("insert"),
	anchor_id: z.string().optional(),
	position: z.enum(["before", "after"]).optional(),
	type: CanvasElementTypeSchema,
	attrs: z.record(z.string(), z.string()).optional(),
	text: z.string(),
});

const removeOp = z.object({
	op: z.literal("remove"),
	id: z.string(),
});

const setOp = z.object({
	op: z.literal("set"),
	id: z.string(),
	type: CanvasElementTypeSchema.optional(),
	attrs: z.record(z.string(), z.string().nullable()).optional().nullable(),
	text: z.string().optional(),
	deps: z
		.record(z.string(), z.string())
		.optional()
		.describe(
			'Reuse a result instead of making a new one, as input name to element id. Example: {"still": "abc123"}.',
		),
});

export const refineOpSchema = z.discriminatedUnion("op", [
	insertOp,
	removeOp,
	setOp,
]);

export type RefineOp = z.infer<typeof refineOpSchema>;
