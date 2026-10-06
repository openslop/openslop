// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createEditor } from "slate";
import { Slate, withReact } from "slate-react";
import { findAsset, NARRATOR, NO_AVATAR } from "@/lib/canvas/assets";
import {
	AssetEditProvider,
	useAssetEditors,
	type AssetEditors,
} from "../elements/character/AssetEditProvider";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../elements/character/NewCharacterDialog", () => ({
	NewCharacterDialog: ({
		onCreated,
	}: {
		onCreated: (name: string) => void;
	}) => <button data-dialog="create" onClick={() => onCreated("Mia")} />,
}));
vi.mock("../elements/character/CharacterEditModal", () => ({
	CharacterEditModal: (props: { name: string; onClose: () => void }) => (
		<button data-dialog={`character ${props.name}`} onClick={props.onClose} />
	),
}));
vi.mock("../elements/style/ArtStyleModal", () => ({
	ArtStyleModal: ({ onClose }: { onClose: () => void }) => (
		<button data-dialog="asset_style" onClick={onClose} />
	),
}));

let editors: AssetEditors;
const editor = withReact(createEditor());
editor.defaultModels = () => ({});
function Tiles({ onRead }: { onRead: (editors: AssetEditors) => void }) {
	onRead(useAssetEditors());
	return null;
}

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

const dialogs = () =>
	Array.from(container.querySelectorAll<HTMLElement>("[data-dialog]"));
const openDialogs = () => dialogs().map((dialog) => dialog.dataset.dialog);
const clickDialog = () => act(() => dialogs()[0]?.click());

beforeEach(() => {
	root = createRoot(container);
	act(() =>
		root.render(
			<Slate editor={editor} initialValue={[]}>
				<AssetEditProvider>
					<Tiles onRead={(read) => (editors = read)} />
				</AssetEditProvider>
			</Slate>,
		),
	);
});

afterEach(() => act(() => root.unmount()));

describe("AssetEditProvider", () => {
	it("mounts no dialog until a tile opens one", () => {
		expect(openDialogs()).toEqual([]);
	});

	it("shows only the dialog of the asset opened last", () => {
		act(() => editors.editAsset("asset_references"));
		expect(openDialogs()).toEqual(["asset_style"]);

		act(() => editors.editAsset("asset_character", "Narrator"));
		expect(openDialogs()).toEqual(["character Narrator"]);

		act(() => editors.editAsset("asset_style"));
		expect(openDialogs()).toEqual(["asset_style"]);

		act(() => editors.editAsset("asset_character", "Mia"));
		expect(openDialogs()).toEqual(["character Mia"]);
	});

	it("adds a new character and hands it to its edit dialog", () => {
		act(() => editors.openCreateCharacter());
		expect(openDialogs()).toEqual(["create"]);

		clickDialog();
		expect(findAsset(editor.children, "asset_character", "Mia")).toMatchObject({
			id: "asset_character:Mia",
		});
		expect(openDialogs()).toEqual(["character Mia"]);
	});

	it("adds the narrator with no avatar", () => {
		act(() => editors.editAsset("asset_character", NARRATOR));

		expect(
			findAsset(editor.children, "asset_character", NARRATOR),
		).toMatchObject({ generationAttributes: NO_AVATAR });
	});

	it("unmounts the dialog when it closes", () => {
		act(() => editors.editAsset("asset_style"));

		clickDialog();
		expect(openDialogs()).toEqual([]);
	});
});
