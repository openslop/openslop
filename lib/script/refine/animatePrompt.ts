const ANIMATE_CLIP_PATTERN = /write the motion for the clip in scene (\d+)/i;

/** What the animate button asks Sloppy, once the image has become a clip that opens on its picture. */
export const animateClipPrompt = (scene: number): string =>
	`Write the motion for the clip in scene ${scene}: it opens on the picture it already shows, so rewrite its text as one short camera or subject movement that continues from that exact frame.`;

/** The scene an animate request names, or null when it is not one. */
export const animateClipScene = (prompt: string): number | null => {
	const scene = ANIMATE_CLIP_PATTERN.exec(prompt)?.[1];
	return scene === undefined ? null : Number(scene);
};
