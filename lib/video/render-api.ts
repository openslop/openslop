import type { EnhancedErrorInfo } from "@remotion/lambda/client";
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

/** Remotion's stitcher timeout text is written for the deployer (CloudWatch links, deploy flags). */
export function renderFailureMessage(errors: EnhancedErrorInfo[]): string {
	const fatal = errors.find((error) => error.isFatal && !error.willRetry);
	if (fatal == null) return "Render failed";
	if (fatal.name === "TimeoutError") {
		return "The export took too long to finish. Try a lower resolution or a shorter video.";
	}
	return fatal.message;
}
