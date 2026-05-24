import {
	renderMediaOnLambda,
	speculateFunctionName,
} from "@remotion/lambda/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/api/auth";
import { parseBody } from "@/lib/api/parse";
import { unauthorized } from "@/lib/api/response";
import {
	DISK,
	RAM,
	REGION,
	SITE_NAME,
	TIMEOUT,
} from "@/lib/video/lambda-config";
import { COMPOSITION_ID } from "@/lib/video/types";

const RenderRequest = z.object({
	inputProps: z.record(z.string(), z.unknown()),
});

export async function POST(req: NextRequest) {
	const user = await getUser();
	if (!user) return unauthorized();

	const parsed = await parseBody(req, RenderRequest, "render");
	if (!parsed.ok) return parsed.response;

	const { renderId, bucketName } = await renderMediaOnLambda({
		codec: "h264",
		region: REGION,
		serveUrl: SITE_NAME,
		functionName: speculateFunctionName({
			diskSizeInMb: DISK,
			memorySizeInMb: RAM,
			timeoutInSeconds: TIMEOUT,
		}),
		composition: COMPOSITION_ID,
		inputProps: parsed.data.inputProps,
		downloadBehavior: { type: "download", fileName: "video.mp4" },
	});

	return NextResponse.json({ renderId, bucketName });
}
