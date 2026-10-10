import { createJobPollHandler } from "@/lib/api/asset-routes";
import { BYOK } from "@/lib/api/route-families";

export const GET = createJobPollHandler(BYOK);
