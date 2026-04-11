export async function awaitCompletion<T>(
  pollFn: (jobId: string) => Promise<T>,
  jobId: string,
  isDone: (result: T) => boolean,
  intervalMs = 1000,
  timeoutMs = 300_000,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await pollFn(jobId);
    if (isDone(result)) return result;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Job ${jobId} timed out after ${timeoutMs}ms`);
}
