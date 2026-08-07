import { handleCallback } from "@vercel/queue";
import type { AssetQueueMessage } from "@/lib/api/jobs";
import { processQueuedJob } from "@/lib/api/process-job";

export const POST = handleCallback<AssetQueueMessage>(processQueuedJob);
