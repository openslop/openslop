import { describe, expect, it } from "vitest";
import type { RenderElementProps } from "slate-react";
import { splitTextDirection } from "../utils/textDirection";

const baseAttributes = {
	"data-slate-node": "element",
	ref: null,
} satisfies RenderElementProps["attributes"];

describe("splitTextDirection", () => {
	it("lifts dir out of the node attributes", () => {
		const { dir, nodeAttributes } = splitTextDirection({
			...baseAttributes,
			dir: "rtl",
		});

		expect(dir).toBe("rtl");
		expect(nodeAttributes).not.toHaveProperty("dir");
		expect(nodeAttributes).toEqual(baseAttributes);
	});

	it("leaves left-to-right blocks undirected", () => {
		const { dir, nodeAttributes } = splitTextDirection(baseAttributes);

		expect(dir).toBeUndefined();
		expect(nodeAttributes).toEqual(baseAttributes);
	});

	it("preserves the attributes Slate uses to anchor the node", () => {
		const ref = () => {};
		const { nodeAttributes } = splitTextDirection({
			"data-slate-node": "element",
			"data-slate-inline": true,
			ref,
			dir: "rtl",
		});

		expect(nodeAttributes).toEqual({
			"data-slate-node": "element",
			"data-slate-inline": true,
			ref,
		});
	});
});
