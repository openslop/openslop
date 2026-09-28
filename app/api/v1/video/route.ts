import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { VIDEO_FIELDS } from "@/lib/api/generation-schema";
import { HOSTED } from "@/lib/api/route-families";

export const POST = createAssetRouteHandler(HOSTED, {
	connectorType: "video",
	fields: VIDEO_FIELDS,
	label: "Video submission",
});
