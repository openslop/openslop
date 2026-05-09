"use client";

import ComposerHero from "./ComposerHero";
import UserProfile from "./UserProfile";

export default function PrePromptView() {
	return (
		<>
			<div className="fixed left-4 top-4 z-[100]">
				<UserProfile />
			</div>
			<ComposerHero />
		</>
	);
}
