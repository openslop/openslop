import { nanoid } from "nanoid";
import type { ResultKind } from "@/lib/canvas/types";

/** What a user may upload, keyed by the MIME type each kind's files carry. */
export const UPLOAD_KINDS = {
	image: { noun: "an image", maxBytes: 10 * 1024 * 1024 },
	video: { noun: "a video", maxBytes: 50 * 1024 * 1024 },
} as const satisfies Partial<Record<ResultKind, unknown>>;

export type UploadKind = keyof typeof UPLOAD_KINDS;

const UPLOAD_DIR = "assets/upload/user";

/** The only blob paths a browser may upload to: a fresh folder per file, under our own store. */
export const UPLOAD_PATHNAME = new RegExp(
	`^${UPLOAD_DIR}/[A-Za-z0-9_-]+/[A-Za-z0-9._-]+$`,
);

function sanitizeFilename(name: string): string {
	const base = name.split(/[\\/]/).pop() ?? "";
	const cleaned = base.replace(/[^A-Za-z0-9._-]/g, "_").replace(/^\.+/, "");
	return cleaned.slice(0, 200) || "upload";
}

export const uploadPathname = (filename: string) =>
	`${UPLOAD_DIR}/${nanoid()}/${sanitizeFilename(filename)}`;

/** Why the upload route would turn `file` away, if it would. */
export function fileRejection(
	file: File,
	kind: UploadKind,
): string | undefined {
	const { noun, maxBytes } = UPLOAD_KINDS[kind];
	if (!file.type.startsWith(`${kind}/`)) return `is not ${noun}`;
	if (file.size > maxBytes) return `is over ${maxBytes / 1024 / 1024} MB`;
	return undefined;
}

export interface RejectedFile {
	name: string;
	reason: string;
}

export function partitionFiles(
	files: File[],
	kind: UploadKind,
): {
	accepted: File[];
	rejected: RejectedFile[];
} {
	const accepted: File[] = [];
	const rejected: RejectedFile[] = [];

	for (const file of files) {
		const reason = fileRejection(file, kind);
		if (reason) rejected.push({ name: file.name, reason });
		else accepted.push(file);
	}

	return { accepted, rejected };
}
