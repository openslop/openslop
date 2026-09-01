import { createThirdPartyAssetRouteHandlers } from "@/lib/api/asset-routes";
import { bodySchema, VIDEO_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createThirdPartyAssetRouteHandlers({
	connectorType: "video",
	schema: bodySchema("video", "byok", VIDEO_FIELDS),
	label: "Video submission",
});
