// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { element } from "@/lib/canvas/__tests__/_assets";
import { flatAttributes } from "@/lib/canvas/element-attributes";
import { findElementById } from "@/lib/canvas/editor-ops";
import { mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import { StartFramePicker } from "../start-frame-picker";

vi.mock("../use-previous-pictures", () => ({
	usePreviousPictures: () => ({ kind: "ready", pictures: [] }),
}));
vi.mock("@/lib/upload/use-image-upload", () => ({
	useImageUpload: () => ({
		openPicker: vi.fn(),
		uploading: false,
		inputElement: null,
	}),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const PICTURE = "https://img/frame.png";

let canvas: ReturnType<typeof mountOnCanvas>;

afterEach(() => canvas.unmount());

function openPicker(startFrame: string) {
	const video = element("v1", "video", "", { startFrame });
	canvas = mountOnCanvas([video]);
	canvas.render(
		<StartFramePicker
			element={video}
			attrKey="startFrame"
			label="Start frame"
		/>,
	);
	const trigger = document.body.querySelector<HTMLButtonElement>(
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
		openPicker(PICTURE);

		expect(tile("Uploaded picture")?.getAttribute("aria-checked")).toBe("true");
		expect(tile("Uploaded picture")?.querySelector("img")?.src).toBe(PICTURE);
	});

	it("keeps that picture when another start frame is picked", () => {
		openPicker(PICTURE);

		act(() => tile("Previous scene")?.click());

		const [video] = findElementById(canvas.editor, "v1") ?? [];
		expect(video && flatAttributes(video)).toMatchObject({
			startFrame: "previous",
			uploadedFrame: PICTURE,
		});
	});

	it("offers an upload when the start frame is not a picture", () => {
		openPicker("previous");

		expect(tile("Uploaded picture")).toBeNull();
	});
});
