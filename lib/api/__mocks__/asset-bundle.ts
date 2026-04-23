import { vi } from "vitest";

export const AssetBundle = {
	upload: vi.fn(
		(
			_type: string,
			provider: string,
			files: { key: string; url?: string }[],
			metadata?: Record<string, unknown>,
		) => ({
			id: "test",
			provider,
			result: Object.fromEntries(files.map((f) => [f.key, f.url ?? "url"])),
			metadata,
		}),
	),
};
