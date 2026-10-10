import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ExportDoneToast, ExportProgressToast } from "../export-toast";

const buttons = (html: string) => html.match(/<button[^>]*>/g) ?? [];

describe("export toasts", () => {
	it.each([
		[
			"progress",
			<ExportProgressToast key="progress" progress={0.5} onView={() => {}} />,
		],
		[
			"done",
			<ExportDoneToast
				key="done"
				url="https://example.com/video.mp4"
				size={1024}
				toastId="export"
				onView={() => {}}
			/>,
		],
	])("shows keyboard focus on every button of the %s toast", (_, toast) => {
		const rendered = buttons(renderToStaticMarkup(toast));

		expect(rendered.length).toBeGreaterThan(0);
		for (const button of rendered) expect(button).toContain("focus-ring");
	});
});
