// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { assetNames, findAsset } from "@/lib/canvas/assets";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { content, scene } from "@/app/components/canvas/__tests__/fixtures";
import {
	click,
	mountOnCanvas,
	type,
} from "@/app/components/canvas/__tests__/_mount";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const Nothing = () => null;
const toast = Object.assign(vi.fn(), { dismiss: vi.fn() });
vi.mock("sonner", () => ({ toast }));
vi.mock("@/app/components/canvas/elements/element-generation-context", () => ({
	ElementGenerationProvider: ({ children }: { children: ReactNode }) =>
		children,
}));
vi.mock("@/app/components/canvas/elements/generate-button", () => ({
	ElementGenerateButton: Nothing,
	ElementStaleIndicator: Nothing,
}));
vi.mock("@/app/components/canvas/elements/element-history-popover", () => ({
	ElementHistoryPopover: Nothing,
}));
vi.mock("@/app/components/canvas/elements/reset-edits-button", () => ({
	ResetEditsButton: Nothing,
}));
vi.mock("@/app/components/canvas/elements/element-media-picker", () => ({
	AddMediaButton: Nothing,
}));
vi.mock("@/app/components/canvas/elements/output-preview", () => ({
	OutputPreview: Nothing,
}));
vi.mock("@/app/components/canvas/elements/element-settings", () => ({
	ElementSettings: Nothing,
}));
vi.mock("@/app/components/canvas/elements/attributes/model-attribute", () => ({
	ModelAttribute: () => <button type="button">Avatar model</button>,
}));
vi.mock("../voice-editor", () => ({
	VoiceEditor: () => <div data-voice-editor />,
}));

const { CharacterEditModal } = await import("../character-edit-modal");
const { NewAssetDialog } = await import("../new-asset-dialog");
const { PictureEditModal } = await import("../picture-edit-modal");

let canvas: ReturnType<typeof mountOnCanvas>;
afterEach(() => canvas.unmount());

const field = <T extends HTMLElement>(selector: string) => {
	const found = document.body.querySelector<T>(selector);
	if (!found) throw new Error(`nothing matches ${selector}`);
	return found;
};

const mia = (appearance: string) =>
	asset("asset_avatar", { name: "Mia", text: appearance });

const miaVoice = () => asset("asset_voice", { name: "Mia" });

const appearanceOf = (name: string) => {
	const avatar = findAsset(canvas.editor.children, "asset_avatar", name);
	return avatar && getElementBodyText(avatar);
};

const switchOf = (label: string) => {
	const labelled = Array.from(document.body.querySelectorAll("label")).find(
		(each) => each.textContent === label,
	);
	const found = labelled && document.getElementById(labelled.htmlFor);
	if (!found) throw new Error(`no ${label} switch`);
	return found;
};

const flip = (label: string) => act(async () => switchOf(label).click());

const isOn = (label: string) =>
	switchOf(label).getAttribute("aria-checked") === "true";

const has = (type: "asset_avatar" | "asset_voice") =>
	findAsset(canvas.editor.children, type, "Mia") !== undefined;

const voiceEditorShown = () =>
	document.body.querySelector("[data-voice-editor]") !== null;

describe("NewAssetDialog", () => {
	const onCreated = vi.fn();
	const open = (preset = {}) =>
		canvas.render(
			<Dialog open>
				<NewAssetDialog preset={preset} onCreated={onCreated} />
			</Dialog>,
		);

	it("hands on a character's name, normalized, and adds nothing itself", async () => {
		canvas = mountOnCanvas();
		open();

		await type(
			field<HTMLInputElement>('input[aria-label="Character name"]'),
			"narrator",
		);
		await click('button[type="submit"]');

		expect(onCreated).toHaveBeenCalledWith("character", "Narrator");
		expect(canvas.editor.children).toEqual([]);
	});

	it("hands on the kind picked", async () => {
		canvas = mountOnCanvas();
		open({ name: "old mill" });

		await click('button[role="radio"]:nth-child(2)');
		await click('button[type="submit"]');

		expect(onCreated).toHaveBeenCalledWith("location", "Old Mill");
	});

	it.each([
		["a character's look", () => mia("a girl")],
		["a character's voice", miaVoice],
		["a prop", () => asset("asset_prop", { name: "Mia" })],
	])("refuses a name %s already holds, whatever the kind", async (_, held) => {
		canvas = mountOnCanvas([held()]);
		open({ kind: "location" });

		await type(
			field<HTMLInputElement>('input[aria-label="Location name"]'),
			"Mia",
		);

		expect(field('[role="alert"]').textContent).toContain("already taken");
		expect(field<HTMLButtonElement>('button[type="submit"]').disabled).toBe(
			true,
		);
	});
});

describe("PictureEditModal", () => {
	it("edits a location's appearance and deletes it", async () => {
		const onClose = vi.fn();
		canvas = mountOnCanvas([
			asset("asset_location", { name: "Mill", text: "an old mill" }),
		]);
		canvas.render(
			<Dialog open>
				<PictureEditModal name="Mill" onClose={onClose} />
			</Dialog>,
		);
		const appearance = () => {
			const mill = findAsset(canvas.editor.children, "asset_location", "Mill");
			return mill && getElementBodyText(mill);
		};

		expect(field<HTMLTextAreaElement>("textarea").value).toBe("an old mill");
		await type(field<HTMLTextAreaElement>("textarea"), "a burnt mill");
		expect(appearance()).toBe("a burnt mill");

		const remove = Array.from(document.body.querySelectorAll("button")).find(
			(button) => button.textContent === "Delete",
		);
		await act(async () => remove?.click());
		expect(onClose).toHaveBeenCalled();
		expect(findAsset(canvas.editor.children, "asset_location", "Mill")).toBe(
			undefined,
		);
	});
});

describe("CharacterEditModal", () => {
	const onClose = vi.fn();
	const open = () =>
		canvas.render(
			<Dialog open>
				<CharacterEditModal name="Mia" onClose={onClose} />
			</Dialog>,
		);

	it("shows the appearance the avatar asset holds and writes edits back to it", async () => {
		canvas = mountOnCanvas([mia("a girl")]);
		open();
		const appearance = field<HTMLTextAreaElement>("textarea");
		expect(appearance.value).toBe("a girl");

		await type(appearance, "a girl with a red scarf");

		expect(appearanceOf("Mia")).toBe("a girl with a red scarf");
		expect(canvas.editor.children).toHaveLength(1);
	});

	it("opens on the appearance, not on the controls beside it", () => {
		canvas = mountOnCanvas([mia("a girl")]);
		open();

		expect(document.activeElement).toBe(field("textarea"));
	});

	it("turns a character's avatar off and back on, keeping their voice", async () => {
		canvas = mountOnCanvas([mia("a girl"), miaVoice()]);
		open();
		expect(isOn("Avatar")).toBe(true);

		await flip("Avatar");
		expect(has("asset_avatar")).toBe(false);
		expect(has("asset_voice")).toBe(true);
		expect(isOn("Avatar")).toBe(false);
		expect(document.body.querySelector("textarea")).toBeNull();

		await flip("Avatar");
		expect(has("asset_avatar")).toBe(true);
		expect(document.body.querySelector("textarea")).not.toBeNull();
	});

	it("turns a character's voice off and back on, keeping their avatar", async () => {
		canvas = mountOnCanvas([mia("a girl"), miaVoice()]);
		open();
		expect(isOn("Voice")).toBe(true);
		expect(voiceEditorShown()).toBe(true);

		await flip("Voice");
		expect(has("asset_voice")).toBe(false);
		expect(appearanceOf("Mia")).toBe("a girl");
		expect(voiceEditorShown()).toBe(false);

		await flip("Voice");
		expect(has("asset_voice")).toBe(true);
		expect(voiceEditorShown()).toBe(true);
	});

	it("starts a name no character has with the avatar and voice off", () => {
		canvas = mountOnCanvas([scene([content("speech", "n1", "hello")])]);

		open();

		expect(isOn("Avatar")).toBe(false);
		expect(isOn("Voice")).toBe(false);
		expect(document.body.querySelector("textarea")).toBeNull();
		expect(voiceEditorShown()).toBe(false);
	});

	it("deletes the character's look and voice at once, closes, and brings them back from the toast's undo", async () => {
		canvas = mountOnCanvas([
			mia("a girl"),
			miaVoice(),
			asset("asset_voice", { name: "Narrator" }),
		]);
		open();

		const remove = Array.from(document.body.querySelectorAll("button")).find(
			(button) => button.textContent === "Delete",
		);
		await act(async () => remove?.click());

		expect(assetNames(canvas.editor.children, "character")).toEqual([
			"Narrator",
		]);
		expect(onClose).toHaveBeenCalledOnce();

		const [message, { action }] = toast.mock.lastCall ?? [];
		act(() => action.props.onClick());

		expect(message).toBe("Deleted Mia");
		expect(assetNames(canvas.editor.children, "character")).toEqual([
			"Mia",
			"Narrator",
		]);
		expect(appearanceOf("Mia")).toBe("a girl");
		expect(toast.dismiss).toHaveBeenCalledOnce();
	});
});
