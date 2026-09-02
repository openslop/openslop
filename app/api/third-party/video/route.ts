import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { VIDEO_FIELDS } from "@/lib/api/generation-schema";
import { BYOK } from "@/lib/api/route-families";
import { BYOK_VIDEO_MODELS } from "@/lib/connectors/video/models";

export const POST = createAssetRouteHandler(BYOK, {
	connectorType: "video",
	models: BYOK_VIDEO_MODELS,
	fields: VIDEO_FIELDS,
	label: "Video submission",
});
