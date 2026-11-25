// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Editor, Transforms } from "slate";
import { Editable, type RenderElementProps } from "slate-react";
import { findAsset, kindOfName } from "@/lib/canvas/assets";
import { createNameRef } from "@/lib/canvas/name-refs";
import { isNameRef } from "@/lib/canvas/guards";
import type { ContentElement } from "@/lib/canvas/types";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import {
	click,
	mountOnCanvas,
	noHistory,
} from "@/app/components/canvas/__tests__/_mount";
import { withNameRefs } from "@/app/components/canvas/plugins/with-name-refs";
import { AssetEditProvider } from "../named-asset/asset-edit-provider";
import { NameRef } from "../name-ref";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../named-asset/new-named-asset-dialog", () => ({
	NewNamedAssetDialog: ({ preset }: { preset: { name?: string } }) => (
		<div data-dialog={`create ${preset.name}`} />
	),
}));
vi.mock("../named-asset/character-edit-modal", () => ({
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
		createNameRef("Mia"),
		text("t1", " meets "),
		createNameRef("Ned"),
		text("t2", " and "),
		createNameRef("Ghost"),
		text("t3"),
	],
};

const renderElement = ({
	attributes,
	children,
	element,
}: RenderElementProps) =>
	isNameRef(element) ? (
		<NameRef attributes={attributes} element={element}>
			{children}
		</NameRef>
	) : (
		<div {...attributes}>{children}</div>
	);

let canvas: ReturnType<typeof mountOnCanvas>;

const mount = (readOnly = false) => {
	canvas = mountOnCanvas([
		asset("asset_avatar", { name: "Mia" }),
		asset("asset_voice", { name: "Mia" }),
		asset("asset_voice", { name: "Ned" }),
		image,
	]);
	withNameRefs(canvas.editor);
	const editable = (
		<Editable readOnly={readOnly} renderElement={renderElement} />
	);
	return canvas.render(
		<GenerationQueueProvider initialState={{}} storage={noHistory}>
			<TooltipProvider>
				{readOnly ? (
					editable
				) : (
					<AssetEditProvider>{editable}</AssetEditProvider>
				)}
			</TooltipProvider>
		</GenerationQueueProvider>,
	);
};

const editButton = (name: string) =>
	document.body.querySelector<HTMLButtonElement>(
		`button[aria-label="Edit ${name}"]`,
	);
const createButton = (name: string) =>
	document.body.querySelector<HTMLButtonElement>(
		`button[aria-label="Create ${name}"]`,
	);
const openDialogs = () =>
	Array.from(
		document.body.querySelectorAll<HTMLElement>("[data-dialog]"),
		(dialog) => dialog.dataset.dialog,
	);

afterEach(() => canvas.unmount());

describe("NameRef", () => {
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

		it("offers no edit button for a name that isn't a named asset", () => {
			expect(editButton("Mia")).not.toBeNull();
			expect(editButton("Ghost")).toBeNull();
		});

		it("opens the new named asset dialog on an unknown name from its chip, adding nothing yet", async () => {
			expect(createButton("Ghost")).not.toBeNull();

			await click('button[aria-label="Create Ghost"]');

			expect(kindOfName(canvas.editor.children, "Ghost")).toBeUndefined();
			expect(openDialogs()).toEqual(["create Ghost"]);
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

	it("renders read-only chips without asset editor actions or a provider", async () => {
		await mount(true);

		expect(editButton("Mia")).toBeNull();
		expect(createButton("Ghost")).toBeNull();
		expect(document.body.textContent).toContain("Mia");
		expect(document.body.textContent).toContain("Ghost");
	});
});
