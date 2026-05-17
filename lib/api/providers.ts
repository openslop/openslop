import { RunwareImage } from "@/lib/providers/image/runware";
import { MockImage } from "@/lib/providers/image/mock";
import { RunwareVideo } from "@/lib/providers/video/runware";
import { MockVideo } from "@/lib/providers/video/mock";
import { ElevenLabsMusic } from "@/lib/providers/music/elevenlabs";
import { MockMusic } from "@/lib/providers/music/mock";
import { ElevenLabsSFX } from "@/lib/providers/sfx/elevenlabs";
import { MockSFX } from "@/lib/providers/sfx/mock";
import { AnthropicLLM } from "@/lib/providers/llm/anthropic";
import { MockLLM } from "@/lib/providers/llm/mock";
import { CartesiaTTS } from "@/lib/providers/tts/cartesia";
import { MockTTS } from "@/lib/providers/tts/mock";
import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { ConnectorType } from "@/lib/connectors/types";
import type { VideoProviderResponse } from "@/lib/providers/video/base";
import { awaitCompletion } from "@/lib/providers/poll";

const cache = new Map<string, unknown>();

function defineProvider<R, M>(
	key: string,
	envVar: string,
	RealCtor: new (apiKey: string) => R,
	MockCtor: new () => M,
): () => R | M {
	return () => {
		if (!cache.has(key)) {
			const apiKey = process.env[envVar];
			cache.set(key, apiKey ? new RealCtor(apiKey) : new MockCtor());
		}
		return cache.get(key) as R | M;
	};
}

export const getImageProvider = defineProvider(
	"image",
	"RUNWARE_API_KEY",
	RunwareImage,
	MockImage,
);
export const getVideoProvider = defineProvider(
	"video",
	"RUNWARE_API_KEY",
	RunwareVideo,
	MockVideo,
);
export const getMusicProvider = defineProvider(
	"music",
	"ELEVENLABS_API_KEY",
	ElevenLabsMusic,
	MockMusic,
);
export const getSFXProvider = defineProvider(
	"sfx",
	"ELEVENLABS_API_KEY",
	ElevenLabsSFX,
	MockSFX,
);
export const getLLMProvider = defineProvider(
	"llm",
	"ANTHROPIC_API_KEY",
	AnthropicLLM,
	MockLLM,
);
export const getTTSProvider = defineProvider(
	"tts",
	"CARTESIA_API_KEY",
	CartesiaTTS,
	MockTTS,
);

export type AssetProvider = {
	generate(params: Record<string, unknown>): Promise<BundleResponse>;
	poll?(jobId: string): Promise<VideoProviderResponse>;
};

export function getAssetProvider(type: ConnectorType): AssetProvider {
	switch (type) {
		case "image":
			return getImageProvider() as AssetProvider;
		case "music":
			return getMusicProvider() as AssetProvider;
		case "sfx":
			return getSFXProvider() as AssetProvider;
		case "tts":
			return getTTSProvider() as AssetProvider;
		case "video":
			return getVideoProvider() as AssetProvider;
		default:
			throw new Error(`Unsupported asset connector type: ${type}`);
	}
}

// Runs a provider to completion, hiding the fact that video providers expose a
// submit/poll split while every other type completes synchronously.
export async function runAssetJob(
	type: ConnectorType,
	params: Record<string, unknown>,
): Promise<BundleResponse> {
	const provider = getAssetProvider(type);
	const initial = await provider.generate(params);
	if (type !== "video" || initial.result?.video) return initial;

	const providerJobId = initial.metadata?.jobId as string | undefined;
	if (!providerJobId || !provider.poll) {
		throw new Error("Video provider returned no jobId for async generation");
	}
	const poll = provider.poll.bind(provider);
	const completed: VideoProviderResponse = await awaitCompletion(
		(id) => poll(id),
		providerJobId,
		(r) => !!r.result?.video || r.metadata?.status === "failed",
	);
	if (completed.metadata?.status === "failed") {
		throw new Error(completed.metadata.error ?? "Video generation failed");
	}
	return completed;
}
