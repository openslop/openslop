"use client";

import compact from "lodash/compact";
import { useState, type ReactNode } from "react";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import {
	CaptionsReady,
	CaptionsAlert,
	Hourglass,
	MagicCaptions,
	RotateCcw,
	Trash2,
} from "@/components/ui/icon";
import { ICON_SIZES } from "@/components/ui/icon-button";
import { Spinner } from "@/components/ui/spinner";
import {
	SimpleTooltip,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ContentElement } from "@/lib/canvas/types";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { useElementCaptions } from "../hooks/use-element-captions";
import { useElementGeneration } from "./element-generation-context";
import { HeaderIconButton } from "./header-icon-button";

const SIZE = ICON_SIZES.header;

type Captions = ReturnType<typeof useElementCaptions>;
type Generation = ReturnType<typeof useElementGeneration>;

interface Face {
	label: string;
	icon: ReactNode;
	variant?: "destructive";
	onClick?: () => void;
}

const NOT_GENERATED: Face = {
	label: "Generate this element first to caption it",
	icon: <MagicCaptions size={SIZE} />,
};

const GENERATING: Face = {
	label: "Captions wait for this element to finish generating",
	icon: <Hourglass size={SIZE} />,
};

/** How the button looks before there are captions to act on; null once there are. */
function faceOf(
	{ result, status }: Generation,
	captions: Captions,
): Face | null {
	if (!result) return NOT_GENERATED;
	if (isGenerationActive(status)) return GENERATING;
	if (captions.status === "queued")
		return { label: "Captions queued", icon: <Hourglass size={SIZE} /> };
	if (captions.status !== "idle")
		return {
			label: "Generating captions…",
			icon: <Spinner className="text-current" />,
		};
	if (captions.captioned) return null;
	if (captions.error)
		return {
			label: `Captions failed: ${captions.error}. Try again`,
			icon: <CaptionsAlert size={SIZE} />,
			variant: "destructive",
			onClick: captions.generate,
		};
	return {
		label: "Generate captions",
		icon: <MagicCaptions size={SIZE} />,
		onClick: captions.generate,
	};
}

function FaceButton({ face }: { face: Face }) {
	return (
		<SimpleTooltip label={face.label}>
			<HeaderIconButton
				ariaLabel={face.label}
				variant={face.variant ?? "quiet"}
				unavailable={!face.onClick}
				onClick={face.onClick}
			>
				{face.icon}
			</HeaderIconButton>
		</SimpleTooltip>
	);
}

function readyLabel(captions: Captions) {
	if (captions.error)
		return `Regenerating captions failed: ${captions.error}. The last captions still show`;
	return captions.edited
		? "Captions ready, edited in the player"
		: "Captions ready";
}

function menuOf(captions: Captions, onRemove: () => void): ActionMenuItem[] {
	return compact([
		{
			key: "regenerate",
			label: "Regenerate captions",
			icon: <MagicCaptions />,
			onSelect: captions.generate,
		},
		captions.edited && {
			key: "reset",
			label: "Reset edits",
			icon: <RotateCcw />,
			onSelect: captions.reset,
		},
		{
			key: "remove",
			label: "Remove captions",
			icon: <Trash2 />,
			variant: "destructive",
			onSelect: onRemove,
		},
	]);
}

export function ElementCaptionsButton({
	element,
}: {
	element: ContentElement;
}) {
	const generation = useElementGeneration();
	const captions = useElementCaptions(element, generation.result);
	const [removing, setRemoving] = useState(false);

	const face = faceOf(generation, captions);
	if (face) return <FaceButton face={face} />;

	const label = readyLabel(captions);
	return (
		<>
			<Tooltip>
				<ActionMenu
					items={menuOf(captions, () => setRemoving(true))}
					align="end"
				>
					<TooltipTrigger asChild>
						<HeaderIconButton
							ariaLabel={label}
							variant={captions.error ? "destructive" : "quiet"}
						>
							{captions.error ? (
								<CaptionsAlert size={SIZE} />
							) : (
								<CaptionsReady size={SIZE} />
							)}
						</HeaderIconButton>
					</TooltipTrigger>
				</ActionMenu>
				<TooltipContent>{label}</TooltipContent>
			</Tooltip>
			<ConfirmDeleteDialog
				target={removing ? element : undefined}
				onClose={() => setRemoving(false)}
				title={() => "Remove this element's captions?"}
				description="Only this element loses its captions and any edits to them. Getting them back means generating them again."
				actionLabel="Remove captions"
				onConfirm={captions.remove}
			/>
		</>
	);
}
