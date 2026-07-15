import { describe, expect, it } from "vitest";
import { formatBytes } from "../format";

describe("formatBytes", () => {
	it("formats raw bytes below 1 KB", () => {
		expect(formatBytes(0)).toBe("0 B");
		expect(formatBytes(512)).toBe("512 B");
		expect(formatBytes(1023)).toBe("1023 B");
	});

	it("formats KB, MB, and GB ranges", () => {
		expect(formatBytes(1024)).toBe("1.0 KB");
		expect(formatBytes(1536)).toBe("1.5 KB");
		expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
		expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
		expect(formatBytes(1024 * 1024 * 1024)).toBe("1.0 GB");
	});

	it("rolls over to the next unit when rounding reaches 1024", () => {
		// 1023.994 KB rounds to 1024.0, which must promote to MB.
		expect(formatBytes(1048570)).toBe("1.0 MB");
		// Just below the MB→GB boundary.
		expect(formatBytes(1073740000)).toBe("1.0 GB");
	});

	it("keeps very large sizes in GB", () => {
		expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe("2.0 GB");
		expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe("1024.0 GB");
	});
});
