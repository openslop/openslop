import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { IMAGE_FIELDS } from "@/lib/api/generation-schema";
import { HOSTED } from "@/lib/api/route-families";
import { OPENSLOP_IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";

export const POST = createAssetRouteHandler(HOSTED, {
	connectorType: "image",
	models: OPENSLOP_IMAGE_MODELS,
	fields: IMAGE_FIELDS,
	label: "Image generation",
});
