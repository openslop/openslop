class UploadImageResponseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UploadImageResponseError";
	}
}

export async function uploadImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const res = await fetch("/api/upload/image", {
		method: "POST",
		body: formData,
	});

	if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);

	const body: unknown = await res.json();
	if (
		typeof body !== "object" ||
		body === null ||
		!("url" in body) ||
		typeof body.url !== "string" ||
		body.url.length === 0
	) {
		throw new UploadImageResponseError(
			"Upload endpoint returned invalid payload",
		);
	}

	return body.url;
}
