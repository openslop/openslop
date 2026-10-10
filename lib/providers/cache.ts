import { randomUUID } from "node:crypto";
import minBy from "lodash/minBy";
import {
	type Index,
	Pinecone,
	type RecordMetadata,
} from "@pinecone-database/pinecone";
import { z } from "zod";
import { AssetBundle, type BundleResponse } from "@/lib/api/assetBundle";
import { logger } from "@/lib/api/logger";
import { embedText } from "./embed";

type AudioPrompt = { prompt: string; durationSeconds?: number };

type CacheMatch = { score?: number; metadata?: RecordMetadata };

export type AudioPromptCache = {
	readThrough(
		params: AudioPrompt,
		produce: () => Promise<BundleResponse>,
	): Promise<BundleResponse>;
};

const SIMILARITY_THRESHOLD = 0.8;
const NEIGHBORS = 5;

export const bestMatch = (
	matches: CacheMatch[],
	durationSeconds: number | undefined,
): CacheMatch | undefined => {
	const similar = matches.filter(
		(match) => (match.score ?? 0) >= SIMILARITY_THRESHOLD,
	);
	if (durationSeconds == null) return similar[0];
	return minBy(similar, (match) =>
		Math.abs(Number(match.metadata?.duration ?? 0) - durationSeconds),
	);
};

const audioRow = z.object({
	url: z.string().min(1),
	duration: z.number(),
	description: z.string(),
});

type AudioRow = z.infer<typeof audioRow>;

/** Stores the resolved absolute URL so a hit round-trips without rebuilding a path. */
export const toAudioRow = (
	result: BundleResponse,
	description: string,
): AudioRow => ({
	url: AssetBundle.fromResponse(result).resolve("audio"),
	duration: Number(result.metadata?.durationSec ?? 0),
	description,
});

export const fromAudioRow = (
	metadata: RecordMetadata,
	type: string,
): BundleResponse | undefined => {
	// `audioUrl` is the legacy key for rows written before the rename.
	const row = audioRow.safeParse({
		...metadata,
		url: metadata.url ?? metadata.audioUrl,
	});
	if (!row.success) return undefined;
	const { url, duration, description } = row.data;
	return {
		id: url,
		type,
		provider: "pinecone-cache",
		result: { audio: url },
		metadata: { durationSec: duration, cached: true, description },
	};
};

const logged = (message: string) => (error: unknown) => {
	logger.error(error, message);
	return undefined;
};

class PineconeAudioCache implements AudioPromptCache {
	constructor(
		private readonly index: Index,
		private readonly type: string,
	) {}

	async readThrough(
		params: AudioPrompt,
		produce: () => Promise<BundleResponse>,
	): Promise<BundleResponse> {
		const vector = await embedText(params.prompt).catch(
			logged("[pinecone-cache] read failed; falling through"),
		);
		if (!vector) return produce();

		const cached = await this.lookup(vector, params.durationSeconds).catch(
			logged("[pinecone-cache] read failed; falling through"),
		);
		if (cached) return cached;

		const result = await produce();
		await this.store(vector, result, params.prompt).catch(
			logged("[pinecone-cache] write failed"),
		);
		return result;
	}

	private async lookup(vector: number[], durationSeconds?: number) {
		const { matches } = await this.index.query({
			vector,
			topK: NEIGHBORS,
			includeMetadata: true,
		});
		const hit = bestMatch(matches ?? [], durationSeconds);
		return hit?.metadata && fromAudioRow(hit.metadata, this.type);
	}

	private async store(
		vector: number[],
		result: BundleResponse,
		description: string,
	) {
		await this.index.upsert({
			records: [
				{
					id: randomUUID(),
					values: vector,
					metadata: toAudioRow(result, description),
				},
			],
		});
	}
}

const uncached: AudioPromptCache = {
	readThrough: (_params, produce) => produce(),
};

export function audioPromptCache(
	indexName: string,
	type: string,
): AudioPromptCache {
	const apiKey = process.env.PINECONE_API_KEY;
	if (!apiKey) return uncached;
	const index = new Pinecone({ apiKey }).index({ name: indexName });
	return new PineconeAudioCache(index, type);
}
