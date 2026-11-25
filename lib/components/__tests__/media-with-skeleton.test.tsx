// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from "vitest";
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MediaWithSkeleton } from "../media-with-skeleton";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
// happy-dom leaves out the standard readyState constants.
Object.assign(HTMLMediaElement, { HAVE_NOTHING: 0, HAVE_METADATA: 1 });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

type Props = Partial<ComponentProps<typeof MediaWithSkeleton>>;

const draw = (props: Props = {}) =>
	act(() =>
		root.render(
			<MediaWithSkeleton
				outputKind="video"
				src="https://vid/a.mp4"
				alt=""
				{...props}
			/>,
		),
	);

function render(props: Props = {}) {
	root = createRoot(container);
	draw(props);
}

afterEach(() => {
	act(() => root.unmount());
});

const video = () => {
	const element = container.querySelector("video");
	if (!element) throw new Error("no video rendered");
	return element;
};

const shimmering = () =>
	container.querySelector('[data-slot="skeleton"]') !== null;

function settle(media: HTMLMediaElement, state: Partial<HTMLMediaElement>) {
	for (const [key, value] of Object.entries(state))
		Object.defineProperty(media, key, { value, configurable: true });
}

describe("MediaWithSkeleton video", () => {
	it("shimmers until the video has its metadata", () => {
		render();
		expect(shimmering()).toBe(true);

		settle(video(), { readyState: HTMLMediaElement.HAVE_METADATA });
		act(() => video().dispatchEvent(new Event("loadedmetadata")));

		expect(shimmering()).toBe(false);
	});

	it("shimmers while regenerating, then clears once the new video settles", () => {
		render({ pending: true });
		settle(video(), { readyState: HTMLMediaElement.HAVE_METADATA });
		act(() => video().dispatchEvent(new Event("loadedmetadata")));
		expect(shimmering()).toBe(true);

		draw({ pending: false });
		expect(shimmering()).toBe(false);
	});

	it("stops shimmering when the video fails to load", () => {
		render();

		settle(video(), { error: {} as MediaError });
		act(() => video().dispatchEvent(new Event("error")));

		expect(shimmering()).toBe(false);
	});

	it("does not shimmer for a video that loaded before React subscribed", () => {
		const readyState = Object.getOwnPropertyDescriptor(
			HTMLMediaElement.prototype,
			"readyState",
		);
		Object.defineProperty(HTMLMediaElement.prototype, "readyState", {
			get: () => HTMLMediaElement.HAVE_METADATA,
			configurable: true,
		});
		try {
			render();
			expect(shimmering()).toBe(false);
		} finally {
			if (readyState)
				Object.defineProperty(
					HTMLMediaElement.prototype,
					"readyState",
					readyState,
				);
		}
	});
});

describe("MediaWithSkeleton image", () => {
	const image = () => {
		const element = container.querySelector("img");
		if (!element) throw new Error("no image rendered");
		return element;
	};

	const load = () =>
		act(async () => {
			image().dispatchEvent(new Event("load"));
		});

	it("shimmers again while a regenerated image loads", async () => {
		render({ outputKind: "image", src: "https://img/a.png" });
		await load();
		expect(shimmering()).toBe(false);

		draw({ outputKind: "image", src: "https://img/a.png", pending: true });
		expect(shimmering()).toBe(true);

		draw({ outputKind: "image", src: "https://img/b.png" });
		expect(shimmering()).toBe(true);

		await load();
		expect(shimmering()).toBe(false);
	});
});
