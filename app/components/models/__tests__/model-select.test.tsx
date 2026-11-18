import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConnectHint } from "../model-select";

describe("ConnectHint", () => {
	it("shows Connect, reads out the API-key label, and nests no button in the menu row", () => {
		const html = renderToStaticMarkup(
			<TooltipProvider>
				<ConnectHint provider="anthropic" />
			</TooltipProvider>,
		);
		expect(html).toContain(">Connect</span>");
		expect(html).toContain(
			"Add your Anthropic API key to generate with this model",
		);
		expect(html).not.toContain("<button");
	});
});
