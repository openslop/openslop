"use client";

import { DotGrid } from "@/components/ui/dot-grid";
import { LightRays } from "@/components/ui/light-rays";
import ComposerHero from "./composer-hero";
import UserProfile from "./user-profile";

export default function PrePromptView() {
	return (
		<>
			<DotGrid />
			<LightRays />
			<UserProfile />
			<ComposerHero />
		</>
	);
}
