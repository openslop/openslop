import { describe, expect, it } from "vitest";
import type { ClientRect } from "@dnd-kit/core";
import { displaceListedItems } from "../dnd/sortingStrategy";

const rectAt = (top: number): ClientRect => ({
	top,
	bottom: top + 100,
	left: 0,
	right: 200,
	width: 200,
	height: 100,
});

const rects = [rectAt(0), rectAt(100), rectAt(200)];

const displace = (index: number) =>
	displaceListedItems({
		rects,
		activeIndex: 0,
		overIndex: 2,
		index,
		activeNodeRect: rects[0],
	});

describe("displaceListedItems", () => {
	it("displaces a listed item", () => {
		expect(displace(1)).toEqual({ x: 0, y: -100, scaleX: 1, scaleY: 1 });
	});

	it("leaves an item that is not in the sortable list alone", () => {
		expect(displace(-1)).toBeNull();
	});
});
