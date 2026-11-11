import { Skeleton } from "@/components/ui/skeleton";
import { Thumbnail } from "@/components/ui/thumbnail";
import { cn } from "@/lib/utils";
import type { UploadKind } from "@/lib/upload/upload-files";

const SHAPES: Record<UploadKind, string> = {
	image: "aspect-video",
	video: "aspect-video",
	audio: "h-16",
};

/** Holds the place of media still on its way, in the shape of the kind a library shows. */
export function UploadingTile({ kind = "image" }: { kind?: UploadKind }) {
	return (
		<Thumbnail aria-hidden>
			<Skeleton className={cn("rounded-md", SHAPES[kind])} />
		</Thumbnail>
	);
}

export const uploadingTiles = (count: number, kind?: UploadKind) =>
	Array.from({ length: count }, (_, i) => (
		<UploadingTile key={`uploading:${i}`} kind={kind} />
	));
