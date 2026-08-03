import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { MediaResult } from "./results";
import type { ElementPreviewProps } from "./status";

export function ImagePreview({ result, ...state }: ElementPreviewProps) {
	return (
		<MediaResult
			{...state}
			url={getPrimaryUrl(result, "image")}
			outputKind="image"
		/>
	);
}
