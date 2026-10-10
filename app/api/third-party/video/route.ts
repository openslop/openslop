import { createAssetRouteHandler } from "@/lib/api/assetRoutes";
import { BYOK } from "@/lib/api/routeFamilies";

export const POST = createAssetRouteHandler(BYOK, "video");
