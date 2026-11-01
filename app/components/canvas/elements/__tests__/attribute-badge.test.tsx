import { z } from "zod";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createEditor } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import { timelineDurationDef } from "@/lib/connectors/attributes/common";
import type { AttributeDef } from "@/lib/connectors/attributes/schema";
import type { ContentElement } from "@/lib/canvas/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AttributeBadge } from "../attribute-badge";
import { element } from "@/lib/canvas/__tests__/_assets";

const elementWith = (customAttributes: Record<string, string>) =>
	element("el", "video", "", customAttributes);

const motionDef: AttributeDef = {
	key: "motion",
	label: "Motion",
	edit: { kind: "enum", value: z.enum(["none", "zoom_in"]) },
};

function render(element: ContentElement, def: AttributeDef) {
	const editor = withReact(createEditor());
	return renderToStaticMarkup(
		<TooltipProvider>
			<Slate editor={editor} initialValue={[element as never]}>
				<Editable />
				<AttributeBadge element={element} def={def} />
			</Slate>
		</TooltipProvider>,
	);
}

const control = (html: string) =>
	html.match(/aria-label="[^:]+: ([^"]*)"/)?.[1];

describe("AttributeBadge", () => {
	it("stays editable when the attribute key is absent", () => {
		const html = render(elementWith({}), motionDef);
		expect(html).toContain("aria-label");
		expect(control(html)).toBe("—");
	});

	it("shows the element's own value", () => {
		expect(control(render(elementWith({ motion: "zoom_in" }), motionDef))).toBe(
			"zoom_in",
		);
	});

	it("never presents a value the element does not have", () => {
		expect(control(render(elementWith({}), motionDef))).not.toBe("none");
	});

	it("omits the unit suffix when there is no value", () => {
		const durationDef: AttributeDef = {
			key: "duration",
			label: "Duration",
			unit: "s",
			edit: { kind: "enum", value: z.enum(["5", "10"]) },
		};
		const html = render(elementWith({}), durationDef);
		expect(control(html)).toBe("—");
		expect(html).not.toContain(">s<");
	});

	it("renders nothing for an attribute with no control", () => {
		expect(
			render(elementWith({ motion: "zoom_in" }), {
				key: "motion",
				label: "Motion",
			}),
		).not.toContain("zoom_in");
	});

	describe("seconds", () => {
		const reset = (html: string) =>
			html.match(/<button[^>]*aria-label="Reset timeline duration"[^>]*>/)?.[0];

		it("offers a reset once the field holds a value", () => {
			const html = render(
				elementWith({ timelineDuration: "4" }),
				timelineDurationDef,
			);
			expect(reset(html)).toBeDefined();
		});

		it("has nothing to reset while the field is on Auto", () => {
			const html = render(elementWith({}), timelineDurationDef);
			expect(reset(html)).toBeUndefined();
		});
	});
});
