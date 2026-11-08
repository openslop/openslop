import kebabCase from "lodash/kebabCase";
import { z } from "zod";
import { UploadKindSchema, type Upload } from "@/lib/upload/upload-files";

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
