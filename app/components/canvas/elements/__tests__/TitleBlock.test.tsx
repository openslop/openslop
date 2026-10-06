import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { RenderElementProps } from "slate-react";
import { createTitle } from "@/lib/canvas/title";
import { TitleBlock } from "../TitleBlock";

const attributes = {
	"data-slate-node": "element",
	ref: () => {},
} as RenderElementProps["attributes"];

const render = (text: string) =>
	renderToStaticMarkup(
		<TitleBlock attributes={attributes} element={createTitle(text)}>
			{text}
		</TitleBlock>,
	);

describe("TitleBlock", () => {
	it("reads as Untitled while the project has no name", () => {
		expect(render("")).toContain("Untitled");
	});

	it("shows only the name once it has one", () => {
		const html = render("Moon");

		expect(html).toContain("Moon");
		expect(html).not.toContain("Untitled");
	});
});
