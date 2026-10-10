import { apiJson } from "@/lib/clients/http";

export async function uploadImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const { url } = await apiJson<{ url: string }>("/api/upload/image", {
		method: "POST",
		body: formData,
	});
	return url;
}
