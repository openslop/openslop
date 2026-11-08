import { describe, expect, it } from "vitest";
import type { ContentType } from "@/lib/canvas/types";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { planCaptions, withoutCaptions } from "../auto-captions";
import { captionsNodeId } from "../captions-job";
import { toCaption } from "../word-captions";

const idle: ElementSnapshot = {
	status: "idle",
	startedAt: null,
	result: null,
	error: null,
	resultInputs: null,
	connectorType: null,
	pinned: false,
};

const spoken = { audioUrl: "https://example.com/a.wav", durationSec: 2 };
const words = [toCaption("hi", 0, 1)];
const captioned = {
	...spoken,
	textTimestamps: words,
	originalTextTimestamps: words,
};
const edited = { ...captioned, textTimestamps: [toCaption("hey", 0, 1)] };

const snapshots: Record<string, Partial<ElementSnapshot>> = {
	fresh: { result: spoken },
	captioned: { result: captioned },
	edited: { result: edited },
	ungenerated: {},
	generating: { result: spoken, status: "generating" },
	captioning: { result: spoken },
	[captionsNodeId("captioning")]: { status: "queued" },
	picture: {
		result: { imageUrl: "https://example.com/p.png", durationSec: 0 },
	},
};

const getSnapshot = (id: string): ElementSnapshot => ({
	...idle,
	...snapshots[id],
});

const element = (id: string, type: ContentType = "narration") => ({ id, type });

const plan = (elements: ReturnType<typeof element>[]) => {
	const { ready, skipped } = planCaptions(elements, getSnapshot);
	return { ready: ready.map(({ id }) => id), skipped };
};

describe("withoutCaptions", () => {
	it("keeps only the elements that have no words yet", () => {
		expect(
			withoutCaptions(
				[element("fresh"), element("captioned"), element("edited")],
				getSnapshot,
			).map(({ id }) => id),
		).toEqual(["fresh"]);
	});
});

describe("planCaptions", () => {
	it("captions a element that has a result and no words yet", () => {
		expect(plan([element("fresh")])).toEqual({ ready: ["fresh"], skipped: [] });
	});

	it("redoes captions a element already has", () => {
		expect(plan([element("captioned")])).toEqual({
			ready: ["captioned"],
			skipped: [],
		});
	});

	it.each([
		["ungenerated", "isn't generated yet"],
		["generating", "is still generating"],
		["captioning", "is already being captioned"],
		["edited", "has hand-edited captions"],
	])("skips %s: it %s", (id, reason) => {
		expect(plan([element(id)])).toEqual({
			ready: [],
			skipped: [{ id, reason }],
		});
	});

	it("skips an element whose type never shows captions", () => {
		expect(plan([element("picture", "image")])).toEqual({
			ready: [],
			skipped: [{ id: "picture", reason: "never shows captions" }],
		});
	});
});
