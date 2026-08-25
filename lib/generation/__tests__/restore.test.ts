import { describe, expect, it, vi } from "vitest";
import type { AssetResult } from "@/lib/connectors/types";
import { ElementHistory, type VersionStorage } from "../history";
import type { GenerationInputs } from "../inputs";
import { GenerationQueue } from "../queue";
import { restoreVersion } from "../restore";
import type { ElementVersion } from "../versions";

const ELEMENT = "el";
const STILL = `~still:${ELEMENT}`;
const AVATAR = "~avatar:Jane";

const inputs = (
	prompt: string,
	dependencies: Record<string, string> = {},
): GenerationInputs => ({ prompt, attributes: {}, dependencies });

const version = (
	elementId: string,
	prompt: string,
	result: AssetResult,
	dependencies?: Record<string, string>,
): ElementVersion => ({
	elementId,
	createdAt: "2026-01-01T00:00:00.000Z",
	connectorType: elementId === ELEMENT ? "animated_image" : "image",
	inputs: inputs(prompt, dependencies),
	result,
	pinned: false,
});

const oldStill = version(STILL, "on the beach", {
	imageUrl: "old-still.png",
	durationSec: 0,
});
const newStill = version(STILL, "in the desert", {
	imageUrl: "new-still.png",
	durationSec: 0,
});
const oldTake = version(
	ELEMENT,
	"on the beach",
	{ videoUrl: "old.mp4", imageUrl: "old-still.png", durationSec: 4 },
	{ [STILL]: "old-still.png", [AVATAR]: "old-avatar.png" },
);

const historyOf = (rows: Record<string, ElementVersion[]>) => {
	const read = vi.fn((elementId: string) =>
		Promise.resolve(rows[elementId] ?? []),
	);
	const storage: VersionStorage = { read, write: () => {} };
	return { history: new ElementHistory(storage), read };
};

describe("restoreVersion", () => {
	it("restores the still a version was made from alongside it", async () => {
		const queue = new GenerationQueue();
		const { history } = historyOf({ [STILL]: [oldStill, newStill] });
		queue.restoreResult(newStill);

		await restoreVersion(queue, history, oldTake);

		expect(queue.getElementSnapshot(ELEMENT).result).toEqual(oldTake.result);
		expect(queue.getElementSnapshot(STILL).result).toEqual(oldStill.result);
	});

	it("leaves shared nodes alone so a card cannot roll back a character", async () => {
		const queue = new GenerationQueue();
		const avatar = version(AVATAR, "Jane", {
			imageUrl: "old-avatar.png",
			durationSec: 0,
		});
		const { history, read } = historyOf({ [AVATAR]: [avatar] });

		await restoreVersion(queue, history, oldTake);

		expect(read).not.toHaveBeenCalledWith(AVATAR);
		expect(queue.getElementSnapshot(AVATAR).result).toBeNull();
	});

	it("keeps the element's own result when the still has no matching version", async () => {
		const queue = new GenerationQueue();
		const { history } = historyOf({ [STILL]: [newStill] });
		queue.restoreResult(newStill);

		await restoreVersion(queue, history, oldTake);

		expect(queue.getElementSnapshot(ELEMENT).result).toEqual(oldTake.result);
		expect(queue.getElementSnapshot(STILL).result).toEqual(newStill.result);
	});
});
