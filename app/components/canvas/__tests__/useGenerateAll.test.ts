import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Descendant } from "slate";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type { GenerationJob } from "@/lib/generation/queue";
import type { CanvasContentElement, SceneElement } from "../types";

const registry: ConnectorRegistry = {
	llm: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	tts: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	image: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	video: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	sfx: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	music: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
};

vi.mock("@/lib/config/ConfigProvider", () => ({
	useConfig: () => ({ projectId: "test-project", connectorConfig: registry }),
}));

vi.mock("react", () => ({
	useCallback: <T>(fn: T) => fn,
}));

const enqueueAllSpy = vi.fn();
const getElementSnapshotSpy = vi.fn();

vi.mock("@/lib/generation/queue", async () => {
	const actual = await vi.importActual<
		typeof import("@/lib/generation/generationInputs")
	>("@/lib/generation/generationInputs");
	const queue = {
		enqueueAll: (...args: unknown[]) => enqueueAllSpy(...args),
		getElementSnapshot: (...args: unknown[]) => getElementSnapshotSpy(...args),
		before() {
			return this;
		},
	};
	return { generationQueue: queue, isStaleResult: actual.isStaleResult };
});

vi.mock("@/lib/project/ensureCharacterAvatars", () => ({
	ensureCharacterAvatars: vi.fn(),
}));

function makeElement(
	id: string,
	type: CanvasContentElement["type"],
	text: string,
	attrs?: Record<string, string>,
): CanvasContentElement {
	return {
		id,
		type,
		customAttributes: attrs,
		children: [{ id: `${id}-t`, type, text }],
	};
}

function wrapInScene(elements: CanvasContentElement[]): SceneElement {
	return { id: "scene-1", type: "scene", children: elements };
}

beforeEach(() => {
	vi.clearAllMocks();
	getElementSnapshotSpy.mockReturnValue({
		status: "idle",
		seconds: 0,
		result: null,
		error: null,
		resultInputs: null,
	});
});

describe("useGenerateAll", () => {
	it("enqueues jobs for all elements without results", async () => {
		const { useGenerateAll } = await import("../hooks/useGenerateAll");
		const children: Descendant[] = [
			wrapInScene([
				makeElement("a", "image", "sunset"),
				makeElement("b", "narration", "hello"),
			]),
		];
		const editor = { children } as unknown as Parameters<
			typeof useGenerateAll
		>[0];

		const { generateAll } = useGenerateAll(editor);
		generateAll();

		expect(enqueueAllSpy).toHaveBeenCalledOnce();
		const jobs: GenerationJob[] = enqueueAllSpy.mock.calls[0][0];
		expect(jobs).toHaveLength(2);
		expect(jobs.map((j) => j.elementId)).toEqual(["a", "b"]);
	});

	it("skips elements that already have a current result", async () => {
		getElementSnapshotSpy.mockImplementation((id: string) => ({
			status: "idle",
			seconds: 0,
			result: id === "a" ? { url: "https://example.com/img.png" } : null,
			error: null,
			resultInputs: id === "a" ? { prompt: "sunset", attributes: {} } : null,
		}));

		const { useGenerateAll } = await import("../hooks/useGenerateAll");
		const children: Descendant[] = [
			wrapInScene([
				makeElement("a", "image", "sunset"),
				makeElement("b", "narration", "hello"),
			]),
		];
		const editor = { children } as unknown as Parameters<
			typeof useGenerateAll
		>[0];

		const { generateAll } = useGenerateAll(editor);
		generateAll();

		const jobs: GenerationJob[] = enqueueAllSpy.mock.calls[0][0];
		expect(jobs).toHaveLength(1);
		expect(jobs[0].elementId).toBe("b");
	});

	it("re-generates elements with stale prompt", async () => {
		getElementSnapshotSpy.mockImplementation((id: string) => ({
			status: "idle",
			seconds: 0,
			result: id === "a" ? { url: "https://example.com/img.png" } : null,
			error: null,
			resultInputs:
				id === "a" ? { prompt: "old prompt", attributes: {} } : null,
		}));

		const { useGenerateAll } = await import("../hooks/useGenerateAll");
		const children: Descendant[] = [
			wrapInScene([
				makeElement("a", "image", "new prompt"),
				makeElement("b", "narration", "hello"),
			]),
		];
		const editor = { children } as unknown as Parameters<
			typeof useGenerateAll
		>[0];

		const { generateAll } = useGenerateAll(editor);
		generateAll();

		const jobs: GenerationJob[] = enqueueAllSpy.mock.calls[0][0];
		expect(jobs).toHaveLength(2);
		expect(jobs.map((j) => j.elementId)).toEqual(["a", "b"]);
	});

	it("re-generates elements with stale attributes", async () => {
		getElementSnapshotSpy.mockImplementation((id: string) => ({
			status: "idle",
			seconds: 0,
			result: id === "a" ? { url: "https://example.com/img.png" } : null,
			error: null,
			resultInputs:
				id === "a" ? { prompt: "hello", attributes: { gender: "Male" } } : null,
		}));

		const { useGenerateAll } = await import("../hooks/useGenerateAll");
		const children: Descendant[] = [
			wrapInScene([
				makeElement("a", "narration", "hello", { gender: "Female" }),
				makeElement("b", "image", "sunset"),
			]),
		];
		const editor = { children } as unknown as Parameters<
			typeof useGenerateAll
		>[0];

		const { generateAll } = useGenerateAll(editor);
		generateAll();

		const jobs: GenerationJob[] = enqueueAllSpy.mock.calls[0][0];
		expect(jobs).toHaveLength(2);
		expect(jobs.map((j) => j.elementId)).toEqual(["a", "b"]);
	});

	it("enqueues nothing when all elements have current results", async () => {
		getElementSnapshotSpy.mockImplementation((id: string) => {
			const inputs: Record<
				string,
				{ prompt: string; attributes: Record<string, string> }
			> = {
				a: { prompt: "sunset", attributes: {} },
				b: { prompt: "hello", attributes: {} },
			};
			return {
				status: "idle",
				seconds: 0,
				result: { url: "https://example.com/asset.png" },
				error: null,
				resultInputs: inputs[id],
			};
		});

		const { useGenerateAll } = await import("../hooks/useGenerateAll");
		const children: Descendant[] = [
			wrapInScene([
				makeElement("a", "image", "sunset"),
				makeElement("b", "narration", "hello"),
			]),
		];
		const editor = { children } as unknown as Parameters<
			typeof useGenerateAll
		>[0];

		const { generateAll } = useGenerateAll(editor);
		generateAll();

		const jobs: GenerationJob[] = enqueueAllSpy.mock.calls[0][0];
		expect(jobs).toHaveLength(0);
	});

	it("skips elements with empty prompts", async () => {
		const { useGenerateAll } = await import("../hooks/useGenerateAll");
		const children: Descendant[] = [
			wrapInScene([
				makeElement("a", "image", "sunset"),
				makeElement("b", "narration", "   "),
			]),
		];
		const editor = { children } as unknown as Parameters<
			typeof useGenerateAll
		>[0];

		const { generateAll } = useGenerateAll(editor);
		generateAll();

		const jobs: GenerationJob[] = enqueueAllSpy.mock.calls[0][0];
		expect(jobs).toHaveLength(1);
		expect(jobs[0].elementId).toBe("a");
	});
});
