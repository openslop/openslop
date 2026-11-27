// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import {
	holdReloadFor,
	reloadWhenSaved,
	toastNewVersion,
} from "../new-version-toast";

vi.mock("sonner", () => ({ toast: vi.fn() }));

const reload = vi.fn();
const holders: (() => void)[] = [];
const hold = (saved: boolean) =>
	holders.push(holdReloadFor(() => Promise.resolve(saved)));

beforeEach(() => {
	vi.stubGlobal("location", { reload });
});

afterEach(() => {
	for (const release of holders.splice(0)) release();
	vi.unstubAllGlobals();
});

describe("reloadWhenSaved", () => {
	it("reloads when nothing holds it back", async () => {
		await reloadWhenSaved();
		expect(reload).toHaveBeenCalledOnce();
	});

	it("reloads once every holder has saved", async () => {
		hold(true);
		hold(true);
		await reloadWhenSaved();
		expect(reload).toHaveBeenCalledOnce();
	});

	it("stays on the page when a holder could not save", async () => {
		hold(true);
		hold(false);
		await reloadWhenSaved();
		expect(reload).not.toHaveBeenCalled();
	});

	it("forgets a holder once released", async () => {
		const release = holdReloadFor(() => Promise.resolve(false));
		release();
		await reloadWhenSaved();
		expect(reload).toHaveBeenCalledOnce();
	});
});

describe("toastNewVersion", () => {
	const shown = () => {
		toastNewVersion();
		const [message, options] = vi.mocked(toast).mock.calls[0] ?? [];
		return { message, options };
	};

	it("offers a Reload that stays until the user acts on it", () => {
		const { message, options } = shown();
		expect(message).toBe("A new version of OpenSlop is available");
		expect(options).toMatchObject({
			id: "new-version",
			duration: Number.POSITIVE_INFINITY,
			action: { label: "Reload" },
		});
	});

	it("reloads from its action once the pending saves land", async () => {
		const { options } = shown();
		const action = options?.action;
		const event = { preventDefault: vi.fn() };
		if (typeof action !== "object" || !action || !("onClick" in action))
			throw new Error("no Reload action");

		action.onClick(event as never);
		await vi.waitFor(() => expect(reload).toHaveBeenCalledOnce());
		expect(event.preventDefault).toHaveBeenCalled();
	});
});
