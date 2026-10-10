import { createAssetRouteHandler } from "@/lib/api/assetRoutes";
import { HOSTED } from "@/lib/api/routeFamilies";

export const POST = createAssetRouteHandler(HOSTED, "music");
