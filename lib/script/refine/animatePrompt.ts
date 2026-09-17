const ANIMATE_VIDEO_PATTERN =
	/write the motion for the video element in scene (\d+)/i;

/** Both variants open the same way, so {@link animateVideoScene} matches either. */
export const animateVideoPrompt = (scene: number, picture?: string): string =>
	`Write the motion for the video element in scene ${scene}: ${
		picture
			? "it opens on the picture it already shows, so rewrite its prompt as shots that continue from that exact frame"
			: "it has no picture to open on, so rewrite its prompt as shots of what it already describes"
	}, written as the Video prompts section says.`;

/** The scene an animate request names, or null when it is not one. */
export const animateVideoScene = (prompt: string): number | null => {
	const scene = ANIMATE_VIDEO_PATTERN.exec(prompt)?.[1];
	return scene === undefined ? null : Number(scene);
};
