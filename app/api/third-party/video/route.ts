import { createThirdPartyAssetRouteHandlers } from "@/lib/api/asset-routes";
import { byokBodySchema, VIDEO_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createThirdPartyAssetRouteHandlers({
	connectorType: "video",
	schema: byokBodySchema("video", VIDEO_FIELDS),
	label: "Video submission",
});
