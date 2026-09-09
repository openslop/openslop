import { MetadataSchema } from "@/lib/project/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ConnectorConfig } from "@/lib/connectors/types";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { ElementHistory, type ElementVersionStorage } from "../history";
import type { GenerationInputs } from "../inputs";
import type { GenerationJob, GenerationNode } from "../graph";
import { GenerationQueue } from "../queue";
import { activeVersionIndex } from "../versions";

const EMPTY_STATE = {
	hydrated: true,
	metadata: MetadataSchema.parse({}),
	referenceImages: [],
};

type GenerateFn = (...args: unknown[]) => Promise<unknown>;
let generateMock: ReturnType<typeof vi.fn<GenerateFn>>;

vi.mock("../generateForElement", () => ({
	generateForElement: (...args: unknown[]) => generateMock(...args),
}));

const ELEMENT = "el";

const inputs = (prompt: string): GenerationInputs => ({
	prompt,
	attributes: {},
	dependencies: {},
});

const result = (imageUrl: string) => ({ imageUrl, durationSec: 0 });

function makeJob(id: string, prompt: string): GenerationNode {
	const config: ConnectorConfig = {};
	const job: GenerationJob = {
		elementId: id,
		elementType: "image",
		connectorType: "image",
		model: DEFAULT_MODELS.image,
		config,
		state: EMPTY_STATE,
	};
	return { id, inputs: { prompt, attributes: {} }, dependsOn: [], job };
}

const noopStorage: ElementVersionStorage = {
	read: () => Promise.resolve([]),
	write: () => {},
};

const activeIndexOf = (queue: GenerationQueue, history: ElementHistory) =>
	activeVersionIndex(history.get(ELEMENT), queue.getElementSnapshot(ELEMENT));

describe("useElementHistory activeIndex", () => {
	let queue: GenerationQueue;
	let history: ElementHistory;

	beforeEach(() => {
		vi.useFakeTimers();
		generateMock = vi.fn();
		queue = new GenerationQueue({ limits: { image: 3 } });
		history = new ElementHistory(noopStorage);
		queue.onCommitted(history.record);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("highlights no version after a previously-successful element fails to regenerate", async () => {
		const successInputs = inputs("first");
		generateMock.mockResolvedValue(result("v1.png"));
		queue.enqueueGraph([makeJob(ELEMENT, successInputs.prompt)]);
		await vi.runAllTimersAsync();

		expect(history.get(ELEMENT)).toHaveLength(1);
		expect(queue.getElementSnapshot(ELEMENT)).toMatchObject({
			result: result("v1.png"),
			resultInputs: successInputs,
			error: null,
		});
		expect(activeIndexOf(queue, history)).toBe(0);

		generateMock.mockRejectedValue(new Error("boom"));
		queue.enqueueGraph([makeJob(ELEMENT, "second")]);
		await vi.runAllTimersAsync();

		const snapshot = queue.getElementSnapshot(ELEMENT);
		// The error path nulls `result` only, leaving the prior `resultInputs`
		// behind — the state that misled the old `resultInputs`-only derivation.
		expect(snapshot).toMatchObject({
			result: null,
			error: "boom",
			resultInputs: successInputs,
		});
		expect(history.get(ELEMENT)).toHaveLength(1);

		expect(activeIndexOf(queue, history)).toBe(-1);
	});

	it("keeps the prior version active while a regeneration is in flight", async () => {
		const successInputs = inputs("first");
		generateMock.mockResolvedValue(result("v1.png"));
		queue.enqueueGraph([makeJob(ELEMENT, successInputs.prompt)]);
		await vi.runAllTimersAsync();
		expect(activeIndexOf(queue, history)).toBe(0);

		generateMock.mockReturnValue(new Promise(() => {}));
		queue.enqueueGraph([makeJob(ELEMENT, "second")]);
		await vi.advanceTimersByTimeAsync(0);

		expect(queue.getElementSnapshot(ELEMENT)).toMatchObject({
			status: "generating",
			result: result("v1.png"),
			resultInputs: successInputs,
		});
		// The prior result is still on screen, so V1 stays highlighted.
		expect(activeIndexOf(queue, history)).toBe(0);
		queue.cancelAll();
	});
});
