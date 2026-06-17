import { describe, expect, it } from "vitest";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { buildGenerationJob } from "../buildGenerationJob";

const PROJECT_ID = "00000000-0000-4000-8000-000000000000";

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
	animated_image: {
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
		children: [{ id: "t1", type, text }],
	};
}

describe("buildGenerationJob", () => {
	it("builds a narration job", () => {
		const el = makeElement("narration", "Hello world", { emotion: "happy" });
		const job = buildGenerationJob(el, registry, PROJECT_ID);

		expect(job).toEqual({
			elementId: "el-1",
			connectorType: "tts",
			provider: "openslop",
			config: expect.objectContaining({ defaultModel: "Slop TTS v1" }),
			projectId: PROJECT_ID,
			element: el,
		});
	});

	it("builds an image job", () => {
		const el = makeElement("image", "A sunset over the ocean");
		const job = buildGenerationJob(el, registry, PROJECT_ID);

		expect(job).toEqual({
			elementId: "el-1",
			connectorType: "image",
			provider: "openslop",
			config: expect.objectContaining({ defaultModel: "Slop Image v1" }),
			projectId: PROJECT_ID,
			element: el,
		});
	});

	it("routes clip elements to the video connector", () => {
		const el = makeElement("clip", "A car chase", { duration: "10" });
		const job = buildGenerationJob(el, registry, PROJECT_ID);
		expect(job.connectorType).toBe("video");
	});

	it("uses provider attribute when set", () => {
		const el = makeElement("image", "A cat", { provider: "openslop" });
		const job = buildGenerationJob(el, registry, PROJECT_ID);
		expect(job.provider).toBe("openslop");
	});

	it("defaults provider to openslop when not set", () => {
		const el = makeElement("image", "A bird");
		const job = buildGenerationJob(el, registry, PROJECT_ID);
		expect(job.provider).toBe("openslop");
	});

	it("preserves the element on the job", () => {
		const el = makeElement("character", "Hello", {
			name: "Lyra",
			emotion: "excited",
		});
		const job = buildGenerationJob(el, registry, PROJECT_ID);
		expect(job.element).toBe(el);
	});

	it("handles element with no customAttributes", () => {
		const el: CanvasContentElement = {
			id: "el-1",
			type: "image",
			children: [{ id: "t", type: "image", text: "A forest" }],
		};
		const job = buildGenerationJob(el, registry, PROJECT_ID);
		expect(job.provider).toBe("openslop");
		expect(job.element).toBe(el);
	});
});
