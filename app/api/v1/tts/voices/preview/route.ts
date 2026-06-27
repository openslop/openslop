import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSearchParams } from "@/lib/api/parse";
import { getTTSProvider } from "@/lib/api/providers";
import { withApiAccess } from "@/lib/api/with-auth";

const previewParamsSchema = z.object({ url: z.string().url() });

export async function GET(request: NextRequest) {
	return withApiAccess("Voice preview fetch", async () => {
		const parsed = parseSearchParams(
			request,
			previewParamsSchema,
			"Voice preview fetch",
		);
		if (!parsed.ok) return parsed.response;

		const upstream = await getTTSProvider().fetchVoicePreview(parsed.data.url);
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
