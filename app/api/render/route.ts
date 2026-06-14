import {
	renderMediaOnLambda,
	speculateFunctionName,
} from "@remotion/lambda/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionRouteHandler } from "@/lib/api/route-handler";
import {
	DISK,
	getSiteName,
	RAM,
	REGION,
	TIMEOUT,
} from "@/lib/video/lambda-config";
import { COMPOSITION_ID } from "@/lib/video/types";

const RenderRequest = z.object({
	inputProps: z.record(z.string(), z.unknown()),
});

export const POST = createSessionRouteHandler({
	schema: RenderRequest,
	label: "render",
	handle: async ({ body }) => {
		const { renderId, bucketName } = await renderMediaOnLambda({
			codec: "h264",
			region: REGION,
			serveUrl: getSiteName(),
			functionName: speculateFunctionName({
				diskSizeInMb: DISK,
				memorySizeInMb: RAM,
				timeoutInSeconds: TIMEOUT,
			}),
			composition: COMPOSITION_ID,
			inputProps: body.inputProps,
			downloadBehavior: { type: "download", fileName: "video.mp4" },
		});

		return NextResponse.json({ renderId, bucketName });
	},
});
