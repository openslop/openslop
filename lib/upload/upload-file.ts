import { upload } from "@vercel/blob/client";
import { apiJson } from "@/lib/clients/http";
import { isLocalMode, localBucket, localObjectUrl } from "@/lib/local-mode";
import { createClient } from "@/lib/supabase/client";
import {
	LocalUploadGrant,
	uploadPathname,
	type UploadKind,
} from "./upload-files";

// Vercel Blob recommends multipart above this size
const MULTIPART_MIN_BYTES = 100 * 1024 * 1024;

type Uploader = (
	kind: UploadKind,
	pathname: string,
	file: File,
) => Promise<string>;

export const uploadFile = (kind: UploadKind, file: File): Promise<string> =>
	(isLocalMode() ? uploadLocally : uploadToBlob)(
		kind,
		uploadPathname(file.name),
		file,
	);

const uploadToBlob: Uploader = async (kind, pathname, file) => {
	const { url } = await upload(pathname, file, {
		access: "public",
		handleUploadUrl: `/api/upload/${kind}`,
		contentType: file.type,
		multipart: file.size > MULTIPART_MIN_BYTES,
	});
	return url;
};

const uploadLocally: Uploader = async (kind, pathname, file) => {
	const { token } = await apiJson(`/api/upload/${kind}`, LocalUploadGrant, {
		method: "POST",
		body: { pathname },
	});
	const { error } = await createClient()
		.storage.from(localBucket())
		.uploadToSignedUrl(pathname, token, file, { contentType: file.type });
	if (error) throw error;
	return localObjectUrl(pathname);
};
