// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { element } from "@/lib/canvas/__tests__/_assets";
import { flatAttributes } from "@/lib/canvas/element-attributes";
import { findElementById } from "@/lib/canvas/editor-ops";
import {
	chooseTileMenuItem,
	mountOnCanvas,
} from "@/app/components/canvas/__tests__/_mount";
import { EditorPanelProvider } from "@/app/components/canvas/panel/editor-panel-context";
import { StartFramePicker } from "../start-frame-picker";

vi.mock("@/app/components/canvas/workspace-context", () => ({
	useShowWorkspace: () => true,
}));

vi.mock("../use-previous-pictures", () => ({
	usePreviousPictures: () => ({ kind: "ready", pictures: [] }),
}));
vi.mock("@/lib/project/use-media-upload", () => ({
	useMediaUpload: () => ({
		openPicker: vi.fn(),
		uploading: false,
		uploadingCount: 0,
		inputElement: null,
	}),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const PICTURE = "https://img/frame.png";

let canvas: ReturnType<typeof mountOnCanvas>;

afterEach(() => canvas.unmount());

function openPicker(startFrame: string, uploadedFrame?: string) {
	const video = element("v1", "video", "", {
		startFrame,
		...(uploadedFrame && { uploadedFrame }),
	});
	canvas = mountOnCanvas([video]);
	canvas.render(
		<TooltipProvider>
			<EditorPanelProvider>
				<StartFramePicker
					element={video}
					attrKey="startFrame"
					label="Start frame"
				/>
			</EditorPanelProvider>
		</TooltipProvider>,
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

	it("moves the choice with the arrow keys", async () => {
		openPicker("none", PICTURE);
		act(() => tile("None")?.focus());

		await act(async () => {
			tile("None")?.dispatchEvent(
				new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
			);
			await new Promise((resolve) => setTimeout(resolve));
		});

		expect(document.activeElement).toBe(tile("Previous scene"));
		const [video] = findElementById(canvas.editor, "v1") ?? [];
		expect(video && flatAttributes(video)).toMatchObject({
			startFrame: "previous",
		});
	});

	it("opens the uploaded picture full size without choosing it", async () => {
		openPicker("previous", PICTURE);

		await chooseTileMenuItem("Uploaded picture", "View larger");

		const viewer = document.body.querySelectorAll('[role="dialog"]')[1];
		expect(viewer?.querySelector("img")?.src).toBe(PICTURE);
		expect(tile("Previous scene")?.getAttribute("aria-checked")).toBe("true");
	});

	it("offers the media library when the start frame is not a picture", () => {
		openPicker("previous");

		expect(tile("Uploaded picture")).toBeNull();
		expect(
			document.body.querySelector('[aria-label="Add start frame"]'),
		).not.toBeNull();
	});
});
