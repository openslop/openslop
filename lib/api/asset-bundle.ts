import { nanoid } from "nanoid";

export type AssetManifest = {
  version: number;
  type: string;
  createdAt: string;
  result: Record<string, string>;
  metadata?: Record<string, unknown>;
};

export type BundleFileUpload = {
  key: string;
  filename: string;
  data: Buffer | ArrayBuffer | string;
  contentType: string;
};

export type BundleFileExternal = {
  key: string;
  url: string;
};

export type BundleFile = BundleFileUpload | BundleFileExternal;

function isUploadFile(file: BundleFile): file is BundleFileUpload {
  return "data" in file;
}

export type BundleResponse = {
  id: string;
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
    const res = await fetch(this.resolve(key));
    return res.json() as Promise<T>;
  }

  static buildUrl(type: string, provider: string, id: string): string {
    const base = AssetBundle.baseUrl || "";
    return `${base}/assets/${type}/${provider}/${id}`;
  }

  static fromResponse(type: string, response: BundleResponse): AssetBundle {
    const url = AssetBundle.buildUrl(type, response.provider, response.id);
    return new AssetBundle(url, {
      version: 1,
      type,
      createdAt: "",
      result: response.result,
      metadata: response.metadata,
    });
  }

  static async fromId(
    type: string,
    provider: string,
    id: string,
  ): Promise<AssetBundle> {
    const url = AssetBundle.buildUrl(type, provider, id);
    const res = await fetch(`${url}/manifest.json`);
    const manifest = (await res.json()) as AssetManifest;
    return new AssetBundle(url, manifest);
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
      files.filter(isUploadFile).map((file) =>
        put(`${basePath}/${file.filename}`, file.data, {
          access: "public",
          contentType: file.contentType,
          addRandomSuffix: false,
        }),
      ),
    );

    const result: Record<string, string> = {};
    for (const file of files) {
      result[file.key] = isUploadFile(file) ? file.filename : file.url;
    }

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

    return { id, provider, result, metadata };
  }
}
