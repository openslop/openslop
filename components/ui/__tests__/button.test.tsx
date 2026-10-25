import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../button";

const classesOf = (node: React.ReactElement) => {
	const match = renderToStaticMarkup(node).match(/class="([^"]*)"/);
	if (!match) throw new Error("button has no class attribute");
	return match[1].split(" ");
};

describe("Button sizes", () => {
	it("inline sets no height or padding, so it hugs its label", () => {
		const classes = classesOf(<Button size="inline">Reset</Button>);
		expect(classes.filter((c) => /^(h|p|px|py)-/.test(c))).toEqual([]);
	});

	it("2xs sits below xs on the scale", () => {
		expect(classesOf(<Button size="2xs">Connect</Button>)).toContain("h-5");
		expect(classesOf(<Button size="xs">Connect</Button>)).toContain("h-6");
	});
});
