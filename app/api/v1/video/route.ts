import { createAssetRouteHandlers } from "@/lib/api/asset-routes";
import { bodySchema, VIDEO_FIELDS } from "@/lib/api/generation-schema";
import { OPENSLOP_VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";

export const { POST } = createAssetRouteHandlers({
	connectorType: "video",
	schema: bodySchema(OPENSLOP_VIDEO_MODELS, VIDEO_FIELDS),
	label: "Video submission",
});
