"use client";

import type { ReactNode } from "react";
import { History } from "@/components/ui/icon";
import {
	useCanvasHistory,
	useCanvasHistoryState,
} from "@/lib/project/CanvasHistoryProvider";
import { relativeTime } from "@/lib/project/relativeTime";

function BannerAction({
	onClick,
	children,
}: {
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="focus-ring rounded-md text-version-preview-link underline decoration-1 underline-offset-2 hover:decoration-2"
		>
			{children}
		</button>
	);
}

/** The live region stays mounted so the warning is announced when it appears. */
export function CanvasVersionBanner() {
	const history = useCanvasHistory();
	const { versions, previewId } = useCanvasHistoryState();
	const version = versions.find((entry) => entry.id === previewId);

	return (
		<div role="status">
			{previewId && (
				<div className="mx-2 mt-3 mb-2 flex items-center justify-center gap-2 rounded-md bg-version-preview px-3 py-1.5 text-center text-version-preview-foreground">
					<History className="size-4 shrink-0" />
					<p className="text-label leading-5 font-medium">
						{version
							? `Viewing an older version from ${relativeTime(version.updatedAt)}.`
							: "Viewing an older version."}{" "}
						Edits made here aren&apos;t saved unless you either{" "}
						<BannerAction onClick={history.restore}>
							restore this version
						</BannerAction>{" "}
						or{" "}
						<BannerAction onClick={history.backToLatest}>
							return to latest
						</BannerAction>
						.
					</p>
				</div>
			)}
		</div>
	);
}
