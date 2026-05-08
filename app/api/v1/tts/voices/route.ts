import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/api/auth";
import { logger } from "@/lib/api/logger";
import { getTTSProvider } from "@/lib/api/providers";
import { serverError, unauthorized } from "@/lib/api/response";
import { voiceSearchParamsSchema } from "@/lib/project/types";

export async function GET(request: NextRequest) {
	try {
		const user = await getUser();
		if (!user) return unauthorized();

		const params = voiceSearchParamsSchema.parse(
			Object.fromEntries(request.nextUrl.searchParams),
		);

		const voices = await getTTSProvider().search(params);

		return NextResponse.json({ voices });
	} catch (error) {
		logger.error(error, "Voice search failed");
		return serverError("Voice search failed");
	}
}
