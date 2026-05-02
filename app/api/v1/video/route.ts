import { NextResponse } from "next/server";
import { getVideoProvider } from "@/lib/api/providers";
import { createRouteHandler } from "@/lib/api/route-handler";
import { validateReferenceImages } from "@/lib/api/request-validation";
import { VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";

export const POST = createRouteHandler({
	models: VIDEO_MODELS,
	getProvider: getVideoProvider,
	label: "Video submission",
	extraValidation: (body) => validateReferenceImages(body),
	handle: async (provider, body) => {
		const { prompt, model, referenceImages, duration, width, height } = body;
		const result = await provider.generate({
			prompt,
			model,
			referenceImages,
			duration,
			width,
			height,
		});
		return NextResponse.json(result);
	},
});
