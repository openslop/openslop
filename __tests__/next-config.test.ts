import { hasRemoteMatch } from "next/dist/shared/lib/match-remote-pattern";
import { describe, expect, it } from "vitest";
import { BLOB_BASE_URL } from "@/lib/blob";
import loadConfig from "../next.config";

async function optimizes(url: string): Promise<boolean> {
	const { images } = await loadConfig();
	return hasRemoteMatch(
		images?.domains ?? [],
		images?.remotePatterns ?? [],
		new URL(url),
	);
}

describe("image optimizer", () => {
	it("optimizes files in our store", async () => {
		expect(await optimizes(`${BLOB_BASE_URL}/assets/a.png`)).toBe(true);
	});

	it("refuses any other host, so no one spends our transforms on it", async () => {
		expect(await optimizes("https://picsum.photos/seed/any/3840/3840")).toBe(
			false,
		);
	});
});
