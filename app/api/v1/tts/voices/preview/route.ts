import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/api/auth";
import { logger } from "@/lib/api/logger";
import { getTTSProvider } from "@/lib/api/providers";
import { badRequest, serverError, unauthorized } from "@/lib/api/response";

export async function GET(request: NextRequest) {
	try {
		const user = await getUser();
		if (!user) return unauthorized();

		const url = request.nextUrl.searchParams.get("url");
		if (!url) return badRequest("Missing url");

		const upstream = await getTTSProvider().fetchVoicePreview(url);
		if (!upstream.ok) {
			return new NextResponse(null, { status: upstream.status });
		}

		const body = await upstream.arrayBuffer();
		return new NextResponse(body, {
			status: 200,
			headers: {
				"Content-Type":
					upstream.headers.get("Content-Type") ?? "application/octet-stream",
				"Content-Length": String(body.byteLength),
				"Cache-Control": "public, max-age=3600",
			},
		});
	} catch (error) {
		logger.error(error, "Voice preview fetch failed");
		return serverError("Voice preview fetch failed");
	}
}
