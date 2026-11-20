import { describe, expect, it } from "vitest";
import { HttpSFXConnector } from "../sfx/connector";
import { mockGatewaySuccess } from "./_gateway-mock";

const TEST_ID = "test-id";
const AUDIO_URL = `/assets/sfx/openslop/${TEST_ID}/output.mp3`;

const config = {
	projectId: "project-1",
	model: { provider: "openslop", model: "Eleven Text to Sound v2" },
} as const;

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
	it("generates audio via provider", async () => {
		mockSuccess();
		const result = await new HttpSFXConnector(config).generate({
			prompt: "explosion",
		});
		expect(result.audioUrl).toBe(AUDIO_URL);
	});

	it("returns the native asset durationSec from metadata (looping is a layout concern)", async () => {
		mockSuccess({ durationSec: 7 });
		const result = await new HttpSFXConnector(config).generate({
			prompt: "footsteps",
		});
		expect(result.durationSec).toBe(7);
	});
});
