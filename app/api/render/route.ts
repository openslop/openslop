import { renderMediaOnLambda } from "@remotion/lambda/client";
import { NextResponse } from "next/server";
import { createSessionRouteHandler } from "@/lib/api/route-handler";
import {
	getFunctionName,
	getSiteName,
	REGION,
} from "@/lib/video/lambda-config";
import { RenderRequest, type RenderHandle } from "@/lib/video/render-api";
import { COMPOSITION_ID } from "@/lib/video/types";

export const POST = createSessionRouteHandler({
	schema: RenderRequest,
	label: "render",
	handle: async ({ input }) => {
		const { renderId, bucketName } = await renderMediaOnLambda({
			codec: "h264",
			region: REGION,
			serveUrl: getSiteName(),
			functionName: getFunctionName(),
			composition: COMPOSITION_ID,
			inputProps: input.inputProps,
			scale: input.scale,
			downloadBehavior: { type: "download", fileName: "video.mp4" },
		});

		return NextResponse.json<RenderHandle>({ renderId, bucketName });
	},
});
