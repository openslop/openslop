import { randomUUID } from "node:crypto";
import { Pinecone } from "@pinecone-database/pinecone";
import type { BundleResponse } from "@/lib/api/asset-bundle";
import { embedText } from "./embed";

type Metadata = Record<string, string | number | boolean>;

const DEFAULT_THRESHOLD = 0.8;
const defaultSerialize = (...args: unknown[]): string => JSON.stringify(args);

export type PineconeCacheOptions<Args extends unknown[], Result> = {
	index: string;
	toMetadata: (result: Result, description: string) => Metadata;
	fromMetadata: (metadata: Metadata) => Result;
	threshold?: number;
	serialize?: (...args: Args) => string;
	namespace?: string;
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

	return async function (this: This, ...args: Args): Promise<Result> {
		const description = serialize(...args);
		let vector: number[] | undefined;
		try {
			vector = await embedText(description);
			const { matches } = await index.query({
				vector,
				topK: 1,
				includeMetadata: true,
			});
			const hit = matches?.[0];
			if ((hit?.score ?? 0) >= threshold)
				return opts.fromMetadata(hit.metadata as Metadata);
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

/** Reusable strategy for any method returning an audio BundleResponse. */
export const audioBundleCache = {
	toMetadata: (r: BundleResponse, description: string): Metadata => ({
		url: r.result.audio,
		duration: Number(r.metadata?.durationSec ?? 0),
		description,
	}),
	fromMetadata: (m: Metadata): BundleResponse => ({
		id: String(m.url || m.audioUrl),
		provider: "pinecone-cache",
		result: { audio: String(m.url || m.audioUrl) },
		metadata: {
			durationSec: Number(m.duration),
			cached: true,
			description: String(m.description),
		},
	}),
};
