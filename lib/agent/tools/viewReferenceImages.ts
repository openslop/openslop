import type { AgentToolContext } from "./context";

export async function viewReferenceImages(
	ctx: AgentToolContext,
): Promise<{ urls: string[] }> {
	const urls = ctx.referenceImages();
	if (urls.length === 0)
		throw new Error("No reference images have been uploaded to this project.");
	return { urls };
}
