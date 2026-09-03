import omit from "lodash/omit";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ModelRef } from "@/lib/connectors/types";
import { voiceSearchParamsSchema } from "@/lib/project/types";
import type { RouteFamily } from "./route-families";

export const createVoiceSearchHandler = <TModels, TPicked extends ModelRef>(
	family: RouteFamily<TModels, TPicked>,
	models: TModels,
) =>
	family.createQueryHandler({
		schema: voiceSearchParamsSchema.and(family.model(models)),
		label: "Voice search",
		handle: async ({ user, input }) => {
			const tts = await family.providerFor(user.id, "tts", input);
			const voices = await tts.search(omit(input, "provider", "model"));
			return NextResponse.json({ voices });
		},
	});

const previewParamsSchema = z.object({ url: z.string().url() });

export const createVoicePreviewHandler = <TModels, TPicked extends ModelRef>(
	family: RouteFamily<TModels, TPicked>,
	models: TModels,
) =>
	family.createQueryHandler({
		schema: previewParamsSchema.and(family.model(models)),
		label: "Voice preview fetch",
		handle: async ({ user, input }) => {
			const tts = await family.providerFor(user.id, "tts", input);
			const upstream = await tts.fetchVoicePreview(input.url);
			if (!upstream.ok)
				return new NextResponse(null, { status: upstream.status });
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
