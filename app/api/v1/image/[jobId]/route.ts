import { createJobPollHandler } from "@/lib/api/asset-routes";
import { HOSTED } from "@/lib/api/route-families";

export const GET = createJobPollHandler(HOSTED);
