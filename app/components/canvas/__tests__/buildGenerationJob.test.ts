import { describe, expect, it } from "vitest";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type { CanvasContentElement } from "../types";
import { buildGenerationJob } from "../utils/buildGenerationJob";
import { ZERO_WIDTH_SPACE } from "../config/constants";

const registry: ConnectorRegistry = {
	llm: {
		openslop: {
			defaultModel: "Slop LLM v1",
			models: ["Slop LLM v1"],
			isDefault: true,
		},
	},
	tts: {
		openslop: {
			defaultModel: "Slop TTS v1",
			models: ["Slop TTS v1"],
			isDefault: true,
		},
	},
	image: {
		openslop: {
			defaultModel: "Slop Image v1",
			models: ["Slop Image v1"],
			isDefault: true,
		},
	},
	video: {
		openslop: {
			defaultModel: "Slop Video v1",
			models: ["Slop Video v1"],
			isDefault: true,
		},
	},
	sfx: {
		openslop: {
			defaultModel: "Slop SFX v1",
			models: ["Slop SFX v1"],
			isDefault: true,
		},
	},
	music: {
		openslop: {
			defaultModel: "Slop Music v1",
			models: ["Slop Music v1"],
			isDefault: true,
		},
	},
};

function makeElement(
	type: CanvasContentElement["type"],
	text: string,
	attrs?: Record<string, string>,
): CanvasContentElement {
	return {
		id: "el-1",
		type,
		customAttributes: attrs,
		children: [
			{ id: "t0", type, text: ZERO_WIDTH_SPACE },
			{ id: "t1", type, text },
		],
	};
}

describe("buildGenerationJob", () => {
	it("builds a job for a narration element", () => {
		const el = makeElement("narration", "Hello world", {
			emotion: "happy",
		});
		const job = buildGenerationJob(el, registry);

		expect(job).toMatchObject({
			elementId: "el-1",
			connectorType: "tts",
			provider: "openslop",
			prompt: "Hello world",
			extraParams: { emotion: "happy" },
		});
	});

	it("builds a job for an image element", () => {
		const el = makeElement("image", "A sunset over the ocean");
		const job = buildGenerationJob(el, registry);

		expect(job).toEqual({
			elementId: "el-1",
			connectorType: "image",
			provider: "openslop",
			config: expect.objectContaining({ defaultModel: "Slop Image v1" }),
			prompt: "A sunset over the ocean",
			extraParams: {},
			inputs: { prompt: "A sunset over the ocean", attributes: {} },
		});
	});

	it("builds a job for a clip element with duration param", () => {
		const el = makeElement("clip", "A car chase", { duration: "10" });
		const job = buildGenerationJob(el, registry);

		expect(job).toEqual({
			elementId: "el-1",
			connectorType: "video",
			provider: "openslop",
			config: expect.objectContaining({ defaultModel: "Slop Video v1" }),
			prompt: "A car chase",
			extraParams: { duration: "10" },
			inputs: { prompt: "A car chase", attributes: { duration: "10" } },
		});
	});

	it("returns null when prompt is empty", () => {
		const el = makeElement("narration", "");
		expect(buildGenerationJob(el, registry)).toBeNull();
	});

	it("returns null when prompt is only whitespace", () => {
		const el = makeElement("narration", "   ");
		expect(buildGenerationJob(el, registry)).toBeNull();
	});

	it("returns null when prompt is only zero-width space", () => {
		const el: CanvasContentElement = {
			id: "el-1",
			type: "narration",
			children: [{ id: "t0", type: "narration", text: ZERO_WIDTH_SPACE }],
		};
		expect(buildGenerationJob(el, registry)).toBeNull();
	});

	it("strips zero-width space from prompt", () => {
		const el = makeElement("narration", `${ZERO_WIDTH_SPACE}Hello`);
		const job = buildGenerationJob(el, registry);
		expect(job?.prompt).toBe("Hello");
	});

	it("overrides defaultModel when model attribute is set", () => {
		const el = makeElement("image", "A dog", { model: "Custom Model v2" });
		const job = buildGenerationJob(el, registry);
		expect(job?.config.defaultModel).toBe("Custom Model v2");
	});

	it("uses provider attribute when set", () => {
		const el = makeElement("image", "A cat", { provider: "openslop" });
		const job = buildGenerationJob(el, registry);
		expect(job?.provider).toBe("openslop");
	});

	it("defaults provider to openslop when not set", () => {
		const el = makeElement("image", "A bird");
		const job = buildGenerationJob(el, registry);
		expect(job?.provider).toBe("openslop");
	});

	it("passes all custom attributes as extraParams", () => {
		const el = makeElement("character", "Hello", {
			name: "Lyra",
			emotion: "excited",
		});
		const job = buildGenerationJob(el, registry);
		expect(job?.extraParams).toEqual({
			name: "Lyra",
			emotion: "excited",
		});
	});

	it("builds a job for a music element with no generateParams", () => {
		const el = makeElement("music", "Epic orchestral music");
		const job = buildGenerationJob(el, registry);
		expect(job?.connectorType).toBe("music");
		expect(job?.extraParams).toEqual({});
	});

	it("handles element with no customAttributes", () => {
		const el: CanvasContentElement = {
			id: "el-1",
			type: "image",
			children: [{ id: "t0", type: "image", text: "A forest" }],
		};
		const job = buildGenerationJob(el, registry);
		expect(job?.provider).toBe("openslop");
		expect(job?.prompt).toBe("A forest");
	});
});
