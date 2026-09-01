import { createThirdPartyAssetRouteHandlers } from "@/lib/api/asset-routes";
import { bodySchema, IMAGE_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createThirdPartyAssetRouteHandlers({
	connectorType: "image",
	schema: bodySchema("image", "byok", IMAGE_FIELDS),
	label: "Image generation",
});
