import {
	getRenderProgress,
	speculateFunctionName,
} from "@remotion/lambda/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/api/auth";
import { parseBody } from "@/lib/api/parse";
import { unauthorized } from "@/lib/api/response";
import { DISK, RAM, REGION, TIMEOUT } from "@/lib/video/lambda-config";

const ProgressRequest = z.object({
	renderId: z.string(),
	bucketName: z.string(),
});

export type ProgressResponse =
	| { type: "progress"; progress: number }
	| { type: "done"; url: string; size: number }
	| { type: "error"; message: string };

export async function POST(req: NextRequest) {
	const user = await getUser();
	if (!user) return unauthorized();

	const parsed = await parseBody(req, ProgressRequest, "render/progress");
	if (!parsed.ok) return parsed.response;

	const progress = await getRenderProgress({
		renderId: parsed.data.renderId,
		bucketName: parsed.data.bucketName,
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
		return NextResponse.json<ProgressResponse>({
			type: "done",
			url: progress.outputFile as string,
			size: progress.outputSizeInBytes as number,
		});
	}
	return NextResponse.json<ProgressResponse>({
		type: "progress",
		progress: progress.overallProgress,
	});
}
