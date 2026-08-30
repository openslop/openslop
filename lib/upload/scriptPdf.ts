import { apiJson } from "@/lib/clients/http";

export const MAX_SCRIPT_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Hands a script PDF to the server and gets its plain text back. */
export async function extractScriptText(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const { text } = await apiJson<{ text: string }>("/api/upload/script", {
		method: "POST",
		body: formData,
	});
	return text;
}
