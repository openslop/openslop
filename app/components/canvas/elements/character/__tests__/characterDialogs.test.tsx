// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { castNames, findAsset } from "@/lib/canvas/assets";
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
vi.mock("../../attributes/ModelAttribute", () => ({ ModelAttribute: Nothing }));
vi.mock("../VoiceEditor", () => ({ VoiceEditor: Nothing }));
vi.mock("@/components/ui/confirm-delete-dialog", () => ({
	ConfirmDeleteDialog: (props: { target?: string; onConfirm: () => void }) =>
		props.target ? (
			<button data-confirm={props.target} onClick={props.onConfirm} />
		) : null,
}));

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
	asset("cast", { name: "Mia", text: appearance });

const appearanceOf = (name: string) => {
	const cast = findAsset(canvas.editor.children, "cast", name);
	return cast && getElementBodyText(cast);
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

	it("adds a cast element under the name and hands the name on", async () => {
		canvas = mountOnCanvas();
		open();

		await type(
			field<HTMLInputElement>('input[aria-label="Character name"]'),
			"Mia",
		);
		await click('button[type="submit"]');

		expect(castNames(canvas.editor.children)).toEqual(["Mia"]);
		expect(canvas.editor.children[0]).toMatchObject({ id: "cast:Mia" });
		expect(onCreated).toHaveBeenCalledWith("Mia");
	});

	it("refuses a name the cast already has", async () => {
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

	it("shows the appearance the cast element holds and writes edits back to it", async () => {
		canvas = mountOnCanvas([mia("a girl")]);
		open();
		const appearance = field<HTMLTextAreaElement>("textarea");
		expect(appearance.value).toBe("a girl");

		await type(appearance, "a girl with a red scarf");

		expect(appearanceOf("Mia")).toBe("a girl with a red scarf");
		expect(canvas.editor.children).toHaveLength(1);
	});

	it("renders nothing for a name the cast does not know", () => {
		canvas = mountOnCanvas([scene([content("narration", "n1", "hello")])]);

		open();

		expect(document.body.querySelector("textarea")).toBeNull();
	});

	it("deletes the character once confirmed, and closes", async () => {
		canvas = mountOnCanvas([mia("a girl")]);
		open();

		const remove = Array.from(document.body.querySelectorAll("button")).find(
			(button) => button.textContent === "Delete",
		);
		await act(async () => remove?.click());
		await click('[data-confirm="Mia"]');

		expect(castNames(canvas.editor.children)).toEqual([]);
		expect(onClose).toHaveBeenCalledOnce();
	});
});
