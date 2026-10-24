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
import {
	captionsNode,
	captionsNodeId,
	withCaptionsLanding,
} from "../captions-job";

let generateMock: Mock<typeof generateForElement>;

vi.mock("@/lib/generation/generate-for-element", () => ({
	generateForElement: (...args: Parameters<typeof generateForElement>) =>
		generateMock(...args),
}));

const clip = { audioUrl: "https://example.com/a.wav", durationSec: 2 };
const heard = [{ text: "hi", start: 0, end: 1 }];
const element = { id: "clip", type: "narration" } as const;
const stt = (take: AssetResult = clip) =>
	captionsNode(element, take, DEFAULT_MODELS.stt);

describe("captions jobs", () => {
	let queue: GenerationQueue;
	let stopLanding: () => void;
	let record: Mock<(version: CommittedVersion) => void>;

	beforeEach(async () => {
		vi.useFakeTimers();
		generateMock = vi.fn<typeof generateForElement>();
		queue = new GenerationQueue();
		record = vi.fn();
		stopLanding = queue.onCommitted(withCaptionsLanding(queue, record));
		generateMock.mockResolvedValue(clip);
		queue.enqueueGraph([jobNode("clip")]);
		await vi.runAllTimersAsync();
	});

	afterEach(() => {
		stopLanding();
		vi.useRealTimers();
	});

	it("lands the words on the clip, under its inputs, and records no version of their own", async () => {
		const made = queue.getElementSnapshot("clip").resultInputs;
		generateMock.mockResolvedValue({ durationSec: 2, textTimestamps: heard });
		queue.enqueueGraph([stt()]);
		await vi.runAllTimersAsync();

		expect(queue.getElementSnapshot("clip")).toMatchObject({
			result: { ...clip, textTimestamps: heard },
			resultInputs: made,
		});
		expect(queue.getElementSnapshot(captionsNodeId("clip"))).toMatchObject({
			result: null,
			error: null,
		});
		expect(record.mock.calls.map(([version]) => version.elementId)).toEqual([
			"clip",
			"clip",
		]);
	});

	it("fails, leaving the clip alone, when the clip was remade meanwhile", async () => {
		let land: (result: AssetResult) => void = () => {};
		generateMock.mockReturnValue(new Promise((resolve) => (land = resolve)));
		queue.enqueueGraph([stt()]);
		await vi.advanceTimersByTimeAsync(0);
		const remade = { ...clip, audioUrl: "https://example.com/b.wav" };
		queue.commitResult(jobNode("clip"), remade);

		land({ durationSec: 2, textTimestamps: heard });
		await vi.runAllTimersAsync();

		expect(queue.getElementSnapshot("clip").result).toEqual(remade);
		expect(queue.getElementSnapshot(captionsNodeId("clip")).error).toMatch(
			/changed/,
		);
	});

	it("runs speech to text on the take the clip holds, and never remakes the clip", async () => {
		generateMock.mockClear();
		generateMock.mockResolvedValue({ durationSec: 2, textTimestamps: heard });
		queue.enqueueGraph([stt()]);
		await vi.runAllTimersAsync();

		expect(generateMock).toHaveBeenCalledTimes(1);
		expect(generateMock.mock.calls[0][0].inputs.attributes).toEqual({
			mediaUrl: clip.audioUrl,
		});
	});

	it("refuses a take with no sound", () => {
		expect(() => stt({ durationSec: 0 })).toThrow(/no sound/);
	});
});
