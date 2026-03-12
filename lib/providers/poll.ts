import type { VideoJob } from "@/lib/connectors/types";

export async function awaitCompletion(
  pollFn: (jobId: string) => Promise<VideoJob>,
  jobId: string,
  intervalMs = 1000,
  timeoutMs = 300_000,
): Promise<VideoJob> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const job = await pollFn(jobId);
    if (job.status === "completed" || job.status === "failed") return job;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Video job ${jobId} timed out after ${timeoutMs}ms`);
}
