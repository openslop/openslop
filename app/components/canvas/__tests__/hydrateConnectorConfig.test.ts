import { describe, expect, it } from "vitest";
import { hydrateConnectorConfig } from "../utils/hydrateConnectorConfig";
import type { CanvasContentElement } from "../types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";

const connectors: ConnectorRegistry = {
	llm: {
		openslop: {
			defaultModel: "llm-v1",
			models: ["llm-v1"],
			isDefault: true,
			apiKey: "",
		},
	},
	tts: {
		openslop: {
			defaultModel: "tts-v1",
			models: ["tts-v1"],
			isDefault: true,
			apiKey: "",
		},
	},
	image: {
		openslop: {
			defaultModel: "img-v1",
			models: ["img-v1"],
			isDefault: true,
			apiKey: "",
		},
	},
	video: {
		openslop: {
			defaultModel: "vid-v1",
			models: ["vid-v1"],
			isDefault: true,
			apiKey: "",
		},
	},
	sfx: {
		openslop: {
			defaultModel: "sfx-v1",
			models: ["sfx-v1"],
			isDefault: true,
			apiKey: "",
		},
	},
	music: {
		openslop: {
			defaultModel: "music-v1",
			models: ["music-v1"],
			isDefault: true,
			apiKey: "",
		},
	},
};

function makeNode(
	type: CanvasContentElement["type"],
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id: "n1",
		type,
		customAttributes,
		children: [{ id: "t1", type, text: "" }],
	};
}

describe("hydrateConnectorConfig", () => {
	const hydrate = hydrateConnectorConfig(connectors);

	it("adds model and provider for a tts element", () => {
		const node = makeNode("narration", { gender: "male" });
		const result = hydrate(node);
		expect(result.customAttributes).toEqual({
			gender: "male",
			model: "tts-v1",
			provider: "openslop",
		});
	});

	it("adds model and provider for an image element", () => {
		const result = hydrate(makeNode("image"));
		expect(result.customAttributes).toMatchObject({
			model: "img-v1",
			provider: "openslop",
		});
	});

	it("adds model and provider for a clip (video) element", () => {
		const result = hydrate(makeNode("clip", { duration: "5" }));
		expect(result.customAttributes).toEqual({
			duration: "5",
			model: "vid-v1",
			provider: "openslop",
		});
	});

	it("returns node unchanged when connector has no model", () => {
		const noModel: ConnectorRegistry = {
			...connectors,
			tts: {
				openslop: {
					defaultModel: "",
					models: [],
					isDefault: true,
					apiKey: "",
				},
			},
		};
		const node = makeNode("narration");
		const result = hydrateConnectorConfig(noModel)(node);
		expect(result).toBe(node);
	});

	it("does not mutate the original node", () => {
		const node = makeNode("narration", { accent: "british" });
		const result = hydrate(node);
		expect(result).not.toBe(node);
		expect(node.customAttributes).toEqual({ accent: "british" });
	});
});
