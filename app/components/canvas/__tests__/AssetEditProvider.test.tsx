// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
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
vi.mock("../elements/character/AssetDialog", () => ({
	AssetDialog: (props: { title: string; onClose: () => void }) => (
		<button data-dialog={props.title.toLowerCase()} onClick={props.onClose} />
	),
}));
vi.mock("../elements/style/ArtStyleModal", () => ({
	ArtStyleModal: ({ onClose }: { onClose: () => void }) => (
		<button data-dialog="style" onClick={onClose} />
	),
}));

let editors: AssetEditors;
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
			<AssetEditProvider>
				<Tiles onRead={(read) => (editors = read)} />
			</AssetEditProvider>,
		),
	);
});

afterEach(() => act(() => root.unmount()));

describe("AssetEditProvider", () => {
	it("mounts no dialog until a tile opens one", () => {
		expect(openDialogs()).toEqual([]);
	});

	it("shows only the dialog of the asset opened last", () => {
		act(() => editors.editAsset("voice"));
		expect(openDialogs()).toEqual(["narrator"]);

		act(() => editors.editAsset("style"));
		expect(openDialogs()).toEqual(["style"]);

		act(() => editors.editAsset("cast", "Mia"));
		expect(openDialogs()).toEqual(["character Mia"]);
	});

	it("hands a new character to its edit dialog", () => {
		act(() => editors.openCreateCharacter());
		expect(openDialogs()).toEqual(["create"]);

		clickDialog();
		expect(openDialogs()).toEqual(["character Mia"]);
	});

	it("opens a character's voice in their own dialog", () => {
		act(() => editors.editAsset("voice", "Mia"));
		expect(openDialogs()).toEqual(["character Mia"]);
	});

	it("unmounts the dialog when it closes", () => {
		act(() => editors.editAsset("voice"));

		clickDialog();
		expect(openDialogs()).toEqual([]);
	});
});
