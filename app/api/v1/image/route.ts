import { createAssetRouteHandlers } from "@/lib/api/asset-routes";
import { bodySchema, IMAGE_FIELDS } from "@/lib/api/generation-schema";
import { OPENSLOP_IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";

export const { POST } = createAssetRouteHandlers({
	connectorType: "image",
	schema: bodySchema(OPENSLOP_IMAGE_MODELS, IMAGE_FIELDS),
	label: "Image generation",
});
