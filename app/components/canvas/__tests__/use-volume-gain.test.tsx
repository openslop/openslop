// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { Transforms, type Descendant } from "slate";
import { useVolumeGain } from "../hooks/use-volume-gain";
import { mountOnCanvas } from "./_mount";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const sound = (id: string, volume?: string): Descendant => ({
	id,
	type: "sound",
	...(volume === undefined ? {} : { layoutAttributes: { volume } }),
	children: [{ id: `${id}-t`, type: "sound", text: "a door slam" }],
});

function Gain({ elementId }: { elementId: string }) {
	return <output>{useVolumeGain(elementId)}</output>;
}

let canvas: ReturnType<typeof mountOnCanvas>;

beforeEach(() => {
	canvas = mountOnCanvas([sound("el-1", "4"), sound("el-2")]);
});

afterEach(() => canvas.unmount());

const gain = () => document.body.querySelector("output")?.textContent;

const gainOf = (elementId: string) => {
	canvas.render(<Gain elementId={elementId} />);
	return gain();
};

describe("useVolumeGain", () => {
	it("is the element's Volume on the 0-1 gain scale", () => {
		expect(gainOf("el-1")).toBe("0.4");
	});

	it("is full gain for an element with no Volume set", () => {
		expect(gainOf("el-2")).toBe("1");
	});

	it("is full gain for an element that is not on the canvas", () => {
		expect(gainOf("missing")).toBe("1");
	});

	it("follows an edit to the element's Volume", async () => {
		gainOf("el-1");

		await act(async () =>
			Transforms.setNodes(
				canvas.editor,
				{ layoutAttributes: { volume: "7" } },
				{ at: [0] },
			),
		);

		expect(gain()).toBe("0.7");
	});
});
