import { beforeEach, describe, expect, it } from "vitest";
import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { stateCtx } from "./_state-ctx";

let store: ProjectStore;

beforeEach(() => {
	store = createProjectStore();
	store.getState().updateMetadata({ videoSettings: { aspectRatio: "9:16" } });
});

describe("createDimensionsPlugin", () => {
	it("sizes an image from the project aspect ratio alone", () => {
		const { beforeGenerate } = createDimensionsPlugin("image");
		expect(
			beforeGenerate?.(
				{ prompt: "a cat", resolution: "1080p" },
				stateCtx(store),
			),
		).toEqual({
			prompt: "a cat",
			resolution: "1080p",
			width: 1440,
			height: 2560,
		});
	});

	it("sizes a video from the aspect ratio at the resolution it names", () => {
		const { beforeGenerate } = createDimensionsPlugin("video");
		expect(
			beforeGenerate?.(
				{ prompt: "a cat", resolution: "1080p" },
				stateCtx(store),
			),
		).toEqual({
			prompt: "a cat",
			resolution: "1080p",
			width: 1080,
			height: 1920,
		});
	});

	it("gives a video that names no resolution the default one", () => {
		const { beforeGenerate } = createDimensionsPlugin("video");
		expect(beforeGenerate?.({ prompt: "a cat" }, stateCtx(store))).toEqual({
			prompt: "a cat",
			resolution: "720p",
			width: 720,
			height: 1280,
		});
	});
});
