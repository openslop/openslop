import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MediaResult } from "../results";

describe("MediaResult", () => {
	it("renders the media instead of the placeholder once a url arrives", () => {
		const html = renderToStaticMarkup(
			<TooltipProvider>
				<MediaResult
					status="idle"
					startedAt={null}
					queuedReason={null}
					error={null}
					onDiscard={() => {}}
					url="https://cdn.example.com/a.png"
					outputKind="image"
				/>
			</TooltipProvider>,
		);
		expect(html).not.toContain('aria-label="Cancel generation"');
		expect(html).toContain("https://cdn.example.com/a.png");
	});
});
