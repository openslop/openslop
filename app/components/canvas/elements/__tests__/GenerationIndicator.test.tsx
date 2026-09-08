import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GenerationIndicator } from "../GenerationIndicator";

const render = (node: React.ReactNode) =>
	renderToStaticMarkup(<TooltipProvider>{node}</TooltipProvider>);

describe("GenerationIndicator", () => {
	it("is a named status marker, not a disabled button", () => {
		const html = render(
			<GenerationIndicator status="generating" seconds={3} />,
		);
		expect(html).toContain('role="status"');
		expect(html).toContain('aria-label="Generating 3s"');
		expect(html).not.toContain("<button");
		expect(html).not.toContain("disabled");
	});

	it("pairs the media scrim with the on-media foreground", () => {
		const html = render(<GenerationIndicator status="queued" size="sm" />);
		expect(html).toContain("bg-on-media/55");
		expect(html).toContain("text-on-media-foreground");
		expect(html).not.toContain("text-foreground");
	});
});
