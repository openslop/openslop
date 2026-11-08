import partition from "lodash/partition";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { ResultKind } from "@/lib/canvas/types";
import { disjunction } from "@/lib/format";

export const UploadKindSchema = z.enum([
	"image",
	"video",
	"audio",
] as const satisfies readonly ResultKind[]);

export type UploadKind = z.infer<typeof UploadKindSchema>;

/** What a user may upload. Images are limited to what the export's `ImageDecoder` can decode. */
export const UPLOAD_KINDS = {
	image: {
		noun: "an image",
		maxBytes: 10 * 1024 * 1024,
		contentTypes: [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/avif",
		],
	},
	video: {
		noun: "a video",
		maxBytes: 50 * 1024 * 1024,
		contentTypes: ["video/*"],
	},
	audio: {
		noun: "audio",
		maxBytes: 20 * 1024 * 1024,
		contentTypes: ["audio/*"],
	},
} as const satisfies Record<
	UploadKind,
	{ noun: string; maxBytes: number; contentTypes: readonly string[] }
>;

export interface Upload {
	kind: UploadKind;
	name: string;
	url: string;
}

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

const matchesContentType = (type: string, pattern: string) =>
	pattern.endsWith("/*")
		? type.startsWith(pattern.slice(0, -1))
		: type === pattern;

const kindOf = (file: File, kinds: readonly UploadKind[]) =>
	kinds.find((kind) =>
		UPLOAD_KINDS[kind].contentTypes.some((pattern) =>
			matchesContentType(file.type, pattern),
		),
	);

export const acceptedTypes = (kinds: readonly UploadKind[]) =>
	kinds.flatMap((kind) => UPLOAD_KINDS[kind].contentTypes).join(",");

interface AcceptedFile {
	file: File;
	kind: UploadKind;
}

export interface RejectedFile {
	name: string;
	reason: string;
}

function sortFile(
	file: File,
	kinds: readonly UploadKind[],
): AcceptedFile | RejectedFile {
	const kind = kindOf(file, kinds);
	if (!kind)
		return {
			name: file.name,
			reason: `is not ${disjunction(kinds.map((k) => UPLOAD_KINDS[k].noun))}`,
		};
	const { maxBytes } = UPLOAD_KINDS[kind];
	if (file.size > maxBytes)
		return { name: file.name, reason: `is over ${maxBytes / 1024 / 1024} MB` };
	return { file, kind };
}

export function partitionFiles(
	files: File[],
	kinds: readonly UploadKind[],
): {
	accepted: AcceptedFile[];
	rejected: RejectedFile[];
} {
	const [accepted, rejected] = partition(
		files.map((file) => sortFile(file, kinds)),
		(sorted): sorted is AcceptedFile => "kind" in sorted,
	);
	return { accepted, rejected };
}
