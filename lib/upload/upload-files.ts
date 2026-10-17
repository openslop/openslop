import type { ResultKind } from "@/lib/canvas/types";

/** What a user may upload, keyed by the MIME type each kind's files carry. */
export const UPLOAD_KINDS = {
	image: { noun: "an image", maxBytes: 10 * 1024 * 1024 },
	video: { noun: "a video", maxBytes: 50 * 1024 * 1024 },
} as const satisfies Partial<Record<ResultKind, unknown>>;

export type UploadKind = keyof typeof UPLOAD_KINDS;

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
