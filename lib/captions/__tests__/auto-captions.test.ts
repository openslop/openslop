import { describe, expect, it } from "vitest";
import type { ContentType } from "@/lib/canvas/types";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { planCaptions } from "../auto-captions";
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

const clip = (id: string, type: ContentType = "narration") => ({ id, type });

const plan = (clips: ReturnType<typeof clip>[], recaption = false) => {
	const { ready, skipped } = planCaptions(clips, getSnapshot, { recaption });
	return { ready: ready.map(({ id }) => id), skipped };
};

describe("planCaptions", () => {
	it("captions a clip that has a result and no words yet", () => {
		expect(plan([clip("fresh")])).toEqual({ ready: ["fresh"], skipped: [] });
	});

	it.each([
		["ungenerated", "has no result yet"],
		["generating", "is generating"],
		["captioning", "is already being captioned"],
		["captioned", "already has captions"],
	])("skips %s: it %s", (id, reason) => {
		expect(plan([clip(id)])).toEqual({ ready: [], skipped: [{ id, reason }] });
	});

	it("skips an element whose type never shows captions", () => {
		expect(plan([clip("picture", "image")])).toEqual({
			ready: [],
			skipped: [{ id: "picture", reason: "never shows captions" }],
		});
	});

	it("never redoes hand-edited captions, even when asked to recaption", () => {
		expect(plan([clip("edited")], true)).toEqual({
			ready: [],
			skipped: [{ id: "edited", reason: "has hand-edited captions" }],
		});
	});

	it("redoes captions a clip already has when asked to recaption", () => {
		expect(plan([clip("captioned"), clip("ungenerated")], true)).toEqual({
			ready: ["captioned"],
			skipped: [{ id: "ungenerated", reason: "has no result yet" }],
		});
	});
});
