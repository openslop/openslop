import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createEditor } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import type { AttributeSpec } from "@/lib/connectors/attributes/schema";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { AttributeBadge } from "../AttributeBadge";
import { splitAttributes } from "@/lib/video/elementAttributes";

const elementWith = (
	customAttributes: Record<string, string>,
): CanvasContentElement =>
	({
		id: "el",
		type: "animated_image",
		...splitAttributes(customAttributes),
		children: [{ id: "text", type: "animated_image", text: "" }],
	}) as unknown as CanvasContentElement;

const motionSpec: AttributeSpec = {
	label: "Motion",
	edit: { kind: "enum", options: ["none", "zoom_in"] },
};

function render(
	element: CanvasContentElement,
	spec: AttributeSpec,
	attrKey = "motion",
) {
	const editor = withReact(createEditor());
	return renderToStaticMarkup(
		<Slate editor={editor} initialValue={[element as never]}>
			<Editable />
			<AttributeBadge element={element} attrKey={attrKey} spec={spec} />
		</Slate>,
	);
}

const control = (html: string) =>
	html.match(/aria-label="[^:]+: ([^"]*)"/)?.[1];

describe("AttributeBadge", () => {
	it("stays editable when the attribute key is absent", () => {
		const html = render(elementWith({}), motionSpec);
		expect(html).toContain("aria-label");
		expect(control(html)).toBe("—");
	});

	it("shows the element's own value", () => {
		expect(
			control(render(elementWith({ motion: "zoom_in" }), motionSpec)),
		).toBe("zoom_in");
	});

	it("never presents a value the element does not have", () => {
		expect(render(elementWith({}), motionSpec)).not.toContain("none");
	});

	it("omits the unit suffix when there is no value", () => {
		const durationSpec: AttributeSpec = {
			label: "Duration",
			unit: "s",
			edit: { kind: "enum", options: ["5", "10"] },
		};
		const html = render(elementWith({}), durationSpec, "duration");
		expect(control(html)).toBe("—");
		expect(html).not.toContain(">s<");
	});

	it("renders nothing with no value and no edit affordance", () => {
		expect(render(elementWith({}), { label: "Motion" })).not.toContain(
			"Motion",
		);
	});
});
