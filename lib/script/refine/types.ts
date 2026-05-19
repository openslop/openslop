import { z } from "zod";
import {
	CANVAS_ELEMENT_TYPES,
	type CanvasElementType,
} from "@/lib/canvas/types";

const canvasElementType = z.enum([...CANVAS_ELEMENT_TYPES] as [
	CanvasElementType,
	...CanvasElementType[],
]);

const insertOp = z.object({
	op: z.literal("insert"),
	anchor_id: z.string().optional(),
	position: z.enum(["before", "after"]).optional(),
	type: canvasElementType,
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
	type: canvasElementType.optional(),
	attrs: z.record(z.string(), z.string().nullable()).optional().nullable(),
	text: z.string().optional(),
});

export const refineOpSchema = z.discriminatedUnion("op", [
	insertOp,
	removeOp,
	setOp,
]);

export type RefineOp = z.infer<typeof refineOpSchema>;
