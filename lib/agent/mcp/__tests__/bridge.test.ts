import { expect, it } from "vitest";
import { newestTab } from "../bridge";

it("picks the tab opened last", () => {
	expect(
		newestTab({
			older: [{ openedAt: 1 }],
			newest: [{ openedAt: 3 }],
			middle: [{ openedAt: 2 }],
		}),
	).toBe("newest");
});

it("has none when no tab is open", () => {
	expect(newestTab({})).toBeUndefined();
});
