// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Editor, Transforms } from "slate";
import { Editable, type RenderElementProps } from "slate-react";
import { findAsset } from "@/lib/canvas/assets";
import { createCharacterRef } from "@/lib/canvas/character-refs";
import { isCharacterRef } from "@/lib/canvas/guards";
import type { ContentElement } from "@/lib/canvas/types";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import type { ElementVersionStorage } from "@/lib/generation/history";
import { click, mountOnCanvas } from "../../__tests__/_mount";
import { withCharacterRefs } from "../../plugins/with-character-refs";
import { AssetEditProvider } from "../character/asset-edit-provider";
import { CharacterRef } from "../character-ref";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../character/new-character-dialog", () => ({
	NewCharacterDialog: () => null,
}));
vi.mock("../character/character-edit-modal", () => ({
	CharacterEditModal: ({ name }: { name: string }) => (
		<div data-dialog={`character ${name}`} />
	),
}));
vi.mock("../style/art-style-modal", () => ({
	ArtStyleModal: () => null,
}));

const text = (id: string, value = "") => ({
	id,
	type: "image" as const,
	text: value,
});

const image: ContentElement = {
	id: "i",
	type: "image",
	children: [
		text("t0"),
		createCharacterRef("Mia"),
		text("t1", " meets "),
		createCharacterRef("Ned"),
		text("t2", " and "),
		createCharacterRef("Ghost"),
		text("t3"),
	],
};

const renderElement = ({
	attributes,
	children,
	element,
}: RenderElementProps) =>
	isCharacterRef(element) ? (
		<CharacterRef attributes={attributes} element={element}>
			{children}
		</CharacterRef>
	) : (
		<div {...attributes}>{children}</div>
	);

const untouched = () => Promise.reject(new Error("a chip reads no history"));
const noHistory: ElementVersionStorage = { read: untouched, write: untouched };

let canvas: ReturnType<typeof mountOnCanvas>;

const mount = (readOnly = false) => {
	canvas = mountOnCanvas([
		asset("asset_avatar", { name: "Mia" }),
		asset("asset_voice", { name: "Mia" }),
		asset("asset_voice", { name: "Ned" }),
		image,
	]);
	withCharacterRefs(canvas.editor);
	return canvas.render(
		<GenerationQueueProvider initialState={{}} storage={noHistory}>
			<TooltipProvider>
				<AssetEditProvider>
					<Editable readOnly={readOnly} renderElement={renderElement} />
				</AssetEditProvider>
			</TooltipProvider>
		</GenerationQueueProvider>,
	);
};

const editButton = (name: string) =>
	document.body.querySelector<HTMLButtonElement>(
		`button[aria-label="Edit ${name}"]`,
	);
const openDialogs = () =>
	Array.from(
		document.body.querySelectorAll<HTMLElement>("[data-dialog]"),
		(dialog) => dialog.dataset.dialog,
	);

afterEach(() => canvas.unmount());

describe("CharacterRef", () => {
	describe("in an editable canvas", () => {
		beforeEach(() => mount());

		it("opens the character's edit dialog from the chip's edit button", async () => {
			expect(openDialogs()).toEqual([]);

			await click('button[aria-label="Edit Mia"]');

			expect(openDialogs()).toEqual(["character Mia"]);
		});

		it("opens a voice-only character without drawing them", async () => {
			await click('button[aria-label="Edit Ned"]');

			expect(openDialogs()).toEqual(["character Ned"]);
			expect(
				findAsset(canvas.editor.children, "asset_avatar", "Ned"),
			).toBeUndefined();
		});

		it("offers no edit button for a name that isn't a character", () => {
			expect(editButton("Mia")).not.toBeNull();
			expect(editButton("Ghost")).toBeNull();
		});

		it("leaves the selection alone when the edit button is clicked", async () => {
			const editor = canvas.editor;
			Transforms.select(editor, Editor.start(editor, [3]));
			const before = editor.selection;

			await click('button[aria-label="Edit Mia"]');

			expect(editor.selection).toEqual(before);
		});

		it("still selects the chip on a click outside the edit button", async () => {
			await click(
				'[data-slate-void] [data-slot="badge"] > span:not([data-slot])',
			);

			const chip = Editor.void(canvas.editor);
			expect(chip?.[0]).toMatchObject({ name: "Mia" });
		});
	});

	it("offers no edit button in a read-only preview", async () => {
		await mount(true);

		expect(editButton("Mia")).toBeNull();
		expect(document.body.textContent).toContain("Mia");
	});
});
