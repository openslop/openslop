import memoize from "lodash/memoize";

/** Memoizes by key. Rejections are discarded to enable retries. */
export function memoAsync<A extends unknown[], T>(
	make: (...args: A) => Promise<T>,
	keyOf: (...args: A) => string,
): (...args: A) => Promise<T> {
	const memoized = memoize(
		(...args: A) =>
			make(...args).catch((error: unknown) => {
				memoized.cache.delete(keyOf(...args));
				throw error;
			}),
		keyOf,
	);
	return memoized;
}
