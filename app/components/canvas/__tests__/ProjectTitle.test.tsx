import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProjectTitle } from "../ProjectTitle";

describe("ProjectTitle", () => {
	it("reads as Untitled while the project has no name", () => {
		expect(renderToStaticMarkup(<ProjectTitle empty />)).toContain("Untitled");
	});

	it("shows only the name once it has one", () => {
		const html = renderToStaticMarkup(
			<ProjectTitle empty={false}>Moon</ProjectTitle>,
		);

		expect(html).toContain("Moon");
		expect(html).not.toContain("Untitled");
	});
});
