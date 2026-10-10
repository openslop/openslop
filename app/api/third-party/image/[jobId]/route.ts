import { createJobPollHandler } from "@/lib/api/assetRoutes";
import { BYOK } from "@/lib/api/routeFamilies";

export const GET = createJobPollHandler(BYOK);
