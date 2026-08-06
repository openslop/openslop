/**
 * Drains `source` into `onChunk` until it ends or `signal` aborts. `onSettled`
 * runs only when the stream finished on its own, so callers can treat it as the
 * "the model said everything it had to say" hook.
 */
export async function drainStream<T>(
	source: AsyncIterable<T>,
	signal: AbortSignal,
	onChunk: (chunk: T) => void,
	onSettled?: () => void,
): Promise<void> {
	for await (const chunk of source) {
		if (signal.aborted) return;
		onChunk(chunk);
	}
	if (!signal.aborted) onSettled?.();
}
