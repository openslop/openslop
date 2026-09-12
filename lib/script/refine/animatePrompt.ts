const ANIMATE_VIDEO_PATTERN =
	/write the motion for the video element in scene (\d+)/i;

/** What the animate button asks Sloppy, once the image has become a video element that opens on its picture. */
export const animateVideoPrompt = (scene: number): string =>
	`Write the motion for the video element in scene ${scene}: it opens on the picture it already shows, so rewrite its text as one short camera or subject movement that continues from that exact frame.`;

/** The scene an animate request names, or null when it is not one. */
export const animateVideoScene = (prompt: string): number | null => {
	const scene = ANIMATE_VIDEO_PATTERN.exec(prompt)?.[1];
	return scene === undefined ? null : Number(scene);
};
