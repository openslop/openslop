import { NextRequest, NextResponse } from "next/server";
import { getTTSProvider } from "@/lib/api/providers";
import { badRequest } from "@/lib/api/response";
import { withAuth } from "@/lib/api/with-auth";

export async function GET(request: NextRequest) {
	return withAuth("Voice preview fetch", async () => {
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
	});
}
