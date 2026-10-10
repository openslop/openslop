import memoize from "lodash/memoize";

class LruCache extends Map<string, unknown> {
	private readonly max: number;

	constructor(max: number) {
		super();
		this.max = max;
	}

	override get(key: string): unknown {
		const value = super.get(key);
		if (this.has(key)) this.set(key, value);
		return value;
	}

	override set(key: string, value: unknown): this {
		this.delete(key);
		super.set(key, value);
		const oldest = this.keys().next();
		if (this.size > this.max && !oldest.done) this.delete(oldest.value);
		return this;
	}
}

/**
 * Memoizes by key. Rejections are discarded to enable retries. With `max`, only
 * the most recently used keys are kept; without it every key is kept.
 */
export function memoAsync<A extends unknown[], T>(
	make: (...args: A) => Promise<T>,
	keyOf: (...args: A) => string,
	{ max }: { max?: number } = {},
): (...args: A) => Promise<T> {
	const memoized = memoize(
		(...args: A) =>
			make(...args).catch((error: unknown) => {
				memoized.cache.delete(keyOf(...args));
				throw error;
			}),
		keyOf,
	);
	if (max !== undefined) memoized.cache = new LruCache(max);
	return memoized;
}
