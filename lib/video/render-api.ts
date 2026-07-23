import { z } from "zod";

/** Wire contract for `/api/render` and `/api/render/progress`. */
export const RenderRequest = z.object({
	inputProps: z.record(z.string(), z.unknown()),
	scale: z.number().positive().optional(),
});

export const RenderHandleRequest = z.object({
	renderId: z.string(),
	bucketName: z.string(),
});

/** Identifies an in-flight Lambda render: returned by `/api/render`, polled by progress. */
export type RenderHandle = z.infer<typeof RenderHandleRequest>;

export type RenderProgress =
	| { type: "progress"; progress: number }
	| { type: "done"; url: string; size: number }
	| { type: "error"; message: string };
