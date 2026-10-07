// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MediaWithSkeleton } from "../media-with-skeleton";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

beforeEach(() => {
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	vi.restoreAllMocks();
});

const mount = (outputKind: "image" | "video") =>
	act(() =>
		root.render(
			<div style={{ position: "relative" }}>
				<MediaWithSkeleton
					outputKind={outputKind}
					src="https://media/a"
					alt=""
				/>
			</div>,
		),
	);

const shimmering = () =>
	container.querySelector('[data-slot="skeleton"]') !== null;

const fire = (type: string) =>
	act(async () => {
		container.querySelector("video, img")?.dispatchEvent(new Event(type));
	});

describe("MediaWithSkeleton video", () => {
	it("shimmers until the video has metadata", async () => {
		mount("video");
		expect(shimmering()).toBe(true);

		await fire("loadedmetadata");

		expect(shimmering()).toBe(false);
	});

	it("stops shimmering when the video fails to load", async () => {
		mount("video");

		await fire("error");

		expect(shimmering()).toBe(false);
	});

	it("never shimmers over a video that already has metadata at mount", () => {
		vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(
			1,
		);

		mount("video");

		expect(shimmering()).toBe(false);
	});
});

describe("MediaWithSkeleton image", () => {
	it("shimmers until the image loads", async () => {
		vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(
			false,
		);
		mount("image");
		expect(shimmering()).toBe(true);

		await fire("load");

		expect(shimmering()).toBe(false);
	});

	it("never shimmers over an image that is already complete at mount", () => {
		vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(
			true,
		);

		mount("image");

		expect(shimmering()).toBe(false);
	});
});
