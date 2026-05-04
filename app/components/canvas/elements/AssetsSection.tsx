"use client";

import { useState } from "react";
import { Palette, User } from "lucide-react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProjectStore } from "@/lib/project/store";
import { characterAvatarElementId } from "@/lib/project/ensureCharacterAvatars";
import { AssetTile } from "./AssetTile";
import { CollapsibleHeader } from "./CollapsibleHeader";

export function AssetsSection() {
	const { projectId } = useConfig();
	const characters = useProjectStore(projectId, (s) => s.metadata.characters);
	const referenceImages = useProjectStore(projectId, (s) => s.referenceImages);
	const [collapsed, setCollapsed] = useState(false);

	if (Object.keys(characters).length === 0 && referenceImages.length === 0) {
		return null;
	}

	return (
		<section className="group/collapsible mb-4 select-none" aria-label="Assets">
			<CollapsibleHeader
				label="Assets"
				collapsed={collapsed}
				onToggle={() => setCollapsed((c) => !c)}
				ariaLabel={collapsed ? "Expand assets" : "Collapse assets"}
			/>
			{!collapsed && (
				<div className="flex flex-wrap gap-2">
					{Object.entries(characters).map(([name, ch]) => (
						<AssetTile
							key={`character:${name}`}
							name={name}
							previewUrl={ch.avatarUrl}
							Icon={User}
							elementId={characterAvatarElementId(name)}
						/>
					))}
					{referenceImages.map((url, i) => (
						<AssetTile
							key={`style:${url}`}
							name={`Reference ${i + 1}`}
							previewUrl={url}
							Icon={Palette}
						/>
					))}
				</div>
			)}
		</section>
	);
}
