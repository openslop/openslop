// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { findAsset } from "@/lib/canvas/assets";
import {
	useAssetEditors,
	type AssetEditors,
} from "../elements/asset-edit-context";
import { AssetEditProvider } from "../elements/character/asset-edit-provider";
import { mountOnCanvas } from "./_mount";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../elements/character/new-asset-dialog", () => ({
	NewAssetDialog: ({
		preset,
		onCreated,
	}: {
		preset: { kind?: string };
		onCreated: (kind: string, name: string) => void;
	}) => (
		<button
			data-dialog="create"
			onClick={() => onCreated(preset.kind ?? "character", "Mia")}
		/>
	),
}));
vi.mock("../elements/character/picture-edit-modal", () => ({
	PictureEditModal: (props: { name: string; onClose: () => void }) => (
		<button data-dialog={`picture ${props.name}`} onClick={props.onClose} />
	),
}));
vi.mock("../elements/character/character-edit-modal", () => ({
	CharacterEditModal: (props: { name: string; onClose: () => void }) => (
		<button data-dialog={`character ${props.name}`} onClick={props.onClose} />
	),
}));
vi.mock("../elements/style/art-style-modal", () => ({
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

		act(() => editors.editAsset("asset_voice", "Narrator"));
		expect(openDialogs()).toEqual(["character Narrator"]);

		act(() => editors.editAsset("asset_style"));
		expect(openDialogs()).toEqual(["asset_style"]);

		act(() => editors.editAsset("asset_avatar", "Mia"));
		expect(openDialogs()).toEqual(["character Mia"]);
	});

	it("adds a new character's look and voice and hands them to their edit dialog", () => {
		act(() => editors.openCreateAsset());
		expect(openDialogs()).toEqual(["create"]);

		clickDialog();
		expect(findAsset(editor().children, "asset_avatar", "Mia")).toBeDefined();
		expect(findAsset(editor().children, "asset_voice", "Mia")).toBeDefined();
		expect(openDialogs()).toEqual(["character Mia"]);
	});

	it("adds a new prop's picture alone and hands it to its edit dialog", () => {
		act(() => editors.openCreateAsset({ kind: "prop" }));

		clickDialog();
		expect(findAsset(editor().children, "asset_prop", "Mia")).toBeDefined();
		expect(findAsset(editor().children, "asset_voice", "Mia")).toBeUndefined();
		expect(openDialogs()).toEqual(["picture Mia"]);
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
