import { z } from "zod";
import { getTTSProvider } from "@/lib/api/providers";
import { bodySchema, createRouteHandler } from "@/lib/api/route-handler";
import { TTS_MODELS } from "@/lib/connectors/tts/openslop/models";

const schema = bodySchema(TTS_MODELS, {
	voiceId: z.string({ error: "voiceId is required" }).min(1, {
		message: "voiceId is required",
	}),
	speed: z.union([z.number(), z.string()]).optional(),
	volume: z.number().optional(),
	format: z.string().optional(),
});

export const POST = createRouteHandler({
	schema,
	getProvider: getTTSProvider,
	label: "TTS generation",
});
