"use client";

import { ActionMenu } from "@/components/ui/action-menu";
import { StockAlt, Upload } from "@/components/ui/icon";
import { useEditorPanel } from "../panel/editor-panel-context";
import { AddButton } from "@/components/ui/add-button";

/** Pictures and media come from an upload or from the Media panel. */
export function AddMediaMenu({
	label,
	onUpload,
}: {
	label: string;
	onUpload: () => void;
}) {
	const { setActive } = useEditorPanel();
	return (
		<ActionMenu
			align="end"
			items={[
				{
					key: "upload",
					label: "Upload",
					icon: <Upload />,
					onSelect: onUpload,
				},
				{
					key: "generate",
					label: "Generate",
					icon: <StockAlt />,
					onSelect: () => setActive("media"),
				},
			]}
		>
			<AddButton label={label} />
		</ActionMenu>
	);
}
