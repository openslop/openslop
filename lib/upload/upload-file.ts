import { apiJson } from "@/lib/clients/http";
import type { UploadKind } from "./upload-files";

export async function uploadFile(
	kind: UploadKind,
	file: File,
): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const { url } = await apiJson<{ url: string }>(`/api/upload/${kind}`, {
		method: "POST",
		body: formData,
	});
	return url;
}
