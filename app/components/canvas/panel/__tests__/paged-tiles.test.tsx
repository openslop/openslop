// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { click } from "@/app/components/canvas/__tests__/_mount";
import { PagedTiles } from "../paged-tiles";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
const root = createRoot(container);

const render = (count: number) =>
	act(() =>
		root.render(
			<PagedTiles label="Characters" empty={<p>No characters yet</p>}>
				{Array.from({ length: count }, (_, index) => (
					<i key={index}>{index}</i>
				))}
			</PagedTiles>,
		),
	);

const shown = () =>
	Array.from(container.querySelectorAll("i"), (tile) => tile.textContent);

afterEach(() => act(() => root.render(null)));

describe("PagedTiles", () => {
	it("says so when there is nothing to show", async () => {
		await render(0);

		expect(container.textContent).toBe("No characters yet");
	});

	it("shows two tiles with no pager while they fit one page", async () => {
		await render(2);

		expect(shown()).toEqual(["0", "1"]);
		expect(container.querySelector("nav")).toBeNull();
	});

	it("pages with the arrows and jumps with a dot", async () => {
		await render(5);

		expect(container.querySelectorAll("[aria-label^='Page ']")).toHaveLength(3);
		await click("[aria-label='Next page']");
		expect(shown()).toEqual(["2", "3"]);
		await click("[aria-label='Page 3']");
		expect(shown()).toEqual(["4"]);
		expect(
			container
				.querySelector("[aria-current='page']")
				?.getAttribute("aria-label"),
		).toBe("Page 3");
		await click("[aria-label='Previous page']");
		expect(shown()).toEqual(["2", "3"]);
	});

	it("falls back to the last page when the tiles shrink under the one shown", async () => {
		await render(5);
		await click("[aria-label='Page 3']");

		await render(3);

		expect(shown()).toEqual(["2"]);
	});
});
