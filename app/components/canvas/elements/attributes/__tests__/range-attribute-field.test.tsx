// @vitest-environment happy-dom

import { act } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { element } from "@/lib/canvas/__tests__/_assets";
import { flatAttributes } from "@/lib/canvas/element-attributes";
import { findElementById } from "@/lib/canvas/editor-ops";
import { mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import { durationDef, volumeDef } from "@/lib/connectors/attributes/common";
import type { AttributeDef } from "@/lib/connectors/attributes/schema";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AttributeBadge } from "@/app/components/canvas/elements/attribute-badge";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let canvas: ReturnType<typeof mountOnCanvas>;

afterEach(() => canvas.unmount());

function mount(def: AttributeDef, attributes: Record<string, string>) {
	canvas = mountOnCanvas([element("v1", "video", "", attributes)]);
	show(def, attributes);
}

/** Renders the field over the element as it now reads. */
function show(def: AttributeDef, attributes: Record<string, string>) {
	canvas.render(
		<TooltipProvider>
			<AttributeBadge
				element={element("v1", "video", "", attributes)}
				def={def}
			/>
		</TooltipProvider>,
	);
}

function thumb(): HTMLElement {
	const found = document.body.querySelector<HTMLElement>('[role="slider"]');
	if (!found) throw new Error("no slider");
	return found;
}

const readout = () => document.body.querySelector(".font-numeric")?.textContent;

const stored = (key: string) => {
	const [video] = findElementById(canvas.editor, "v1") ?? [];
	return video && flatAttributes(video)[key];
};

const press = (key: string) =>
	act(async () => {
		thumb().dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
	});

describe("RangeAttributeField", () => {
	it("sits at the element's value", () => {
		mount(durationDef(15), { duration: "12" });
		expect(thumb().getAttribute("aria-valuenow")).toBe("12");
		expect(thumb().getAttribute("aria-label")).toBe("Duration");
		expect(readout()).toBe("12s");
	});

	it("rests on the default while the element has no value", () => {
		mount(volumeDef("5"), {});
		expect(thumb().getAttribute("aria-valuenow")).toBe("5");
		expect(readout()).toBe("—");
	});

	it("writes each arrow-key step to the element", async () => {
		mount(volumeDef("5"), { volume: "5" });
		await press("ArrowRight");
		expect(stored("volume")).toBe("6");
		expect(readout()).toBe("6");
	});

	it("stops at the ends of its range", async () => {
		mount(durationDef(15), { duration: "15" });
		await press("ArrowRight");
		expect(stored("duration")).toBe("15");
	});

	it("follows a value changed elsewhere, such as an undo", async () => {
		mount(volumeDef("5"), { volume: "5" });
		await press("ArrowRight");
		show(volumeDef("5"), { volume: "6" });
		show(volumeDef("5"), { volume: "5" });
		expect(thumb().getAttribute("aria-valuenow")).toBe("5");
		expect(readout()).toBe("5");
	});
});
