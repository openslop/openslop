import { z } from "zod";
import { CanvasElementTypeSchema } from "@/lib/canvas/types";

const ELEMENT_TEXT =
	"The element's content: the spoken line for narration and character, the prompt for image, video, sound and music.";

const insertOp = z.object({
	op: z.literal("insert"),
	anchor_id: z.string().optional(),
	position: z.enum(["before", "after"]).optional(),
	type: CanvasElementTypeSchema,
	attrs: z.record(z.string(), z.string()).optional(),
	text: z.string().describe(ELEMENT_TEXT),
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
	text: z.string().optional().describe(ELEMENT_TEXT),
});

export const refineOpSchema = z.discriminatedUnion("op", [
	insertOp,
	removeOp,
	setOp,
]);

export type RefineOp = z.infer<typeof refineOpSchema>;
