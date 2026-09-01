import { describe, expect, it, vi, beforeEach } from "vitest";
import { HttpLLMConnector } from "../llm/connector";
import type { ConnectorPlugin } from "../types";

function mockJsonResponse(data: unknown) {
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

const llmResult = { text: "Hello", model: "test-model" };

describe("BaseLLMConnector", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			mockJsonResponse(llmResult),
		);
	});

	it("runs transformPrompt plugin", async () => {
		let transformedPrompt = "";
		const plugin: ConnectorPlugin = {
			name: "transform",
			transformPrompt: (p) => {
				transformedPrompt = `transformed: ${p}`;
				return transformedPrompt;
			},
		};
		const connector = new HttpLLMConnector({
			provider: "openslop",
			plugins: [plugin],
		});
		await connector.generate({ prompt: "test" });
		expect(transformedPrompt).toBe("transformed: test");
	});

	it("runs afterGenerate plugin", async () => {
		const plugin: ConnectorPlugin = {
			name: "after",
			afterGenerate: (r) => ({
				...(r as object),
				text: "modified",
			}),
		};
		const connector = new HttpLLMConnector({
			provider: "openslop",
			plugins: [plugin],
		});
		const result = await connector.generate({ prompt: "test" });
		expect(result.text).toBe("modified");
	});

	it("runs onError plugin when _generate fails", async () => {
		vi.mocked(fetch).mockRejectedValue(new Error("generation failed"));
		const errors: string[] = [];
		const plugin: ConnectorPlugin = {
			name: "error-handler",
			onError: (e) => void errors.push(e),
		};

		const connector = new HttpLLMConnector({
			provider: "openslop",
			plugins: [plugin],
		});

		await expect(connector.generate({ prompt: "test" })).rejects.toThrow(
			"generation failed",
		);
		expect(errors[0]).toContain("generation failed");
	});

	it("runs plugins in order", async () => {
		const order: string[] = [];
		const plugins: ConnectorPlugin[] = [
			{
				name: "first",
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
			},
		];
		const connector = new HttpLLMConnector({
			provider: "openslop",
			plugins,
		});
		await connector.generate({ prompt: "test" });
		expect(order).toEqual(["transform", "before", "after"]);
	});

	it("hands the caller's abort signal to the stream request", async () => {
		const fetchMock = vi.mocked(fetch);
		const connector = new HttpLLMConnector({ provider: "openslop" });
		const controller = new AbortController();

		await connector.stream({ prompt: "test" }, controller.signal).next();

		expect(fetchMock).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ signal: controller.signal }),
		);
	});

	it("runs onError when transformPrompt throws during stream", async () => {
		const onError = vi.fn();
		const connector = new HttpLLMConnector({
			provider: "openslop",
			plugins: [
				{
					name: "bad-transform",
					transformPrompt: () => {
						throw new Error("transform failed");
					},
					onError,
				},
			],
		});
		const gen = connector.stream({ prompt: "test" });
		await expect(gen.next()).rejects.toThrow("transform failed");
		expect(onError).toHaveBeenCalledWith(
			expect.stringContaining("transform failed"),
			expect.any(Object),
		);
	});

	it("runs onError when beforeGenerate throws during stream", async () => {
		const onError = vi.fn();
		const connector = new HttpLLMConnector({
			provider: "openslop",
			plugins: [
				{
					name: "bad-before",
					beforeGenerate: () => {
						throw new Error("before failed");
					},
					onError,
				},
			],
		});
		const gen = connector.stream({ prompt: "test" });
		await expect(gen.next()).rejects.toThrow("before failed");
		expect(onError).toHaveBeenCalledWith(
			expect.stringContaining("before failed"),
			expect.any(Object),
		);
	});
});
