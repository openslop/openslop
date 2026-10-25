import { z } from "zod";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/project/aspect-ratio";
import { RESOLUTIONS } from "./resolutions";
import { DEFAULT_CONFIG } from "./types";

// Lambda bills by the size `calculateMetadata` reads from these props, so the canvas is one of the project's own and the preset scales it.
const RenderInputProps = z.union(
	Object.values(ASPECT_RATIO_DIMENSIONS).map(({ output }) =>
		z.looseObject({
			fps: z.literal(DEFAULT_CONFIG.fps),
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
