// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { elementSchema } from "@/lib/canvas/elementConnector";
import { mountOnCanvas } from "../../__tests__/_mount";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/components/ui/select-menu", async (original) => ({
	...(await original<typeof import("@/components/ui/select-menu")>()),
	SelectMenu: (await import("../../__tests__/_mount")).SelectMenuStub,
}));

const { AttributeRows } = await import("../AttributeRows");

let canvas: ReturnType<typeof mountOnCanvas>;
afterEach(() => canvas.unmount());

const character = (attrs: Record<string, string>) =>
	asset("asset_character", { name: "Mia", attrs });

const renderRows = (element: ReturnType<typeof character>) =>
	canvas.render(
		<AttributeRows
			element={element}
			specs={elementSchema(element).settingsAttributes}
		/>,
	);

const row = (label: string) => {
	const found = Array.from(document.body.querySelectorAll("span")).find(
		(span) => span.textContent === label,
	)?.parentElement;
	if (!found) throw new Error(`no row labelled ${label}`);
	return found;
};

const control = (label: string) =>
	row(label).querySelector("button")?.getAttribute("aria-label");

describe("AttributeRows", () => {
	it("lists one labelled control per attribute, showing the element's value", () => {
		const element = character({ gender: "feminine" });
		canvas = mountOnCanvas([element]);

		renderRows(element);

		expect(control("Gender")).toBe("Gender: feminine");
		expect(control("Age")).toBe("Age: —");
		expect(row("Description")).toBeTruthy();
	});
});
