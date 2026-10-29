import { z } from "zod";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/project/aspect-ratio";
import { RESOLUTIONS } from "./resolutions";
import { DEFAULT_FPS } from "./types";

// Lambda bills by the size `calculateMetadata` reads from these props, so the canvas is one of the project's own and the preset scales it.
const RenderInputProps = z.union(
	Object.values(ASPECT_RATIO_DIMENSIONS).map(({ output }) =>
		z.looseObject({
			fps: z.literal(DEFAULT_FPS),
			width: z.literal(output.width),
			height: z.literal(output.height),
		}),
	),
);

export const RenderRequest = z.object({
	inputProps: RenderInputProps,
	resolution: z.enum(RESOLUTIONS),
});

// Both fields are forwarded to AWS as the bucket and key prefix the render is
// read from, so they are parsed down to the shapes Remotion actually mints.
export const RenderHandle = z.object({
	renderId: z.string().regex(/^[A-Za-z0-9-]{1,64}$/, "Invalid renderId"),
	bucketName: z
		.string()
		.regex(/^remotionlambda-[a-z0-9-]{1,48}$/, "Invalid bucketName"),
});

/** Identifies an in-flight Lambda render: returned by `/api/render`, polled by progress. */
export type RenderHandle = z.infer<typeof RenderHandle>;

export const RenderProgress = z.discriminatedUnion("type", [
	z.object({ type: z.literal("progress"), progress: z.number() }),
	z.object({ type: z.literal("done"), url: z.string(), size: z.number() }),
	z.object({ type: z.literal("error"), message: z.string() }),
]);

export type RenderProgress = z.infer<typeof RenderProgress>;
