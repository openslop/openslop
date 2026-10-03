import { describe, expect, it } from "vitest";
import { DEFAULT_CAPTION_STYLE } from "@/lib/captions/captionStyle";
import { createProjectStore } from "../store";
import { extractStoreSnapshot, parseStoreSnapshot } from "../storeSnapshot";
import { VideoSettingsSchema } from "../videoSettings";

describe("storeSnapshot", () => {
	it("extracts a method-free snapshot, detached from its store", () => {
		const store = createProjectStore();
		const snap = extractStoreSnapshot(store);

		store.getState().updateVideoSettings({ aspectRatio: "9:16" });

		expect(snap).toEqual({ videoSettings: VideoSettingsSchema.parse({}) });
	});

	it("round-trips through createProjectStore", () => {
		const src = createProjectStore();
		src.getState().updateVideoSettings({
			aspectRatio: "9:16",
			transitionType: "fade",
			captions: false,
		});

		const after = createProjectStore(extractStoreSnapshot(src)).getState();
		expect(after.videoSettings).toEqual(src.getState().videoSettings);
	});

	it("creates the same store from an empty parsed snapshot as from nothing", () => {
		expect(
			extractStoreSnapshot(createProjectStore(parseStoreSnapshot(null))),
		).toEqual(extractStoreSnapshot(createProjectStore()));
	});
});

describe("parseStoreSnapshot", () => {
	it("fills defaults for absent and partial rows", () => {
		expect(parseStoreSnapshot(null)).toEqual({
			videoSettings: VideoSettingsSchema.parse({}),
		});
		expect(
			parseStoreSnapshot({ videoSettings: { aspectRatio: "9:16" } })
				.videoSettings,
		).toEqual(VideoSettingsSchema.parse({ aspectRatio: "9:16" }));
	});

	it("keeps a stored row intact and completes its video settings", () => {
		const videoSettings = {
			aspectRatio: "9:16" as const,
			transitionType: "fade" as const,
		};

		expect(parseStoreSnapshot({ videoSettings }).videoSettings).toEqual({
			...videoSettings,
			captions: true,
			captionStyle: DEFAULT_CAPTION_STYLE,
		});
	});

	it("keeps only the video settings of a row that carries other fields", () => {
		expect(
			parseStoreSnapshot({
				videoSettings: { aspectRatio: "9:16", length: "60s", format: "x" },
				metadata: { title: "T" },
				referenceImages: ["a.png"],
			}),
		).toEqual({
			videoSettings: VideoSettingsSchema.parse({ aspectRatio: "9:16" }),
		});
	});

	it("throws on a structurally invalid row", () => {
		expect(() =>
			parseStoreSnapshot({ videoSettings: { aspectRatio: 42 } }),
		).toThrow();
	});
});
