// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createEditor } from "slate";
import { Slate, withReact } from "slate-react";
import { mergeAttrs } from "@/lib/canvas/editorOps";
import { splitAttributes } from "@/lib/canvas/elementAttributes";
import type { ContentElement } from "@/lib/canvas/types";
import { StartFramePicker } from "../StartFramePicker";

vi.mock("@/lib/canvas/editorOps", () => ({
	mergeAttrs: vi.fn(),
}));
vi.mock("../usePreviousPictures", () => ({
	usePreviousPictures: () => ({ kind: "ready", pictures: [] }),
}));
vi.mock("@/lib/upload/useImageUpload", () => ({
	useImageUpload: () => ({
		openPicker: vi.fn(),
		uploading: false,
		inputElement: null,
	}),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const PICTURE = "https://img/frame.png";

const videoWith = (attributes: Record<string, string>): ContentElement =>
	({
		id: "v1",
		type: "video",
		...splitAttributes(attributes),
		children: [{ id: "text", type: "video", text: "" }],
	}) as unknown as ContentElement;

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

beforeEach(() => {
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	vi.clearAllMocks();
});

function openPicker(element: ContentElement) {
	const editor = withReact(createEditor());
	act(() =>
		root.render(
			<Slate editor={editor} initialValue={[element as never]}>
				<StartFramePicker
					element={element}
					attrKey="startFrame"
					label="Start frame"
				/>
			</Slate>,
		),
	);
	const trigger = container.querySelector<HTMLButtonElement>(
		'[aria-label^="Start frame:"]',
	);
	act(() => {
		trigger?.dispatchEvent(
			new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
		);
		trigger?.click();
	});
}

const tile = (label: string) =>
	document.body.querySelector<HTMLButtonElement>(
		`[role="radio"][aria-label="${label}"]`,
	);

describe("StartFramePicker", () => {
	it("shows a picture set only as the start frame as the chosen upload", () => {
		openPicker(videoWith({ startFrame: PICTURE }));

		expect(tile("Uploaded picture")?.getAttribute("aria-checked")).toBe("true");
		expect(tile("Uploaded picture")?.querySelector("img")?.src).toBe(PICTURE);
	});

	it("keeps that picture when another start frame is picked", () => {
		openPicker(videoWith({ startFrame: PICTURE }));

		act(() => tile("Previous scene")?.click());

		expect(mergeAttrs).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			{ startFrame: "previous", uploadedFrame: PICTURE },
		);
	});

	it("offers an upload when the start frame is not a picture", () => {
		openPicker(videoWith({ startFrame: "previous" }));

		expect(tile("Uploaded picture")).toBeNull();
	});
});
