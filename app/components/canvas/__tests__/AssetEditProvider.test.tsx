// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { findAsset, NARRATOR } from "@/lib/canvas/assets";
import {
	AssetEditProvider,
	useAssetEditors,
	type AssetEditors,
} from "../elements/character/AssetEditProvider";
import { mountOnCanvas } from "./_mount";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const created = vi.hoisted(() => ({ name: "Mia" }));

vi.mock("../elements/character/NewCharacterDialog", () => ({
	NewCharacterDialog: ({
		onCreated,
	}: {
		onCreated: (name: string) => void;
	}) => <button data-dialog="create" onClick={() => onCreated(created.name)} />,
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
function Tiles({ onRead }: { onRead: (editors: AssetEditors) => void }) {
	onRead(useAssetEditors());
	return null;
}

let canvas: ReturnType<typeof mountOnCanvas>;
const editor = () => canvas.editor;

const dialogs = () =>
	Array.from(document.body.querySelectorAll<HTMLElement>("[data-dialog]"));
const openDialogs = () => dialogs().map((dialog) => dialog.dataset.dialog);
const clickDialog = () => act(() => dialogs()[0]?.click());
beforeEach(() => {
	created.name = "Mia";
	canvas = mountOnCanvas();
	canvas.render(
		<AssetEditProvider>
			<Tiles onRead={(read) => (editors = read)} />
		</AssetEditProvider>,
	);
});

afterEach(() => canvas.unmount());

describe("AssetEditProvider", () => {
	it("mounts no dialog until a tile opens one", () => {
		expect(openDialogs()).toEqual([]);
	});

	it("shows only the dialog of the asset opened last", () => {
		act(() => editors.editAsset("asset_references"));
		expect(openDialogs()).toEqual(["asset_style"]);

		act(() => editors.editAsset("asset_voice", NARRATOR));
		expect(openDialogs()).toEqual(["character Narrator"]);

		act(() => editors.editAsset("asset_style"));
		expect(openDialogs()).toEqual(["asset_style"]);

		act(() => editors.editAsset("asset_avatar", "Mia"));
		expect(openDialogs()).toEqual(["character Mia"]);
	});

	it("adds a new character's look and voice and hands them to their edit dialog", () => {
		act(() => editors.openCreateCharacter());
		expect(openDialogs()).toEqual(["create"]);

		clickDialog();
		expect(findAsset(editor().children, "asset_avatar", "Mia")).toBeDefined();
		expect(findAsset(editor().children, "asset_voice", "Mia")).toBeDefined();
		expect(openDialogs()).toEqual(["character Mia"]);
	});

	it("adds a new narrator as a voice with no avatar", () => {
		created.name = NARRATOR;
		act(() => editors.openCreateCharacter());

		clickDialog();
		expect(findAsset(editor().children, "asset_voice", NARRATOR)).toBeDefined();
		expect(
			findAsset(editor().children, "asset_avatar", NARRATOR),
		).toBeUndefined();
		expect(openDialogs()).toEqual(["character Narrator"]);
	});

	it("adds only the asset it opens", () => {
		act(() => editors.editAsset("asset_voice", "Kai"));

		expect(findAsset(editor().children, "asset_voice", "Kai")).toBeDefined();
		expect(findAsset(editor().children, "asset_avatar", "Kai")).toBeUndefined();
	});

	it("unmounts the dialog when it closes", () => {
		act(() => editors.editAsset("asset_style"));

		clickDialog();
		expect(openDialogs()).toEqual([]);
	});
});
