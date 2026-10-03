import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TextAreaField } from "../fields";

const noop = () => {};

describe("character fields", () => {
	it("TextAreaField labels its textarea and shows the value", () => {
		const html = renderToStaticMarkup(
			<TextAreaField
				label="Appearance"
				value="tall"
				onChange={noop}
				placeholder="Describe the look"
			/>,
		);
		expect(html).toContain("Appearance");
		expect(html).toContain('placeholder="Describe the look"');
		expect(html).toContain(">tall</textarea>");
	});
});
