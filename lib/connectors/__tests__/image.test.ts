import { describe, expect, it } from "vitest";
import { HttpImageConnector } from "../image/connector";
import { mockGatewaySuccess } from "./_gateway-mock";

const TEST_ID = "test-id";
const BUNDLE_URL = `/assets/image/openslop/${TEST_ID}`;
const IMAGE_URL = `${BUNDLE_URL}/output.png`;

const config = {
	projectId: "project-1",
	model: { provider: "openslop", model: "Seedream 5 Lite" },
} as const;

function mockSuccess() {
	mockGatewaySuccess({
		id: TEST_ID,
		type: "image",
		provider: "openslop",
		result: { image: "output.png" },
	});
}

describe("BaseImageConnector", () => {
	it("generates image via provider", async () => {
		mockSuccess();
		const result = await new HttpImageConnector(config).generate({
			prompt: "a cat",
		});
		expect(result.imageUrl).toBe(IMAGE_URL);
	});
});
