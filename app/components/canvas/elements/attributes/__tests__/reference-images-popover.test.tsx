// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createCharacterRef } from "@/lib/canvas/character-refs";
import type { ContentElement, GeneratedElement } from "@/lib/canvas/types";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import { resultQueue } from "@/lib/project/__tests__/_canvas";
import {
	mountOnCanvas,
	noHistory,
} from "@/app/components/canvas/__tests__/_mount";
import { EditorPanelProvider } from "@/app/components/canvas/panel/editor-panel-context";
import { ContinuityReferencesPopover } from "../continuity-references-popover";
import { PanelSection } from "@/app/components/canvas/panel/panel-card";
import {
	ReferenceImagesEditor,
	ReferenceImagesPopover,
} from "../reference-images-popover";

vi.mock("@/app/components/canvas/workspace-context", () => ({
	useShowWorkspace: () => true,
}));
vi.mock("../use-previous-pictures", () => ({
	usePreviousPictures: () => ({
		kind: "ready",
		pictures: [{ name: "Last frame", url: "https://img/last.png" }],
	}),
}));
vi.mock("@/lib/project/use-media-upload", () => ({
	useMediaUpload: () => ({
		openPicker: vi.fn(),
		uploading: [],
		inputElement: null,
	}),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const MIA = "https://img/mia.png";
const mia = asset("asset_avatar", { name: "Mia" });
const ned = asset("asset_avatar", { name: "Ned" });
const vox = asset("asset_voice", { name: "Vox" });

const text = (id: string, value = "") => ({
	id,
	type: "image" as const,
	text: value,
});

/** An element whose prompt tags each of `names`, as typing @Name does. */
function tagging(type: "image" | "video", ...names: string[]): ContentElement {
	return {
		id: "el",
		type,
		generationAttributes: type === "video" ? { continuity: "true" } : {},
		children: [
			text("t", "A scene with "),
			...names.flatMap((name, i) => [
				createCharacterRef(name),
				text(`t${i}`, " "),
			]),
		],
	} as ContentElement;
}

let canvas: ReturnType<typeof mountOnCanvas>;

afterEach(() => canvas.unmount());

const target = (element: ContentElement) => ({
	element: element as GeneratedElement,
	attrKey: "images",
	label: "References",
});

function mount(element: ContentElement, children: React.ReactNode) {
	canvas = mountOnCanvas([mia, ned, vox, element]);
	canvas.render(
		<TooltipProvider>
			<GenerationQueueProvider
				initialState={resultQueue({ [mia.id]: { imageUrl: MIA } }).snapshot()}
				storage={noHistory}
			>
				<EditorPanelProvider>{children}</EditorPanelProvider>
			</GenerationQueueProvider>
		</TooltipProvider>,
	);
}

function open(element: ContentElement, continuity = false) {
	mount(
		element,
		continuity ? (
			<ContinuityReferencesPopover {...target(element)} toggle={null} />
		) : (
			<ReferenceImagesPopover {...target(element)} />
		),
	);
	const trigger = document.body.querySelector<HTMLButtonElement>(
		'[aria-label^="References:"]',
	);
	act(() => {
		trigger?.dispatchEvent(
			new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
		);
		trigger?.click();
	});
	return trigger?.getAttribute("aria-label");
}

const tile = (name: string) =>
	document.body.querySelector(`button[aria-label="More actions for ${name}"]`);

describe("ReferenceImagesPopover", () => {
	it("shows the avatars that tagged characters add, and counts them", () => {
		expect(open(tagging("image", "Mia"))).toBe("References: Project (0) + 1");
		expect(document.body.textContent).toContain("+1 from tagged characters");
		expect(tile("Mia")).not.toBeNull();
		expect(document.body.querySelector(`img[src="${MIA}"]`)).not.toBeNull();
	});

	it("leaves out characters with no avatar picture", () => {
		expect(open(tagging("image", "Mia", "Ned", "Vox"))).toBe(
			"References: Project (0) + 1",
		);
		expect(tile("Mia")).not.toBeNull();
		expect(tile("Ned")).toBeNull();
		expect(tile("Vox")).toBeNull();
	});

	it("looks as it did before when nothing tagged has an avatar", () => {
		expect(open(tagging("image", "Ned", "Vox"))).toBe(
			"References: Project (0)",
		);
		expect(document.body.textContent).not.toContain("tagged characters");
	});

	it("adds them to the previous scene's pictures on a video", () => {
		expect(open(tagging("video", "Mia"), true)).toBe(
			"References: Project (0) + 2",
		);
		expect(document.body.textContent).toContain("+1 from tagged characters");
		expect(document.body.textContent).toContain("+1 from the previous scene");
	});

	it("shows them in the media panel too", () => {
		const element = tagging("image", "Mia", "Ned");
		mount(
			element,
			<ReferenceImagesEditor {...target(element)} Section={PanelSection} />,
		);
		expect(document.body.textContent).toContain("+1 from tagged characters");
		expect(tile("Mia")).not.toBeNull();
		expect(tile("Ned")).toBeNull();
	});
});
