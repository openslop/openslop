// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ConfirmDeleteDialog } from "../confirm-delete-dialog";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;
const onClose = vi.fn();
const onConfirm = vi.fn();

beforeEach(() => {
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	vi.clearAllMocks();
});

const render = (target: string | undefined) =>
	act(() =>
		root.render(
			<ConfirmDeleteDialog
				target={target}
				onClose={onClose}
				title={(name) => `Delete ${name}?`}
				description="It can't be undone."
				actionLabel="Delete character"
				onConfirm={onConfirm}
			/>,
		),
	);

const dialog = () => document.querySelector("[role=alertdialog]");
const button = (label: string) =>
	Array.from(dialog()?.querySelectorAll("button") ?? []).find(
		(b) => b.textContent === label,
	);

describe("ConfirmDeleteDialog", () => {
	it("stays closed without a target", () => {
		render(undefined);
		expect(dialog()).toBeNull();
	});

	it("names the target and hands it back on confirm", () => {
		render("Ada");
		expect(dialog()?.textContent).toContain("Delete Ada?");
		act(() => button("Delete character")?.click());
		expect(onConfirm).toHaveBeenCalledExactlyOnceWith("Ada");
	});

	it("cancel closes without confirming", () => {
		render("Ada");
		act(() => button("Cancel")?.click());
		expect(onClose).toHaveBeenCalledOnce();
		expect(onConfirm).not.toHaveBeenCalled();
	});
});
