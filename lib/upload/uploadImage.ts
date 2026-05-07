export async function uploadImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const res = await fetch("/api/upload/image", {
		method: "POST",
		body: formData,
	});

	if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);

	const { url } = (await res.json()) as { url: string };
	return url;
}
