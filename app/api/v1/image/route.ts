import { z } from "zod";
import { getImageProvider } from "@/lib/api/providers";
import {
	optionalImageDimensions,
	optionalReferenceImages,
} from "@/lib/api/request-schema-fields";
import { bodySchema, createRouteHandler } from "@/lib/api/route-handler";
import { IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";

const schema = bodySchema(IMAGE_MODELS, {
	format: z.string().optional(),
	...optionalImageDimensions,
	...optionalReferenceImages,
});

export const POST = createRouteHandler({
	schema,
	getProvider: getImageProvider,
	label: "Image generation",
});
