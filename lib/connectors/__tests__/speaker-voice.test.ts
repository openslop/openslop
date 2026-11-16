import { describe, expect, it } from "vitest";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { createCanvasElement } from "@/lib/canvas/create-canvas-element";
import { resolveElementConnector } from "@/lib/canvas/element-connector";
import { createSpeakerVoicePlugin } from "@/lib/connectors/tts/plugins/speaker-voice";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import type { TTSGenerateParams } from "@/lib/connectors/types";
import type { Voice } from "@/lib/project/types";
import { dependenciesOf, pluginCtx } from "./_state-ctx";

const CARTESIA = { provider: "cartesia", model: "Sonic 3.6" } as const;

const plugin = createSpeakerVoicePlugin();

const line = (name?: string) =>
	createCanvasElement("speech", { id: "s1", attrs: name ? { name } : {} });

const voice = (name: string, attrs: Partial<Voice> = {}) =>
	asset("asset_voice", { name, attrs });

const speaking = (name: string, voiceId?: string) =>
	pluginCtx({
		dependencies: voiceId
			? { [`${name}'s voice`]: { durationSec: 0, voiceId } }
			: {},
	});

const before = async (
	params: TTSGenerateParams,
	ctx: ReturnType<typeof speaking>,
) => {
	if (!plugin.beforeGenerate) throw new Error("no beforeGenerate");
	return plugin.beforeGenerate({ ...DEFAULT_TTS_MODEL, ...params }, ctx);
};

describe("createSpeakerVoicePlugin", () => {
	describe("what it depends on", () => {
		it("depends on the voice of the speaker a line names, and none while it names no one", () => {
			const red = voice("Red");

			expect(dependenciesOf(plugin, line("Red"), [red])).toEqual({
				"Red's voice": red.id,
			});
			expect(dependenciesOf(plugin, line(), [red])).toEqual({});
		});

		it("depends on no voice while the speaker has none", () => {
			expect(dependenciesOf(plugin, line("Ghost"), [])).toEqual({});
		});
	});

	it("speaks on its voice's model", () => {
		expect(
			resolveElementConnector(line("Red"), DEFAULT_CONNECTOR_REGISTRY, [
				voice("Red", CARTESIA),
			]).model,
		).toEqual(CARTESIA);
	});

	describe("beforeGenerate", () => {
		it("speaks in the voice its speaker's voice found, over its own", async () => {
			await expect(
				before(
					{ prompt: "hi", name: "Red", voiceId: "v-own", speed: "fast" },
					speaking("Red", "v-red"),
				),
			).resolves.toEqual({
				prompt: "hi",
				name: "Red",
				...DEFAULT_TTS_MODEL,
				voiceId: "v-red",
				speed: "fast",
			});
		});

		it("throws while it names no speaker", async () => {
			await expect(before({ prompt: "hi" }, speaking("Red"))).rejects.toThrow(
				"Pick who says this line",
			);
		});

		it("throws while its speaker has no voice", async () => {
			await expect(
				before({ prompt: "hi", name: "Ghost" }, speaking("Ghost")),
			).rejects.toThrow("Ghost has no voice");
		});
	});
});
