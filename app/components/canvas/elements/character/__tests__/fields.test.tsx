import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EnumField, TextAreaField, TextField } from "../fields";

const noop = () => {};

describe("character fields", () => {
	it("TextField labels its input and passes the placeholder through", () => {
		const html = renderToStaticMarkup(
			<TextField
				label="Description"
				value={undefined}
				onChange={noop}
				placeholder="Free-text"
			/>,
		);
		expect(html).toContain("Description");
		expect(html).toContain('placeholder="Free-text"');
	});

	it("TextAreaField labels its textarea and shows the value", () => {
		const html = renderToStaticMarkup(
			<TextAreaField label="Appearance" value="tall" onChange={noop} />,
		);
		expect(html).toContain("Appearance");
		expect(html).toContain(">tall</textarea>");
	});

	it("EnumField's trigger is a button named after the label, empty as a dash", () => {
		const html = renderToStaticMarkup(
			<EnumField
				label="Gender"
				options={["male", "female"]}
				value={undefined}
				onChange={noop}
			/>,
		);
		const trigger = html.match(/<button[^>]*>/)?.[0] ?? "";
		expect(trigger).toContain('type="button"');
		expect(trigger).toContain('aria-label="Gender"');
		expect(html).toContain("—");
	});
});
