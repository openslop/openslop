import { vi } from "vitest";

export const AssetBundle = {
	baseUrl: "",
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
	fromResponse: (
		type: string,
		response: { id: string; provider: string; result: Record<string, string> },
	) => ({
		resolve: (key: string) => {
			const value = response.result[key];
			if (/^https?:\/\//.test(value)) return value;
			return `/assets/${type}/${response.provider}/${response.id}/${value}`;
		},
	}),
};
