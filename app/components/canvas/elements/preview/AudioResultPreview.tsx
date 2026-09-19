import { AudioPlaceholder, AudioResult } from "./results";
import type { ElementPreviewProps } from "./status";

export function AudioResultPreview({ result, ...state }: ElementPreviewProps) {
	if (!result?.audioUrl) return <AudioPlaceholder {...state} />;
	return <AudioResult {...state} src={result.audioUrl} />;
}
