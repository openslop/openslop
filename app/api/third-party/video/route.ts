import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { VIDEO_FIELDS } from "@/lib/api/generation-schema";
import { BYOK } from "@/lib/api/route-families";

export const POST = createAssetRouteHandler(BYOK, {
	connectorType: "video",
	fields: VIDEO_FIELDS,
	label: "Video submission",
});
