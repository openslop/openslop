export const DEFAULT_CAPTIONS_ENABLED = true;

export const resolveCaptionsEnabled = (metadata: {
	videoSettings?: { captions?: boolean };
}): boolean => metadata.videoSettings?.captions ?? DEFAULT_CAPTIONS_ENABLED;
