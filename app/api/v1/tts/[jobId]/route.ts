import { createJobPollHandler } from "@/lib/api/assetRoutes";
import { HOSTED } from "@/lib/api/routeFamilies";

export const GET = createJobPollHandler(HOSTED);
