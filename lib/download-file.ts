/** Saves media from another origin under its name; a `download` link only names same-origin files. */
export async function downloadFile(url: string, name: string): Promise<void> {
	const response = await fetch(url);
	if (!response.ok)
		throw new Error(`Couldn't fetch ${name} (HTTP ${response.status})`);
	const extension = new URL(url).pathname.match(/\.\w+$/)?.[0] ?? "";
	const href = URL.createObjectURL(await response.blob());
	const link = document.createElement("a");
	link.href = href;
	link.download = `${name}${extension}`;
	link.click();
	URL.revokeObjectURL(href);
}
