"use client";

import { EmptyState } from "@/components/ui/empty-state";
import {
	Image,
	Video,
	Volume2,
	type IconComponent,
} from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import { SearchField } from "@/components/ui/search-field";
import { UploadKindSchema, type UploadKind } from "@/lib/upload/upload-files";

/** `columns` is how many fit a row of a library. */
export const MEDIA_KINDS: Record<
	UploadKind,
	{ label: string; Icon: IconComponent; columns: 1 | 2 }
> = {
	image: { label: "Images", Icon: Image, columns: 2 },
	video: { label: "Videos", Icon: Video, columns: 1 },
	audio: { label: "Audio", Icon: Volume2, columns: 1 },
};

/** What a library shows when it has nothing to show. */
export function EmptyLibrary({
	kind,
	query,
}: {
	kind: UploadKind;
	query: string;
}) {
	const sought = query.trim();
	const { label } = MEDIA_KINDS[kind];
	return sought ? (
		<EmptyState
			title={`Nothing matches "${sought}"`}
			description="Try a different name"
		/>
	) : (
		<EmptyState
			title={`No ${label.toLowerCase()} yet`}
			description={`${label} you upload or generate show up here`}
		/>
	);
}

/** Searches one kind of media by name. */
export function MediaSearch({
	kind,
	query,
	onQueryChange,
}: {
	kind: UploadKind;
	query: string;
	onQueryChange: (query: string) => void;
}) {
	const label = MEDIA_KINDS[kind].label.toLowerCase();
	return (
		<SearchField
			size="sm"
			value={query}
			onChange={(event) => onQueryChange(event.target.value)}
			placeholder={`Search ${label}…`}
			aria-label={`Search ${label} by name`}
			autoComplete="off"
			spellCheck={false}
		/>
	);
}

const KIND_OPTIONS = UploadKindSchema.options.map((kind) => ({
	value: kind,
	label: MEDIA_KINDS[kind].label,
	icon: MEDIA_KINDS[kind].Icon,
}));

/** A library's search by name beside the toggle for which kind it shows. */
export function MediaLibraryFilter({
	kind,
	onKindChange,
	query,
	onQueryChange,
}: {
	kind: UploadKind;
	onKindChange: (kind: UploadKind) => void;
	query: string;
	onQueryChange: (query: string) => void;
}) {
	return (
		<div className="flex items-center gap-2">
			<div className="min-w-0 flex-1">
				<MediaSearch kind={kind} query={query} onQueryChange={onQueryChange} />
			</div>
			<MediaToggle
				size="field"
				ariaLabel="Media type"
				value={kind}
				onChange={onKindChange}
				options={KIND_OPTIONS}
			/>
		</div>
	);
}
