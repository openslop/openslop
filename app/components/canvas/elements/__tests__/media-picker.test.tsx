// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import {
	EditorPanelProvider,
	useEditorPanel,
} from "@/app/components/canvas/panel/editor-panel-context";
import { MediaPicker } from "../media-picker";

vi.mock("@/app/components/canvas/workspace-context", () => ({
	useShowWorkspace: () => true,
}));
vi.mock("@/lib/project/use-project", () => ({
	useProject: (select: (state: { media: [] }) => unknown) =>
		select({ media: [] }),
}));
vi.mock("@/lib/project/use-media-upload", () => ({
	useMediaUpload: () => ({
		openPicker: vi.fn(),
		uploading: [],
		inputElement: null,
	}),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let canvas: ReturnType<typeof mountOnCanvas>;

afterEach(() => canvas.unmount());

function ActivePanel() {
	return <output aria-label="Active panel">{useEditorPanel().active}</output>;
}

function openPicker() {
	canvas = mountOnCanvas();
	canvas.render(
		<TooltipProvider>
			<EditorPanelProvider>
				<MediaPicker kind="image" onPick={vi.fn()}>
					<button type="button">Pick</button>
				</MediaPicker>
				<ActivePanel />
			</EditorPanelProvider>
		</TooltipProvider>,
	);
	const trigger = [...document.body.querySelectorAll("button")].find(
		(button) => button.textContent === "Pick",
	);
	act(() => {
		trigger?.dispatchEvent(
			new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
		);
		trigger?.click();
	});
}

const generate = () =>
	document.body.querySelector<HTMLButtonElement>('[aria-label="Generate"]');

describe("MediaPicker", () => {
	it("offers to generate with the magic wand", () => {
		openPicker();

		expect(generate()?.innerHTML).toContain("--magic-wand-icon");
	});

	it("closes and opens the Media panel to generate", () => {
		openPicker();

		act(() => generate()?.click());

		expect(document.body.querySelector('[role="dialog"]')).toBeNull();
		expect(
			document.body.querySelector('[aria-label="Active panel"]')?.textContent,
		).toBe("media");
	});
});
