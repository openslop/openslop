import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { IMAGE_FIELDS } from "@/lib/api/generation-schema";
import { BYOK } from "@/lib/api/route-families";

export const POST = createAssetRouteHandler(BYOK, {
	connectorType: "image",
	fields: IMAGE_FIELDS,
	label: "Image generation",
});
