import { AudioPlaceholder, AudioResult } from "./results";
import type { ElementPreviewProps } from "./status";

export function AudioPreview({ result, ...state }: ElementPreviewProps) {
	if (!result?.audioUrl) return <AudioPlaceholder {...state} />;
	return (
		<AudioResult
			src={result.audioUrl}
			status={state.status}
			seconds={state.seconds}
		/>
	);
}
