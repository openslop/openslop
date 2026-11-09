/** Saves media from another origin under its name; a `download` link only names same-origin files. */
export async function downloadFile(url: string, name: string): Promise<void> {
	const response = await fetch(url);
	if (!response.ok)
		throw new Error(`Couldn't fetch ${name} (HTTP ${response.status})`);
	const blob = await response.blob();
	const extension = blob.type.split("/")[1]?.split("+")[0];
	const href = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = href;
	link.download = extension ? `${name}.${extension}` : name;
	link.click();
	URL.revokeObjectURL(href);
}
