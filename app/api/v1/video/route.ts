import { createAssetRouteHandlers } from "@/lib/api/asset-routes";
import { bodySchema, VIDEO_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createAssetRouteHandlers({
	connectorType: "video",
	schema: bodySchema("video", "hosted", VIDEO_FIELDS),
	label: "Video submission",
});
