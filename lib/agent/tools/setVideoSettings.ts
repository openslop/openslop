import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

export async function setVideoSettings(
	{ length, aspect_ratio }: ToolInput<"set_video_settings">,
	ctx: AgentToolContext,
): Promise<string> {
	ctx.setMetadata({
		videoSettings: {
			...(length !== undefined && { length }),
			...(aspect_ratio !== undefined && { aspectRatio: aspect_ratio }),
		},
	});

	const changed = [
		length !== undefined && `length to ${length}`,
		aspect_ratio !== undefined && `aspect ratio to ${aspect_ratio}`,
	].filter(Boolean);

	return `Set the ${changed.join(" and ")}. It applies to the next script written, not to what is on the canvas.`;
}
