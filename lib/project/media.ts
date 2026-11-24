import kebabCase from "lodash/kebabCase";
import { matchSorter } from "match-sorter";
import { z } from "zod";
import { CaptionSchema } from "@/lib/connectors/types";
import {
	UPLOAD_KINDS,
	UploadKindSchema,
	type UploadKind,
} from "@/lib/upload/upload-files";

export const MediaItemSchema = z.object({
	name: z.string(),
	kind: UploadKindSchema,
	url: z.string(),
	/** Missing on media added before it was recorded. */
	createdAt: z.string().optional(),
	captions: z.array(CaptionSchema).optional(),
	uploaded: z.boolean().optional(),
	costUsd: z.number().optional(),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;

export type UploadedMedia = Pick<MediaItem, "kind" | "url" | "captions">;

export type NewMedia = Omit<MediaItem, "createdAt">;

const stem = (fileName: string) => fileName.replace(/\.[^.]*$/, "");

function uniqueName(base: string, taken: Set<string>): string {
	let name = base;
	for (let n = 2; taken.has(name); n++) name = `${base}-${n}`;
	taken.add(name);
	return name;
}

export function toMediaItems(
	media: MediaItem[],
	uploads: NewMedia[],
): MediaItem[] {
	const taken = new Set(media.map((item) => item.name));
	const createdAt = new Date().toISOString();
	return uploads.map(({ name, ...upload }) => ({
		...upload,
		name: uniqueName(kebabCase(stem(name)) || upload.kind, taken),
		createdAt,
	}));
}

export function requireMedia(media: MediaItem[], url: string): MediaItem {
	const item = media.find((candidate) => candidate.url === url);
	if (!item) throw new Error(`${url} is not in the media library.`);
	return item;
}

/** A file to supply as `kind`: its library record, or the bare file when it is stored elsewhere. */
export function uploadedMedia(
	media: MediaItem[],
	url: string,
	kind: UploadKind,
): UploadedMedia {
	const item = media.find((candidate) => candidate.url === url);
	if (!item) return { kind, url };
	if (item.kind !== kind)
		throw new Error(
			`${item.name} is ${UPLOAD_KINDS[item.kind].noun}, not ${UPLOAD_KINDS[kind].noun}.`,
		);
	return item;
}

/** The media of one kind whose name matches the query, best match first; ties newest first. */
export const findMedia = (
	media: MediaItem[],
	kind: UploadKind,
	query: string,
): MediaItem[] =>
	matchSorter(
		media.filter((item) => item.kind === kind).toReversed(),
		query.trim(),
		{ keys: ["name"], baseSort: (a, b) => a.index - b.index },
	);
