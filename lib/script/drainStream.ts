/**
 * Drains `source` into `onChunk` until it ends or `signal` aborts. Resolves true
 * only when the stream finished on its own, which callers read as "the model
 * said everything it had to say" rather than "something newer took over".
 */
export async function drainStream<T>(
	source: AsyncIterable<T>,
	signal: AbortSignal,
	onChunk: (chunk: T) => void,
): Promise<boolean> {
	for await (const chunk of source) {
		if (signal.aborted) return false;
		onChunk(chunk);
	}
	// Aborting can land after the last chunk, with no iteration left to see it.
	return !signal.aborted;
}
