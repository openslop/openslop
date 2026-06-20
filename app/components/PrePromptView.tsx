"use client";

import ComposerHero from "./ComposerHero";
import UserProfile from "./UserProfile";

export default function PrePromptView() {
	return (
		<>
			<div
				aria-hidden
				className="dot-grid-bg pointer-events-none fixed inset-0 -z-10"
			/>
			<UserProfile />
			<ComposerHero />
		</>
	);
}
