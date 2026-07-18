import { NextResponse } from "next/server";
import { z } from "zod";
import { getTTSProvider } from "@/lib/api/providers";
import { createApiQueryRouteHandler } from "@/lib/api/route-handler";

const previewParamsSchema = z.object({ url: z.string().url() });

export const GET = createApiQueryRouteHandler({
	schema: previewParamsSchema,
	label: "Voice preview fetch",
	handle: async ({ query }) => {
		const upstream = await getTTSProvider().fetchVoicePreview(query.url);
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
	},
});
