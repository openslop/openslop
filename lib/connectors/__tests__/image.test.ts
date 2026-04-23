import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopImage } from "../image/openslop";
import type { AssetResult, ConnectorPlugin } from "../types";

const TEST_ID = "test-id";
const BUNDLE_URL = `/assets/image/openslop/${TEST_ID}`;
const IMAGE_URL = `${BUNDLE_URL}/output.png`;

function jsonResponse(data: unknown) {
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

function mockFetchChain() {
	vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
		jsonResponse({
			id: TEST_ID,
			provider: "openslop",
			result: { image: "output.png" },
		}),
	);
}

describe("BaseImageConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("generates image via provider", async () => {
		mockFetchChain();
		const connector = new OpenSlopImage({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
		});
		const result = await connector.generate({ prompt: "a cat" });
		expect(result.url).toBe(IMAGE_URL);
	});

	it("runs afterGenerate plugin", async () => {
		mockFetchChain();
		const replacement: AssetResult = {
			url: "https://example.com/replaced.png",
			durationSec: 0,
		};
		const plugin: ConnectorPlugin = {
			name: "resize",
			afterGenerate: () => replacement,
		};
		const connector = new OpenSlopImage({
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
			apiKey: "",
			plugins: [plugin],
		});
		const result = await connector.generate({ prompt: "test" });
		expect(result.url).toBe("https://example.com/replaced.png");
	});
});
