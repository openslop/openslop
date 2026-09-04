"use client";

import { DotGrid } from "@/components/ui/dot-grid";
import ComposerHero from "./ComposerHero";
import UserProfile from "./UserProfile";

export default function PrePromptView() {
	return (
		<>
			<DotGrid />
			<UserProfile />
			<ComposerHero />
		</>
	);
}
