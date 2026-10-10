import { vi } from "vitest";

export const AssetBundle = {
	baseUrl: "",
	upload: vi.fn(
		(
			type: string,
			provider: string,
			files: { key: string; url?: string }[],
			metadata?: Record<string, unknown>,
		) => ({
			id: "test",
			type,
			provider,
			result: Object.fromEntries(files.map((f) => [f.key, f.url ?? "url"])),
			metadata,
		}),
	),
	fromResponse: (response: {
		id: string;
		type: string;
		provider: string;
		result: Record<string, string>;
	}) => ({
		resolve: (key: string) => {
			const value = response.result[key];
			if (/^https?:\/\//.test(value)) return value;
			return `/assets/${response.type}/${response.provider}/${response.id}/${value}`;
		},
	}),
};
