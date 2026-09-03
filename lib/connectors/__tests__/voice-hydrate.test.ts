import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMetadataVoicePlugin } from "@/lib/connectors/tts/plugins/metadata-voice";
import { createVoiceHydratePlugin } from "@/lib/connectors/tts/plugins/voice-hydrate";
import { createVoiceSearchPlugin } from "@/lib/connectors/tts/plugins/voice-search";
import type {
	PluginContext,
	TTSGenerateParams,
	VoiceInfo,
} from "@/lib/connectors/types";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { stateCtx } from "./_state-ctx";

let store: ProjectStore;

beforeEach(() => {
	store = createProjectStore();
});

function ctxWith(voices: VoiceInfo[]): PluginContext<TTSGenerateParams> {
	return {
		searchVoices: vi.fn(async () => voices),
		...stateCtx(store),
	};
}

async function runPipeline(
	params: TTSGenerateParams,
	ctx: PluginContext<TTSGenerateParams>,
): Promise<TTSGenerateParams> {
	const plugins = [
		createMetadataVoicePlugin(),
		createVoiceSearchPlugin(),
		createVoiceHydratePlugin(store),
	];
	let current = params;
	for (const plugin of plugins) {
		current = (await plugin.beforeGenerate?.(current, ctx)) ?? current;
	}
	return current;
}

describe("voice-hydrate end-to-end", () => {
	it("caches resolved voice on the character (not narration) when params.name is set", async () => {
		store.getState().updateMetadata({
			characters: {
				Red: { appearance: "A girl", gender: "feminine" },
			},
		});
		const ctx = ctxWith([{ id: "v-red", name: "Red Voice", description: "" }]);

		await runPipeline({ prompt: "hi", name: "Red" }, ctx);

		const state = store.getState();
		expect(state.metadata.characters["Red"]?.resolvedVoiceId).toBe("v-red");
		expect(state.metadata.narration.resolvedVoiceId).toBeUndefined();
	});

	it("caches resolved voice on narration when params.name is absent", async () => {
		store.getState().updateMetadata({ narration: { gender: "masculine" } });
		const ctx = ctxWith([
			{ id: "v-narrator", name: "Narrator Voice", description: "" },
		]);

		await runPipeline({ prompt: "hi" }, ctx);

		const state = store.getState();
		expect(state.metadata.narration.resolvedVoiceId).toBe("v-narrator");
	});

	it("remembers the id on the pair it was found on", async () => {
		store.getState().updateMetadata({ narration: { gender: "masculine" } });
		const ctx = ctxWith([{ id: "v-found", name: "Found", description: "" }]);

		await runPipeline({ prompt: "hi", ...DEFAULT_TTS_MODEL }, ctx);

		expect(store.getState().metadata.narration).toMatchObject({
			...DEFAULT_TTS_MODEL,
			resolvedVoiceId: "v-found",
		});
	});

	it("moves the voice to the element's pair, leaving the picked id behind", async () => {
		store.getState().updateMetadata({
			narration: {
				provider: "cartesia",
				model: "Sonic 3.5",
				voiceId: "v-cartesia",
				resolvedVoiceId: "v-cartesia",
			},
		});
		const ctx = ctxWith([{ id: "v-slop", name: "Slop", description: "" }]);

		const params = await runPipeline(
			{ prompt: "hi", ...DEFAULT_TTS_MODEL },
			ctx,
		);

		expect(params.voiceId).toBe("v-slop");
		expect(store.getState().metadata.narration).toEqual({
			...DEFAULT_TTS_MODEL,
			resolvedVoiceId: "v-slop",
		});
	});

	it("skips the search and the write when the voice already has an id on this pair", async () => {
		store.getState().updateMetadata({
			narration: { ...DEFAULT_TTS_MODEL, voiceId: "v-picked" },
		});
		const ctx = ctxWith([{ id: "v-other", name: "Other", description: "" }]);
		const before = store.getState().metadata.narration;

		const params = await runPipeline(
			{ prompt: "hi", ...DEFAULT_TTS_MODEL },
			ctx,
		);

		expect(params.voiceId).toBe("v-picked");
		expect(ctx.searchVoices).not.toHaveBeenCalled();
		expect(store.getState().metadata.narration).toBe(before);
	});
});
