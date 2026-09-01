import { createThirdPartyAssetRouteHandlers } from "@/lib/api/asset-routes";
import { byokBodySchema, IMAGE_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createThirdPartyAssetRouteHandlers({
	connectorType: "image",
	schema: byokBodySchema("image", IMAGE_FIELDS),
	label: "Image generation",
});
