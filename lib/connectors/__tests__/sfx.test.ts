import { describe, expect, it, vi, beforeEach } from "vitest";
import { HttpSFXConnector } from "../sfx/connector";
import type { ConnectorPlugin } from "../types";
import { mockGatewaySuccess } from "./_gateway-mock";

const TEST_ID = "test-id";
const AUDIO_URL = `/assets/sfx/openslop/${TEST_ID}/output.mp3`;

const config = { provider: "openslop" } as const;

function mockSuccess(metadata?: Record<string, unknown>) {
	mockGatewaySuccess({
		id: TEST_ID,
		type: "sfx",
		provider: "openslop",
		result: { audio: "output.mp3" },
		...(metadata && { metadata }),
	});
}

describe("BaseSFXConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("generates audio via provider", async () => {
		mockSuccess();
		const result = await new HttpSFXConnector(config).generate({
			prompt: "explosion",
		});
		expect(result.audioUrl).toBe(AUDIO_URL);
	});

	it("runs plugins in order", async () => {
		mockSuccess();
		const order: string[] = [];
		const plugin: ConnectorPlugin = {
			name: "tracker",
			transformPrompt: (p) => {
				order.push("transform");
				return p;
			},
			beforeGenerate: (p) => {
				order.push("before");
				return p;
			},
			afterGenerate: (r) => {
				order.push("after");
				return r;
			},
		};
		await new HttpSFXConnector({ ...config, plugins: [plugin] }).generate({
			prompt: "test",
		});
		expect(order).toEqual(["transform", "before", "after"]);
	});

	it("returns the native asset durationSec from metadata (looping is a layout concern)", async () => {
		mockSuccess({ durationSec: 7 });
		const result = await new HttpSFXConnector(config).generate({
			prompt: "footsteps",
		});
		expect(result.durationSec).toBe(7);
	});
});
