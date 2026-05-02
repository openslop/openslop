import { NextResponse } from "next/server";
import { getTTSProvider } from "@/lib/api/providers";
import { createRouteHandler } from "@/lib/api/route-handler";
import { validateRequiredString } from "@/lib/api/request-validation";
import { TTS_MODELS } from "@/lib/connectors/tts/openslop/models";

export const POST = createRouteHandler({
	models: TTS_MODELS,
	getProvider: getTTSProvider,
	label: "TTS generation",
	extraValidation: (body) => validateRequiredString(body, "voiceId"),
	handle: async (provider, body) => {
		const { prompt, voiceId, model, speed, volume, format } = body;
		const result = await provider.generate({
			prompt,
			voiceId,
			model,
			speed,
			volume,
			format,
		});
		return NextResponse.json(result);
	},
});
