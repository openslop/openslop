import { z } from "zod";

/** Wire contract for `/api/render` and `/api/render/progress`. */
export const RenderRequest = z.object({
	inputProps: z.record(z.string(), z.unknown()),
	scale: z.number().positive().optional(),
});

// Both fields are forwarded to AWS as the bucket and key prefix the render is
// read from, so they are parsed down to the shapes Remotion actually mints.
export const RenderHandleRequest = z.object({
	renderId: z.string().regex(/^[A-Za-z0-9-]{1,64}$/, "Invalid renderId"),
	bucketName: z
		.string()
		.regex(/^remotionlambda-[a-z0-9-]{1,48}$/, "Invalid bucketName"),
});

/** Identifies an in-flight Lambda render: returned by `/api/render`, polled by progress. */
export type RenderHandle = z.infer<typeof RenderHandleRequest>;

export type RenderProgress =
	| { type: "progress"; progress: number }
	| { type: "done"; url: string; size: number }
	| { type: "error"; message: string };
