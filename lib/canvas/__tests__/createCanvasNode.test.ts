import { describe, expect, it, vi } from "vitest";

vi.mock("../elementConfigs", () => ({
	ELEMENT_CONFIGS: {
		sound: {
			type: "sound",
			connector: "sfx",
			outputKind: "audio",
			label: "Sound",
			defaultAttributes: { loops: "1" },
			visibleAttributes: {},
		},
		narration: {
			type: "narration",
			connector: "tts",
			outputKind: "audio",
			label: "Narration",
			defaultAttributes: undefined,
			visibleAttributes: {},
		},
		image: {
			type: "image",
			connector: "image",
			outputKind: "image",
			label: "Image",
			defaultAttributes: undefined,
			visibleAttributes: {},
		},
	},
}));

vi.mock("../hydrateConnectorConfig", () => ({
	hydrateConnectorConfig: () => (node: Record<string, unknown>) => ({
		...node,
		customAttributes: {
			...(node.customAttributes as Record<string, string> | undefined),
			model: "test-model",
			provider: "openslop",
		},
	}),
}));

import { createCanvasNode } from "../createCanvasNode";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";

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
