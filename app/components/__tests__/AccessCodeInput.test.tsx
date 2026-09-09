import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import AccessCodeInput from "../AccessCodeInput";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
}));

describe("AccessCodeInput", () => {
	it("submits the code through a form owned by the Get Started button", () => {
		const html = renderToStaticMarkup(<AccessCodeInput />);
		expect(html).toMatch(/^<form/);
		expect(html).toContain('aria-label="Code character 6"');
		expect(html).toMatch(
			/<button[^>]*type="submit"[^>]*>Get Started<\/button>/,
		);
	});
});
