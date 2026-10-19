import { upload } from "@vercel/blob/client";
import { uploadPathname, type UploadKind } from "./upload-files";

export async function uploadFile(
	kind: UploadKind,
	file: File,
): Promise<string> {
	const { url } = await upload(uploadPathname(file.name), file, {
		access: "public",
		handleUploadUrl: `/api/upload/${kind}`,
		contentType: file.type,
	});
	return url;
}
