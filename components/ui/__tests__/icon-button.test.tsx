import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { IconButton } from "../icon-button";

const classesOf = (node: React.ReactElement) => {
	const match = renderToStaticMarkup(node).match(/class="([^"]*)"/);
	if (!match) throw new Error("button has no class attribute");
	return match[1].split(" ");
};

describe("IconButton", () => {
	it("is a square without a chip by default", () => {
		const classes = classesOf(<IconButton ariaLabel="Go" />);
		expect(classes).toContain("rounded-md");
		expect(classes).not.toContain("rounded-full");
		expect(classes).not.toContain("bg-muted");
	});

	it("rounds fully for shape=round", () => {
		const classes = classesOf(<IconButton ariaLabel="Go" shape="round" />);
		expect(classes).toContain("rounded-full");
		expect(classes).not.toContain("rounded-md");
	});

	it("carries its own backdrop with chip", () => {
		expect(classesOf(<IconButton ariaLabel="Go" chip />)).toContain("bg-muted");
	});
});
