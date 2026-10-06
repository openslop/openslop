// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import {
	characterNames,
	findAsset,
	NARRATOR,
	NO_AVATAR,
} from "@/lib/canvas/assets";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { content, scene } from "../../../__tests__/fixtures";
import { click, mountOnCanvas, type } from "../../../__tests__/_mount";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const Nothing = () => null;
vi.mock("../../ElementGenerationContext", () => ({
	ElementGenerationProvider: ({ children }: { children: ReactNode }) =>
		children,
}));
vi.mock("../../GenerateButton", () => ({
	ElementGenerateButton: Nothing,
	ElementStaleIndicator: Nothing,
}));
vi.mock("../../ElementHistoryButton", () => ({
	ElementHistoryButton: Nothing,
}));
vi.mock("../../ElementUploadButton", () => ({ ElementUploadButton: Nothing }));
vi.mock("../../OutputPreview", () => ({ OutputPreview: Nothing }));
vi.mock("../../attributes/ModelAttribute", () => ({
	ModelAttribute: () => <button type="button">Avatar model</button>,
}));
vi.mock("../VoiceEditor", () => ({ VoiceEditor: Nothing }));

const { CharacterEditModal } = await import("../CharacterEditModal");
const { NewCharacterDialog } = await import("../NewCharacterDialog");

let canvas: ReturnType<typeof mountOnCanvas>;
afterEach(() => canvas.unmount());

const field = <T extends HTMLElement>(selector: string) => {
	const found = document.body.querySelector<T>(selector);
	if (!found) throw new Error(`nothing matches ${selector}`);
	return found;
};

const mia = (appearance: string) =>
	asset("asset_character", { name: "Mia", text: appearance });

const appearanceOf = (name: string) => {
	const character = findAsset(canvas.editor.children, "asset_character", name);
	return character && getElementBodyText(character);
};

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

	it("refuses a name a character already has", async () => {
		canvas = mountOnCanvas([mia("a girl")]);
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

	it("shows the appearance the character asset holds and writes edits back to it", async () => {
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

	it("turns a character's avatar off and back on", async () => {
		canvas = mountOnCanvas([mia("a girl")]);
		open();

		await click('button[role="switch"]');
		expect(
			findAsset(canvas.editor.children, "asset_character", "Mia"),
		).toMatchObject({
			generationAttributes: NO_AVATAR,
		});
		expect(document.body.querySelector("textarea")).toBeNull();

		await click('button[role="switch"]');
		expect(
			findAsset(canvas.editor.children, "asset_character", "Mia")
				?.generationAttributes?.avatar,
		).toBeUndefined();
		expect(document.body.querySelector("textarea")).not.toBeNull();
	});

	it("renders nothing for a name no character has", () => {
		canvas = mountOnCanvas([scene([content("narration", "n1", "hello")])]);

		open();

		expect(document.body.querySelector("textarea")).toBeNull();
	});

	it("deletes the character at once, and closes", async () => {
		canvas = mountOnCanvas([mia("a girl")]);
		open();

		const remove = Array.from(document.body.querySelectorAll("button")).find(
			(button) => button.textContent === "Delete",
		);
		await act(async () => remove?.click());

		expect(characterNames(canvas.editor.children)).toEqual([]);
		expect(onClose).toHaveBeenCalledOnce();
	});
});
