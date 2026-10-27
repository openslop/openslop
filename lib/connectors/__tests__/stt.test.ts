import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpSTTConnector } from "../stt/connector";
import { mockGatewaySequence } from "./_gateway-mock";
import { toCaption } from "@/lib/captions/word-captions";

describe("HttpSTTConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("reads the word timings from the bundle, with no media of its own", async () => {
		const words = [toCaption("hi", 0, 0.4)];
		mockGatewaySequence([
			{ submitStatus: "pending" },
			{
				pollStatus: "completed",
				result: {
					id: "t1",
					type: "stt",
					provider: "elevenlabs",
					result: { timestamps: "timestamps.json" },
					metadata: { durationSec: 3 },
				},
			},
			{ payload: words },
		]);

		const result = await new HttpSTTConnector({
			model: { provider: "openslop", model: "Slop STT v1" },
		}).generate({ prompt: "", mediaUrl: "https://blob/v.mp4" });

		expect(result).toEqual({ durationSec: 3, textTimestamps: words });
	});
});
