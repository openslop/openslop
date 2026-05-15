import { randomUUID } from "node:crypto";
import { Pinecone } from "@pinecone-database/pinecone";
import { AssetBundle, type BundleResponse } from "@/lib/api/asset-bundle";
import { embedText } from "./embed";

type Metadata = Record<string, string | number | boolean>;

export type CacheMatch = { score?: number; metadata?: Metadata };

const DEFAULT_THRESHOLD = 0.8;
const RANKED_TOP_K = 5;
const defaultSerialize = (...args: unknown[]): string => JSON.stringify(args);

export type PineconeCacheOptions<Args extends unknown[], Result> = {
	index: string;
	toMetadata: (result: Result, description: string) => Metadata;
	fromMetadata: (metadata: Metadata) => Result;
	threshold?: number;
	serialize?: (...args: Args) => string;
	namespace?: string;
	/**
	 * Best-effort tiebreaker over the threshold-eligible candidates. When set,
	 * Pinecone is queried for several neighbors and `rank` picks the winner.
	 * Return `undefined` to force a miss.
	 */
	rank?: (candidates: CacheMatch[], ...args: Args) => CacheMatch | undefined;
};

/**
 * Wraps an async method with a Pinecone vector-similarity read-through cache.
 */
export function pineconeCache<Args extends unknown[], Result, This = unknown>(
	method: (this: This, ...args: Args) => Promise<Result>,
	opts: PineconeCacheOptions<Args, Result>,
): (this: This, ...args: Args) => Promise<Result> {
	const apiKey = process.env.PINECONE_API_KEY;
	if (!apiKey) return method;

	const index = new Pinecone({ apiKey })
		.index(opts.index)
		.namespace(opts.namespace ?? "");
	const threshold = opts.threshold ?? DEFAULT_THRESHOLD;
	const serialize = opts.serialize ?? defaultSerialize;

	const topK = opts.rank ? RANKED_TOP_K : 1;

	return async function (this: This, ...args: Args): Promise<Result> {
		const description = serialize(...args);
		let vector: number[] | undefined;
		try {
			vector = await embedText(description);
			const { matches } = await index.query({
				vector,
				topK,
				includeMetadata: true,
			});
			const eligible: CacheMatch[] = (matches ?? [])
				.filter((m) => (m.score ?? 0) >= threshold)
				.map((m) => ({ score: m.score, metadata: m.metadata as Metadata }));
			const hit = opts.rank ? opts.rank(eligible, ...args) : eligible[0];
			if (hit?.metadata) return opts.fromMetadata(hit.metadata as Metadata);
		} catch (err) {
			console.error("[pinecone-cache] read failed; falling through", err);
		}

		const result = await method.call(this, ...args);
		if (vector) {
			try {
				await index.upsert({
					records: [
						{
							id: randomUUID(),
							values: vector,
							metadata: opts.toMetadata(result, description),
						},
					],
				});
			} catch (err) {
				console.error("[pinecone-cache] write failed", err);
			}
		}
		return result;
	};
}

/**
 * Picks the candidate whose stored `duration` is closest to `params.durationSeconds`.
 * If the caller didn't specify a duration, falls back to the top similarity match.
 */
export const rankByNearestDuration = <P extends { durationSeconds?: number }>(
	candidates: CacheMatch[],
	params: P,
): CacheMatch | undefined => {
	if (candidates.length === 0) return undefined;
	const target = params.durationSeconds;
	if (target == null) return candidates[0];
	return candidates.reduce((best, c) => {
		const bd = Math.abs(Number(best.metadata?.duration ?? 0) - target);
		const cd = Math.abs(Number(c.metadata?.duration ?? 0) - target);
		return cd < bd ? c : best;
	});
};

/**
 * Reusable strategy for any method returning an audio BundleResponse. Stores
 * the *resolved* absolute URL so cache hits round-trip through
 * `AssetBundle.resolve` without reconstructing a bogus path.
 */
export const audioBundleCache = (type: string) => ({
	toMetadata: (r: BundleResponse, description: string): Metadata => ({
		url: AssetBundle.fromResponse(type, r).resolve("audio"),
		duration: Number(r.metadata?.durationSec ?? 0),
		description,
	}),
	fromMetadata: (m: Metadata): BundleResponse => {
		const url = String(m.url || m.audioUrl);
		return {
			id: url,
			provider: "pinecone-cache",
			result: { audio: url },
			metadata: {
				durationSec: Number(m.duration),
				cached: true,
				description: String(m.description),
			},
		};
	},
});
