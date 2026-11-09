import kebabCase from "lodash/kebabCase";
import { z } from "zod";
import {
	UploadKindSchema,
	type Upload,
	type UploadKind,
} from "@/lib/upload/upload-files";

export const MediaItemSchema = z.object({
	name: z.string(),
	kind: UploadKindSchema,
	url: z.string(),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;

const stem = (fileName: string) => fileName.replace(/\.[^.]*$/, "");

function uniqueName(base: string, taken: Set<string>): string {
	let name = base;
	for (let n = 2; taken.has(name); n++) name = `${base}-${n}`;
	taken.add(name);
	return name;
}

export function toMediaItems(
	media: MediaItem[],
	uploads: Upload[],
): MediaItem[] {
	const taken = new Set(media.map((item) => item.name));
	return uploads.map(({ kind, name, url }) => ({
		name: uniqueName(kebabCase(stem(name)) || kind, taken),
		kind,
		url,
	}));
}

/** The media of one kind whose name holds the query, newest first. */
export function findMedia(
	media: MediaItem[],
	kind: UploadKind,
	query: string,
): MediaItem[] {
	const sought = query.trim().toLowerCase();
	return media
		.filter(
			(item) => item.kind === kind && item.name.toLowerCase().includes(sought),
		)
		.toReversed();
}
