import { describe, expect, it, vi } from "vitest";
import { BaseConnector } from "../base";
import type {
	ConnectorPlugin,
	ConnectorType,
	ResolvedConnectorConfig,
} from "../types";

class TestConnector extends BaseConnector {
	readonly type: ConnectorType = "llm";
	protected async _generate(): Promise<unknown> {
		return {};
	}
}

describe("BaseConnector", () => {
	const model = { provider: "openslop", model: "Slop LLM v1" } as const;
	const config: ResolvedConnectorConfig = {
		model,
		plugins: [{ name: "p1" }],
	};

	it("extracts plugins from config", () => {
		const c = new TestConnector(config);
		expect((c as unknown as { plugins: unknown[] }).plugins).toHaveLength(1);
	});

	it("stamps its own model onto every generation", async () => {
		const seen: unknown[] = [];
		const c = new TestConnector({
			model,
			plugins: [{ name: "spy", beforeGenerate: (p) => (seen.push(p), p) }],
		});
		await c.generate({ prompt: "hi" });
		expect(seen[0]).toEqual({ prompt: "hi", ...model });
	});

	it("defaults plugins to empty array", () => {
		const c = new TestConnector({ model });
		expect((c as unknown as { plugins: unknown[] }).plugins).toEqual([]);
	});

	it("runs onError when transformPrompt throws", async () => {
		const onError = vi.fn();
		const plugins: ConnectorPlugin[] = [
			{
				name: "bad-transform",
				transformPrompt: () => {
					throw new Error("transform failed");
				},
				onError,
			},
		];
		const c = new TestConnector({ model, plugins });
		await expect(c.generate({ prompt: "hi" })).rejects.toThrow(
			"transform failed",
		);
		expect(onError).toHaveBeenCalledWith(
			expect.stringContaining("transform failed"),
			expect.any(Object),
		);
	});

	it("runs onError when beforeGenerate throws", async () => {
		const onError = vi.fn();
		const plugins: ConnectorPlugin[] = [
			{
				name: "bad-before",
				beforeGenerate: () => {
					throw new Error("before failed");
				},
				onError,
			},
		];
		const c = new TestConnector({ model, plugins });
		await expect(c.generate({ prompt: "hi" })).rejects.toThrow("before failed");
		expect(onError).toHaveBeenCalledWith(
			expect.stringContaining("before failed"),
			expect.any(Object),
		);
	});
});
