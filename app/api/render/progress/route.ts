import {
	getRenderProgress,
	speculateFunctionName,
} from "@remotion/lambda/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionRouteHandler } from "@/lib/api/route-handler";
import { DISK, RAM, REGION, TIMEOUT } from "@/lib/video/lambda-config";

const ProgressRequest = z.object({
	renderId: z.string(),
	bucketName: z.string(),
});

export type ProgressResponse =
	| { type: "progress"; progress: number }
	| { type: "done"; url: string; size: number }
	| { type: "error"; message: string };

export const POST = createSessionRouteHandler({
	schema: ProgressRequest,
	label: "render/progress",
	handle: async ({ body }) => {
		const progress = await getRenderProgress({
			renderId: body.renderId,
			bucketName: body.bucketName,
			functionName: speculateFunctionName({
				diskSizeInMb: DISK,
				memorySizeInMb: RAM,
				timeoutInSeconds: TIMEOUT,
			}),
			region: REGION,
		});

		if (progress.fatalErrorEncountered) {
			return NextResponse.json<ProgressResponse>({
				type: "error",
				message: progress.errors[0]?.message ?? "Render failed",
			});
		}
		if (progress.done) {
			if (progress.outputFile == null || progress.outputSizeInBytes == null) {
				throw new Error("Render reported done without an output file");
			}
			return NextResponse.json<ProgressResponse>({
				type: "done",
				url: progress.outputFile,
				size: progress.outputSizeInBytes,
			});
		}
		return NextResponse.json<ProgressResponse>({
			type: "progress",
			progress: progress.overallProgress,
		});
	},
});
