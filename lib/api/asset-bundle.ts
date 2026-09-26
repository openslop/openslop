import { nanoid } from "nanoid";
import { z } from "zod";

const httpError = (res: Response, label: string) =>
	new Error(`${label} (${res.status} ${res.statusText})`);

async function fetchOk(url: string, label: string): Promise<Response> {
	const res = await fetch(url);
	if (!res.ok) throw httpError(res, label);
	return res;
}

/** The parts of a manifest a bundle is read through. */
const BundleContentsSchema = z.object({
	result: z.record(z.string(), z.string()),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

type BundleContents = z.infer<typeof BundleContentsSchema>;

type AssetManifest = BundleContents & {
	version: number;
	type: string;
	createdAt: string;
};

type BundleFileBase = {
	key: string;
	filename: string;
	contentType: string;
};

export type BundleFileData = BundleFileBase & {
	data: Buffer | ArrayBuffer | string;
};

/** Bytes that live at someone else's URL. Re-hosted, never referenced. */
export type BundleFileRemote = BundleFileBase & {
	url: string;
};

export type BundleFile = BundleFileData | BundleFileRemote;

type PutBody = Parameters<typeof import("@vercel/blob").put>[1];

/** Remote sources stream in at an unknown size, so they upload in chunks. */
async function sourceOf(
	file: BundleFile,
): Promise<{ body: PutBody; multipart: boolean }> {
	if ("data" in file) return { body: file.data, multipart: false };
	const res = await fetchOk(file.url, `Failed to fetch "${file.key}"`);
	if (!res.body) throw new Error(`Empty response body for "${file.key}"`);
	return { body: res.body, multipart: true };
}

export const BundleResponseSchema = BundleContentsSchema.extend({
	id: z.string(),
	type: z.string(),
	provider: z.string(),
});

export type BundleResponse = z.infer<typeof BundleResponseSchema>;

type UploadOptions = { id?: string };

export class AssetBundle {
	static baseUrl = process.env.NEXT_PUBLIC_BLOB_URL ?? "";

	constructor(
		readonly url: string,
		readonly manifest: BundleContents,
	) {}

	get durationSec(): number {
		return Number(this.manifest.metadata?.durationSec ?? 0);
	}

	resolve(key: string): string {
		const value = this.manifest.result[key];
		if (!value) throw new Error(`No file "${key}" in asset bundle`);
		if (/^https?:\/\//.test(value)) return value;
		return `${this.url}/${value}`;
	}

	async fetchJson<T>(key: string): Promise<T> {
		const res = await fetchOk(this.resolve(key), `Failed to fetch "${key}"`);
		return res.json() as Promise<T>;
	}

	static buildUrl(type: string, provider: string, id: string): string {
		return `${AssetBundle.baseUrl}/assets/${type}/${provider}/${id}`;
	}

	static fromResponse(response: BundleResponse): AssetBundle {
		const url = AssetBundle.buildUrl(
			response.type,
			response.provider,
			response.id,
		);
		return new AssetBundle(url, response);
	}

	static async load(
		type: string,
		provider: string,
		id: string,
	): Promise<BundleResponse | null> {
		const url = AssetBundle.buildUrl(type, provider, id);
		const res = await fetch(`${url}/manifest.json`);
		if (res.status === 404) return null;
		if (!res.ok) throw httpError(res, "Failed to load asset bundle");
		return {
			id,
			type,
			provider,
			...BundleContentsSchema.parse(await res.json()),
		};
	}

	static async upload(
		type: string,
		provider: string,
		files: BundleFile[],
		metadata?: Record<string, unknown>,
		{ id }: UploadOptions = {},
	): Promise<BundleResponse> {
		const { put } = await import("@vercel/blob");
		// Two callers naming the same bundle write the same bytes, so the second may overwrite.
		const named = id !== undefined;
		const bundleId = id ?? nanoid();
		const basePath = `assets/${type}/${provider}/${bundleId}`;

		await Promise.all(
			files.map(async (file) => {
				const { body, multipart } = await sourceOf(file);
				return put(`${basePath}/${file.filename}`, body, {
					access: "public",
					contentType: file.contentType,
					addRandomSuffix: false,
					allowOverwrite: named,
					multipart,
				});
			}),
		);

		const result = Object.fromEntries(
			files.map((file) => [file.key, file.filename]),
		);

		const manifest: AssetManifest = {
			version: 1,
			type,
			createdAt: new Date().toISOString(),
			result,
			metadata,
		};

		await put(`${basePath}/manifest.json`, JSON.stringify(manifest), {
			access: "public",
			contentType: "application/json",
			addRandomSuffix: false,
			allowOverwrite: named,
		});

		return { id: bundleId, type, provider, result, metadata };
	}
}
