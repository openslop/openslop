import { CONTENT_TYPES, type ContentElement } from "@/lib/canvas/types";
import { useGenerate } from "../hooks/use-generate";
import { PlaceholderBallsLoader } from "./preview/placeholder-balls";
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";

export function ForegroundPreview({ element }: { element: ContentElement }) {
	const { result, status } = useGenerate(element);
	const { outputKind } = CONTENT_TYPES[element.type];
	const url = getPrimaryUrl(result, outputKind);

	if (!url) {
		return (
			<div className="relative w-full h-full rounded-lg overflow-hidden border bg-muted">
				<PlaceholderBallsLoader generating={status === "generating"} />
			</div>
		);
	}

	return (
		<div className="relative w-full h-full rounded-lg overflow-hidden border">
			<MediaWithSkeleton
				outputKind={outputKind}
				src={url}
				alt="Scene preview"
			/>
		</div>
	);
}
