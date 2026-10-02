// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MediaWithSkeleton } from "../MediaWithSkeleton";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

beforeEach(() => {
	root = createRoot(container);
	act(() =>
		root.render(
			<MediaWithSkeleton outputKind="video" src="https://vid/a.mp4" alt="" />,
		),
	);
});

afterEach(() => {
	act(() => root.unmount());
});

const shimmering = () =>
	container.querySelector('[data-slot="skeleton"]') !== null;

const fire = (type: string) =>
	act(() => {
		container.querySelector("video")?.dispatchEvent(new Event(type));
	});

describe("MediaWithSkeleton video", () => {
	it("shimmers until the video has data", () => {
		expect(shimmering()).toBe(true);

		fire("loadeddata");

		expect(shimmering()).toBe(false);
	});

	it("stops shimmering when the video fails to load", () => {
		fire("error");

		expect(shimmering()).toBe(false);
	});
});
