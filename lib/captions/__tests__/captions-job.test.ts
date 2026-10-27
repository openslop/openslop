import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
	type Mock,
} from "vitest";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import type { AssetResult } from "@/lib/connectors/types";
import type { generateForElement } from "@/lib/generation/generate-for-element";
import { GenerationQueue } from "@/lib/generation/queue";
import { jobNode } from "@/lib/generation/__tests__/_graph";
import type { CommittedVersion } from "@/lib/generation/versions";
import { captionsNode, captionsNodeId } from "../captions-job";
import { toCaption } from "../word-captions";

let generateMock: Mock<typeof generateForElement>;

vi.mock("@/lib/generation/generate-for-element", () => ({
	generateForElement: (...args: Parameters<typeof generateForElement>) =>
		generateMock(...args),
}));

const spoken = { audioUrl: "https://example.com/a.wav", durationSec: 2 };
const heard = [toCaption("hi", 0, 1)];
const element = { id: "narration", type: "narration" } as const;
const stt = (result: AssetResult = spoken) =>
	captionsNode(element, result, DEFAULT_MODELS.stt);

describe("captions jobs", () => {
	let queue: GenerationQueue;
	let stopRecording: () => void;
	let record: Mock<(version: CommittedVersion) => void>;

	beforeEach(async () => {
		vi.useFakeTimers();
		generateMock = vi.fn<typeof generateForElement>();
		queue = new GenerationQueue();
		record = vi.fn();
		stopRecording = queue.onCommitted(record);
		generateMock.mockResolvedValue(spoken);
		queue.enqueueGraph([jobNode("narration")]);
		await vi.runAllTimersAsync();
	});

	afterEach(() => {
		stopRecording();
		vi.useRealTimers();
	});

	it("lands the words on the element, under its inputs, and records no version of their own", async () => {
		const made = queue.getElementSnapshot("narration").resultInputs;
		generateMock.mockResolvedValue({ durationSec: 2, textTimestamps: heard });
		queue.enqueueGraph([stt()]);
		await vi.runAllTimersAsync();

		expect(queue.getElementSnapshot("narration")).toMatchObject({
			result: { ...spoken, textTimestamps: heard },
			resultInputs: made,
		});
		expect(queue.getElementSnapshot(captionsNodeId("narration"))).toMatchObject(
			{
				result: null,
				error: null,
			},
		);
		expect(record.mock.calls.map(([version]) => version.elementId)).toEqual([
			"narration",
			"narration",
		]);
	});

	it("fails, leaving the element alone, when it was regenerated meanwhile", async () => {
		let land: (result: AssetResult) => void = () => {};
		generateMock.mockReturnValue(new Promise((resolve) => (land = resolve)));
		queue.enqueueGraph([stt()]);
		await vi.advanceTimersByTimeAsync(0);
		const remade = { ...spoken, audioUrl: "https://example.com/b.wav" };
		queue.commitResult(jobNode("narration"), remade);

		land({ durationSec: 2, textTimestamps: heard });
		await vi.runAllTimersAsync();

		expect(queue.getElementSnapshot("narration").result).toEqual(remade);
		expect(queue.getElementSnapshot(captionsNodeId("narration")).error).toMatch(
			/changed/,
		);
	});

	it("runs speech to text on the result the element holds, and never regenerates it", async () => {
		generateMock.mockClear();
		generateMock.mockResolvedValue({ durationSec: 2, textTimestamps: heard });
		queue.enqueueGraph([stt()]);
		await vi.runAllTimersAsync();

		expect(generateMock).toHaveBeenCalledTimes(1);
		expect(generateMock.mock.calls[0][0].inputs.attributes).toEqual({
			mediaUrl: spoken.audioUrl,
		});
	});

	it("refuses a result with no sound", () => {
		expect(() => stt({ durationSec: 0 })).toThrow(/no sound/);
	});
});
