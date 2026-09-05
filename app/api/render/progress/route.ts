import { getRenderProgress } from "@remotion/lambda/client";
import { NextResponse } from "next/server";
import { createSessionRouteHandler } from "@/lib/api/route-handler";
import { getFunctionName, REGION } from "@/lib/video/lambda-config";
import {
	RenderHandleRequest,
	type RenderProgress,
} from "@/lib/video/render-api";

export const POST = createSessionRouteHandler({
	schema: RenderHandleRequest,
	label: "render/progress",
	handle: async ({ input }) => {
		const progress = await getRenderProgress({
			renderId: input.renderId,
			bucketName: input.bucketName,
			functionName: getFunctionName(),
			region: REGION,
		});

		if (progress.fatalErrorEncountered) {
			const fatal = progress.errors.find((e) => e.isFatal && !e.willRetry);
			return NextResponse.json<RenderProgress>({
				type: "error",
				message: fatal?.message ?? "Render failed",
			});
		}
		if (progress.done) {
			if (progress.outputFile == null || progress.outputSizeInBytes == null) {
				throw new Error("Render reported done without an output file");
			}
			return NextResponse.json<RenderProgress>({
				type: "done",
				url: progress.outputFile,
				size: progress.outputSizeInBytes,
			});
		}
		return NextResponse.json<RenderProgress>({
			type: "progress",
			progress: progress.overallProgress,
		});
	},
});
