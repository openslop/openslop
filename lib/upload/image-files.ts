export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

export interface RejectedImageFile {
	name: string;
	reason: string;
}

/**
 * Mirrors the `imageFile` schema the upload route enforces, so a file the user
 * drops is rejected with a message here rather than by a round trip.
 */
export function partitionImageFiles(files: File[]): {
	accepted: File[];
	rejected: RejectedImageFile[];
} {
	const accepted: File[] = [];
	const rejected: RejectedImageFile[] = [];

	for (const file of files) {
		if (!file.type.startsWith("image/")) {
			rejected.push({ name: file.name, reason: "is not an image" });
		} else if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
			rejected.push({
				name: file.name,
				reason: `is over ${MAX_IMAGE_UPLOAD_BYTES / 1024 / 1024} MB`,
			});
		} else {
			accepted.push(file);
		}
	}

	return { accepted, rejected };
}
