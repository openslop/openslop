import { z } from "zod";
import {
	optionalImageDimensions,
	optionalReferenceImages,
} from "@/lib/api/request-schema-fields";
import { bodySchema, createAssetRouteHandlers } from "@/lib/api/route-handler";
import { OPENSLOP_IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";

const schema = bodySchema(OPENSLOP_IMAGE_MODELS, {
	format: z.string().optional(),
	...optionalImageDimensions,
	...optionalReferenceImages,
});

export const { POST } = createAssetRouteHandlers({
	connectorType: "image",
	schema,
	label: "Image generation",
});
