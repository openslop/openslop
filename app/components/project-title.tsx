"use client";

import { Input } from "@/components/ui/input";
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
				placeholder="Untitled"
				aria-label="Project title"
				autoComplete="off"
			/>
		</h1>
	);
}
