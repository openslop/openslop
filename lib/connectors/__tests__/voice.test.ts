import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpVoiceConnector } from "../voice/connector";
import { mockGatewaySequence } from "./_gateway-mock";

const connector = () =>
	new HttpVoiceConnector({
		model: { provider: "cartesia", model: "Sonic 3.6" },
	});

const PREVIEW = { url: "https://assets/preview.wav", durationSec: 3 };

const queryOf = (fetch: ReturnType<typeof mockGatewaySequence>, call: number) =>
	new URL(String(fetch.mock.calls[call]?.[0]), "http://app").searchParams;

describe("HttpVoiceConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("generates the first voice its traits find, heard through its preview", async () => {
		const fetch = mockGatewaySequence([
			{ payload: { voices: [{ id: "v-found" }, { id: "v-other" }] } },
			{ payload: { preview: PREVIEW } },
		]);

		await expect(
			connector().generate({
				prompt: "",
				gender: "masculine",
				accent: "british",
			}),
		).resolves.toEqual({
			voiceId: "v-found",
			audioUrl: PREVIEW.url,
			durationSec: PREVIEW.durationSec,
		});
		expect(queryOf(fetch, 0).has("language")).toBe(false);
		expect(Object.fromEntries(queryOf(fetch, 0))).toMatchObject({
			gender: "masculine",
			accent: "british",
			limit: "1",
		});
		expect(queryOf(fetch, 1).get("voiceId")).toBe("v-found");
	});

	it("generates the voice the user picked, without searching", async () => {
		const fetch = mockGatewaySequence([{ payload: { preview: PREVIEW } }]);

		await expect(
			connector().generate({
				prompt: "",
				gender: "masculine",
				pickedVoiceId: "v-picked",
			}),
		).resolves.toMatchObject({ voiceId: "v-picked", audioUrl: PREVIEW.url });
		expect(fetch).toHaveBeenCalledOnce();
		expect(queryOf(fetch, 0).get("voiceId")).toBe("v-picked");
	});

	it("throws when no voice matches", async () => {
		mockGatewaySequence([{ payload: { voices: [] } }]);

		await expect(connector().generate({ prompt: "" })).rejects.toThrow(
			"No matching voice found",
		);
	});
});
