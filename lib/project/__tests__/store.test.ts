import { describe, expect, it } from "vitest";
import { createProjectStore } from "../store";
import { VideoSettingsSchema } from "../videoSettings";

describe("project store", () => {
	it("updateVideoSettings deep-merges, so sibling caption style fields are preserved", () => {
		const store = createProjectStore();
		const before = store.getState().videoSettings.captionStyle;
		store.getState().updateVideoSettings({ transitionType: "fade" });
		store.getState().updateVideoSettings({ captionStyle: { fontSize: 99 } });

		expect(store.getState().videoSettings).toMatchObject({
			transitionType: "fade",
			captionStyle: { ...before, fontSize: 99 },
		});
	});

	it("reset returns the store to a blank project", () => {
		const store = createProjectStore();
		store.getState().updateVideoSettings({
			aspectRatio: "9:16",
			captions: false,
		});

		store.getState().reset();

		expect(store.getState().videoSettings).toEqual(
			VideoSettingsSchema.parse({}),
		);
	});
});
