import { z } from "zod";
import { getImageProvider } from "@/lib/api/providers";
import { bodySchema, createRouteHandler } from "@/lib/api/route-handler";
import { IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";

const schema = bodySchema(IMAGE_MODELS, {
	format: z.string().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	referenceImages: z.array(z.string()).optional(),
});

export const POST = createRouteHandler({
	schema,
	getProvider: getImageProvider,
	label: "Image generation",
});
