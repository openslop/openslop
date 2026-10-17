import { describe, expect, it } from "vitest";
import { createCanvasElement } from "@/lib/canvas/create-canvas-element";
import { references } from "@/lib/canvas/__tests__/_assets";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { elementImage } from "../element-image";

const snapshot = (fields: Partial<ElementSnapshot> = {}): ElementSnapshot => ({
	status: "idle",
	startedAt: null,
	result: null,
	error: null,
	resultInputs: null,
	connectorType: null,
	pinned: false,
	...fields,
});

const image = createCanvasElement("image", { text: "a wolf" });
const wolf = "https://example.com/wolf.jpg";

describe("elementImage", () => {
	it.each([
		[
			"a generated image",
			image,
			snapshot({ result: { imageUrl: wolf, durationSec: 0 } }),
		],
		[
			"an uploaded avatar",
			createCanvasElement("asset_avatar", { text: "a wolf" }),
			snapshot({ result: { imageUrl: wolf, durationSec: 0 }, pinned: true }),
		],
	] as const)("hands over %s with its prompt", (_, element, state) => {
		expect(elementImage(element, state)).toEqual({
			ok: true,
			prompt: "a wolf",
			urls: [wolf],
		});
	});

	it("hands over every uploaded reference image", () => {
		const urls = [wolf, "https://example.com/fox.jpg"];

		expect(elementImage(references(...urls), snapshot())).toMatchObject({
			ok: true,
			urls,
		});
	});

	it.each([
		["an image not drawn yet", image, snapshot(), "has not been generated yet"],
		[
			"an image still generating",
			image,
			snapshot({ status: "generating" }),
			"is still generating",
		],
		[
			"an image whose generation failed, with the failure's words",
			image,
			snapshot({ error: "The provider rejected this key." }),
			"failed to generate: The provider rejected this key.",
		],
		[
			"an upload with no picture",
			image,
			snapshot({ result: { durationSec: 0 }, pinned: true }),
			"has no picture uploaded",
		],
		[
			"reference images never uploaded",
			references(),
			snapshot(),
			"has no reference images uploaded",
		],
		[
			"an asset that holds no picture",
			createCanvasElement("asset_style"),
			snapshot(),
			"is of type asset_style, which holds no picture",
		],
		[
			"an element that generates no picture",
			createCanvasElement("video"),
			snapshot({ result: { imageUrl: wolf, durationSec: 0 } }),
			"is of type video, which holds no picture",
		],
	] as const)("explains %s", (_, element, state, reason) => {
		expect(elementImage(element, state)).toEqual({ ok: false, reason });
	});
});
