import { z } from "zod";
import { getVideoProvider } from "@/lib/api/providers";
import { bodySchema, createRouteHandler } from "@/lib/api/route-handler";
import { VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";

const referenceImage = z
	.string()
	.refine(
		(s) =>
			/^data:[a-z]+\/[a-z+.-]+;base64,/i.test(s) || /^https?:\/\//i.test(s),
		{
			message:
				"Each referenceImages entry must be a data URI or an HTTP(S) URL",
		},
	);

const schema = bodySchema(VIDEO_MODELS, {
	referenceImages: z.array(referenceImage).optional(),
	duration: z.number().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
});

export const POST = createRouteHandler({
	schema,
	getProvider: getVideoProvider,
	label: "Video submission",
});
