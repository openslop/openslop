import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import EmailSentCard from "../email-sent-card";

const render = (error: string) =>
	renderToStaticMarkup(
		<EmailSentCard
			subtitle="We sent a login link to a@b.co"
			resendLabel="Send another login link"
			loading={false}
			error={error}
			onResend={vi.fn()}
			onEditEmail={vi.fn()}
		/>,
	);

describe("EmailSentCard", () => {
	it("announces a failed resend", () => {
		const html = render("Too many requests");
		expect(html).toContain('role="alert"');
		expect(html).toContain("Too many requests");
	});

	it("renders no alert while nothing failed", () => {
		expect(render("")).not.toContain('role="alert"');
	});
});
