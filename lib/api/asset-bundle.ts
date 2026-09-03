import { nanoid } from "nanoid";

async function fetchOk(url: string, label: string): Promise<Response> {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`${label} (${res.status} ${res.statusText})`);
	}
	return res;
}

async function fetchJson<T>(url: string, label: string): Promise<T> {
	const res = await fetchOk(url, label);
	return res.json() as Promise<T>;
}

export type AssetManifest = {
	version: number;
	type: string;
	createdAt: string;
	result: Record<string, string>;
	metadata?: Record<string, unknown>;
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

export type BundleResponse = {
	id: string;
	type: string;
	provider: string;
	result: Record<string, string>;
	metadata?: Record<string, unknown>;
};

export class AssetBundle {
	static baseUrl = process.env.NEXT_PUBLIC_BLOB_URL ?? "";

	constructor(
		readonly url: string,
		readonly manifest: AssetManifest,
	) {}

	resolve(key: string): string {
		const value = this.manifest.result[key];
		if (!value) throw new Error(`No file "${key}" in asset bundle`);
		if (/^https?:\/\//.test(value)) return value;
		return `${this.url}/${value}`;
	}

	async fetchJson<T>(key: string): Promise<T> {
		return fetchJson<T>(this.resolve(key), `Failed to fetch "${key}"`);
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
		return new AssetBundle(url, {
			version: 1,
			type: response.type,
			createdAt: "",
			result: response.result,
			metadata: response.metadata,
		});
	}

	static async upload(
		type: string,
		provider: string,
		files: BundleFile[],
		metadata?: Record<string, unknown>,
	): Promise<BundleResponse> {
		const { put } = await import("@vercel/blob");
		const id = nanoid();
		const basePath = `assets/${type}/${provider}/${id}`;

		await Promise.all(
			files.map(async (file) => {
				const { body, multipart } = await sourceOf(file);
				return put(`${basePath}/${file.filename}`, body, {
					access: "public",
					contentType: file.contentType,
					addRandomSuffix: false,
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
		});

		return { id, type, provider, result, metadata };
	}
}
