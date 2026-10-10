"use client";

import { DotGrid } from "@/components/ui/dot-grid";
import ComposerHero from "./composer-hero";
import UserProfile from "./user-profile";

export default function PrePromptView() {
	return (
		<>
			<DotGrid />
			<UserProfile />
			<ComposerHero />
		</>
	);
}
