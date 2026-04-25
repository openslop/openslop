import { NextResponse } from "next/server";
import { getVideoProvider } from "@/lib/api/providers";
import { badRequest } from "@/lib/api/response";
import { createRouteHandler } from "@/lib/api/route-handler";
import { VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";

export const POST = createRouteHandler({
	models: VIDEO_MODELS,
	getProvider: getVideoProvider,
	label: "Video submission",
	extraValidation: (body) => {
		const { referenceImages } = body;
		if (referenceImages === undefined) return null;
		if (!Array.isArray(referenceImages)) {
			return badRequest("referenceImages must be an array");
		}
		for (const img of referenceImages) {
			if (typeof img !== "string")
				return badRequest("Each referenceImages entry must be a string");
			const isDataUri = /^data:[a-z]+\/[a-z+.-]+;base64,/i.test(img);
			const isUrl = /^https?:\/\//i.test(img);
			if (!isDataUri && !isUrl)
				return badRequest(
					"Each referenceImages entry must be a data URI or an HTTP(S) URL",
				);
		}
		return null;
	},
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
