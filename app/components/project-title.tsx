"use client";

import { Input } from "@/components/ui/input";
import { UNTITLED_PROJECT } from "@/lib/project/project-document";
import { useProject } from "@/lib/project/use-project";

export function ProjectTitle() {
	const title = useProject((state) => state.title);
	const setTitle = useProject((state) => state.setTitle);

	return (
		<h1 className="mb-3">
			<Input
				variant="bare"
				size="heading"
				value={title}
				onChange={(event) => setTitle(event.target.value)}
				placeholder={UNTITLED_PROJECT}
				aria-label="Project title"
				autoComplete="off"
			/>
		</h1>
	);
}
