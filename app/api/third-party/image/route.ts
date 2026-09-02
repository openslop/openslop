import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { IMAGE_FIELDS } from "@/lib/api/generation-schema";
import { BYOK } from "@/lib/api/route-families";
import { BYOK_IMAGE_MODELS } from "@/lib/connectors/image/models";

export const POST = createAssetRouteHandler(BYOK, {
	connectorType: "image",
	models: BYOK_IMAGE_MODELS,
	fields: IMAGE_FIELDS,
	label: "Image generation",
});
