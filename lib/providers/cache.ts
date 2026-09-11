import { randomUUID } from "node:crypto";
import minBy from "lodash/minBy";
import { Pinecone, type RecordMetadata } from "@pinecone-database/pinecone";
import { z } from "zod";
import { AssetBundle, type BundleResponse } from "@/lib/api/asset-bundle";
import { logger } from "@/lib/api/logger";
import { embedText } from "./embed";

export type CacheMatch = { score?: number; metadata?: RecordMetadata };

const DEFAULT_THRESHOLD = 0.8;
const RANKED_TOP_K = 5;
const defaultSerialize = (...args: unknown[]): string => JSON.stringify(args);

type PineconeCacheOptions<Args extends unknown[], Result> = {
	index: string;
	toMetadata: (result: Result, description: string) => RecordMetadata;
	/** Return `undefined` when the stored row can't be rehydrated, forcing a miss. */
	fromMetadata: (metadata: RecordMetadata) => Result | undefined;
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
				.map((m) => ({ score: m.score, metadata: m.metadata }));
			const hit = opts.rank ? opts.rank(eligible, ...args) : eligible[0];
			if (hit?.metadata) {
				const cached = opts.fromMetadata(hit.metadata);
				if (cached !== undefined) return cached;
			}
		} catch (err) {
			logger.error(err, "[pinecone-cache] read failed; falling through");
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
				logger.error(err, "[pinecone-cache] write failed");
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
	const target = params.durationSeconds;
	if (target == null) return candidates[0];
	return minBy(candidates, (c) =>
		Math.abs(Number(c.metadata?.duration ?? 0) - target),
	);
};

const audioRow = z.object({
	url: z.string().min(1),
	duration: z.number(),
	description: z.string(),
});

/**
 * Reusable strategy for any method returning an audio BundleResponse. Stores
 * the *resolved* absolute URL so cache hits round-trip through
 * `AssetBundle.resolve` without reconstructing a bogus path.
 */
export const audioBundleCache = (type: string) => ({
	toMetadata: (r: BundleResponse, description: string): RecordMetadata => ({
		url: AssetBundle.fromResponse(r).resolve("audio"),
		duration: Number(r.metadata?.durationSec ?? 0),
		description,
	}),
	fromMetadata: (m: RecordMetadata): BundleResponse | undefined => {
		// `audioUrl` is the legacy key for rows written before the rename.
		const row = audioRow.safeParse({ ...m, url: m.url ?? m.audioUrl });
		if (!row.success) return undefined;
		const { url, duration, description } = row.data;
		return {
			id: url,
			type,
			provider: "pinecone-cache",
			result: { audio: url },
			metadata: { durationSec: duration, cached: true, description },
		};
	},
});
