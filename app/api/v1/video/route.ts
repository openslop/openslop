import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { VIDEO_FIELDS } from "@/lib/api/generation-schema";
import { HOSTED } from "@/lib/api/route-families";
import { OPENSLOP_VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";

export const POST = createAssetRouteHandler(HOSTED, {
	connectorType: "video",
	models: OPENSLOP_VIDEO_MODELS,
	fields: VIDEO_FIELDS,
	label: "Video submission",
});
