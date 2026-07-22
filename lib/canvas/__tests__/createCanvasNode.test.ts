import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/connectors/registry", () => ({
	getDefaultConnector: () => ({
		provider: "openslop",
		config: {
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
		},
	}),
}));

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: (type: string) => ({
		defaultAttributes: type === "sfx" ? { loops: "1" } : {},
		visibleAttributes: {},
		keys: [],
	}),
}));

import { createCanvasNode } from "../createCanvasNode";
import type { ConnectorRegistry } from "@/lib/connectors/registry";

const ZWSP = "​";

const connectors = {} as ConnectorRegistry;

describe("createCanvasNode", () => {
	it("backfills defaultAttributes for sound (loops=1)", () => {
		const node = createCanvasNode("sound", connectors);
		expect(node.customAttributes?.loops).toBe("1");
	});

	it("caller-supplied attrs override defaults", () => {
		const node = createCanvasNode("sound", connectors, {
			attrs: { loops: "3" },
		});
		expect(node.customAttributes?.loops).toBe("3");
	});

	it("merges defaults under caller attrs (caller wins, defaults fill gaps)", () => {
		const node = createCanvasNode("sound", connectors, {
			attrs: { effect: "thunder" },
		});
		expect(node.customAttributes).toMatchObject({
			loops: "1",
			effect: "thunder",
		});
	});

	it("hydrates connector model and provider", () => {
		const node = createCanvasNode("narration", connectors);
		expect(node.customAttributes?.model).toBe("test-model");
		expect(node.customAttributes?.provider).toBe("openslop");
	});

	it("preserves provided id", () => {
		const node = createCanvasNode("image", connectors, { id: "abc" });
		expect(node.id).toBe("abc");
	});

	it("generates a fresh id when none provided", () => {
		const node = createCanvasNode("image", connectors);
		expect(node.id).toBeTruthy();
		expect(typeof node.id).toBe("string");
	});

	it("creates [ZWSP, text] children with trimmed text", () => {
		const node = createCanvasNode("narration", connectors, {
			text: "  hello  ",
		});
		expect(node.children).toHaveLength(2);
		expect(node.children[0].text).toBe(ZWSP);
		expect(node.children[1].text).toBe("hello");
	});

	it("defaults text child to empty string", () => {
		const node = createCanvasNode("narration", connectors);
		expect(node.children[1].text).toBe("");
	});
});

describe("createCanvasNode — no default model configured", () => {
	it("still applies schema defaults but skips stamping model/provider", async () => {
		vi.resetModules();
		vi.doMock("@/lib/connectors/registry", () => ({
			getDefaultConnector: () => ({
				provider: "openslop",
				config: { defaultModel: "", models: [], isDefault: true },
			}),
		}));
		const { createCanvasNode: createCanvasNodeNoModel } =
			await import("../createCanvasNode");
		const node = createCanvasNodeNoModel("sound", connectors);
		expect(node.customAttributes).toEqual({ loops: "1" });
	});
});
