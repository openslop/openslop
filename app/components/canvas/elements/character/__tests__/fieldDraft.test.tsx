// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { type } from "@/app/components/canvas/__tests__/_mount";
import { TextAreaField } from "../fields";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
const root = createRoot(container);
const write = vi.fn();
const render = (value: string) =>
	act(() =>
		root.render(<TextAreaField label="Look" value={value} onChange={write} />),
	);
const field = () => {
	const textarea = container.querySelector("textarea");
	if (!textarea) throw new Error("no textarea");
	return textarea;
};

afterEach(() => act(() => root.render(null)));

describe("a field bound to the canvas", () => {
	it("keeps what was typed while the canvas has yet to publish it, then follows an outside change", async () => {
		await render("tall");

		await type(field(), "tall and thin");

		expect(write).toHaveBeenLastCalledWith("tall and thin");
		expect(field().value).toBe("tall and thin");

		await render("short");

		expect(field().value).toBe("short");
	});
});
