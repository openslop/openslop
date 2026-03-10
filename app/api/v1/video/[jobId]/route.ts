import { NextRequest, NextResponse } from "next/server";
import { getVideoProvider } from "@/lib/api/providers";
import { badRequest, serverError } from "@/lib/api/response";
import { logger } from "@/lib/api/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    if (!jobId) return badRequest("jobId is required");

    const provider = getVideoProvider();
    const result = await provider.poll(jobId);

    return NextResponse.json(result);
  } catch (error) {
    logger.error(error, "Video poll failed");
    return serverError("Video poll failed");
  }
}
