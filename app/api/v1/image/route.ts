import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { IMAGE_FIELDS } from "@/lib/api/generation-schema";
import { HOSTED } from "@/lib/api/route-families";

export const POST = createAssetRouteHandler(HOSTED, {
	connectorType: "image",
	fields: IMAGE_FIELDS,
	label: "Image generation",
});
