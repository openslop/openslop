// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { characterNames, findAsset, NARRATOR } from "@/lib/canvas/assets";
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
const toast = vi.fn();
vi.mock("sonner", () => ({ toast }));
vi.mock("../../element-generation-context", () => ({
	ElementGenerationProvider: ({ children }: { children: ReactNode }) =>
		children,
}));
vi.mock("../../generate-button", () => ({
	ElementGenerateButton: Nothing,
	ElementStaleIndicator: Nothing,
}));
vi.mock("../../element-history-button", () => ({
	ElementHistoryButton: Nothing,
}));
vi.mock("../../element-upload-button", () => ({
	ElementUploadButton: Nothing,
}));
vi.mock("../../output-preview", () => ({ OutputPreview: Nothing }));
vi.mock("../../attributes/model-attribute", () => ({
	ModelAttribute: () => <button type="button">Avatar model</button>,
}));
vi.mock("../voice-editor", () => ({
	VoiceEditor: () => <div data-voice-editor />,
}));

const { CharacterEditModal } = await import("../character-edit-modal");
const { NewCharacterDialog } = await import("../new-character-dialog");

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

describe("NewCharacterDialog", () => {
	const onCreated = vi.fn();
	const open = () =>
		canvas.render(
			<Dialog open>
				<NewCharacterDialog onCreated={onCreated} />
			</Dialog>,
		);
	afterEach(() => onCreated.mockClear());

	it("hands on the name, normalized, and adds nothing itself", async () => {
		canvas = mountOnCanvas();
		open();

		await type(
			field<HTMLInputElement>('input[aria-label="Character name"]'),
			"narrator",
		);
		await click('button[type="submit"]');

		expect(onCreated).toHaveBeenCalledWith(NARRATOR);
		expect(canvas.editor.children).toEqual([]);
	});

	it.each([
		["a look", () => mia("a girl")],
		["a voice", miaVoice],
	])("refuses a name a character already has %s under", async (_, held) => {
		canvas = mountOnCanvas([held()]);
		open();

		await type(
			field<HTMLInputElement>('input[aria-label="Character name"]'),
			"Mia",
		);

		expect(field('[role="alert"]').textContent).toContain("already exists");
		expect(field<HTMLButtonElement>('button[type="submit"]').disabled).toBe(
			true,
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
	afterEach(() => onClose.mockClear());

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
		canvas = mountOnCanvas([scene([content("narration", "n1", "hello")])]);

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
			asset("asset_voice", { name: NARRATOR }),
		]);
		open();

		const remove = Array.from(document.body.querySelectorAll("button")).find(
			(button) => button.textContent === "Delete",
		);
		await act(async () => remove?.click());

		expect(characterNames(canvas.editor.children)).toEqual([NARRATOR]);
		expect(onClose).toHaveBeenCalledOnce();

		const [message, { action }] = toast.mock.lastCall ?? [];
		act(() => action.onClick());

		expect(message).toBe("Deleted Mia");
		expect(characterNames(canvas.editor.children)).toEqual(["Mia", NARRATOR]);
		expect(appearanceOf("Mia")).toBe("a girl");
	});
});
