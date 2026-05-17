import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenSlopImage } from "../image/openslop";
import type { AssetResult, ConnectorPlugin } from "../types";
import { mockGatewaySuccess } from "./_gateway-mock";

const TEST_ID = "test-id";
const BUNDLE_URL = `/assets/image/openslop/${TEST_ID}`;
const IMAGE_URL = `${BUNDLE_URL}/output.png`;

const config = {
	defaultModel: "test-model",
	models: ["test-model"],
	isDefault: true,
	apiKey: "",
};

function mockSuccess() {
	mockGatewaySuccess({
		id: TEST_ID,
		provider: "openslop",
		result: { image: "output.png" },
	});
}

describe("BaseImageConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("generates image via provider", async () => {
		mockSuccess();
		const result = await new OpenSlopImage(config).generate({
			prompt: "a cat",
		});
		expect(result.url).toBe(IMAGE_URL);
	});

	it("runs afterGenerate plugin", async () => {
		mockSuccess();
		const replacement: AssetResult = {
			url: "https://example.com/replaced.png",
			durationSec: 0,
		};
		const plugin: ConnectorPlugin = {
			name: "resize",
			afterGenerate: () => replacement,
		};
		const result = await new OpenSlopImage({
			...config,
			plugins: [plugin],
		}).generate({ prompt: "test" });
		expect(result.url).toBe("https://example.com/replaced.png");
	});
});
