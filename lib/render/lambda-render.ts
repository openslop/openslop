import {
	getRenderProgress,
	renderMediaOnLambda,
} from "@remotion/lambda/client";
import { getFunctionName, getSiteName, REGION } from "./lambda-config";
import type { RenderBackend } from "./render-api";
import { renderScale } from "./resolutions";
import { COMPOSITION_ID } from "./types";

export const lambdaRender: RenderBackend = {
	start: async ({ inputProps, resolution }) => {
		const { renderId, bucketName } = await renderMediaOnLambda({
			codec: "h264",
			region: REGION,
			serveUrl: getSiteName(),
			functionName: getFunctionName(),
			composition: COMPOSITION_ID,
			inputProps,
			scale: renderScale(resolution),
			downloadBehavior: { type: "download", fileName: "video.mp4" },
		});
		return { renderId, bucketName };
	},

	progress: async ({ renderId, bucketName }) => {
		const progress = await getRenderProgress({
			renderId,
			bucketName,
			functionName: getFunctionName(),
			region: REGION,
		});
		if (progress.fatalErrorEncountered) {
			const fatal = progress.errors.find((e) => e.isFatal && !e.willRetry);
			return { type: "error", message: fatal?.message ?? "Render failed" };
		}
		if (progress.done) {
			if (progress.outputFile == null || progress.outputSizeInBytes == null) {
				throw new Error("Render reported done without an output file");
			}
			return {
				type: "done",
				url: progress.outputFile,
				size: progress.outputSizeInBytes,
			};
		}
		return { type: "progress", progress: progress.overallProgress };
	},
};
