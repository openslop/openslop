"use client";

import { createContext, use, useState, type ReactNode } from "react";

const ValueContext = createContext<string | null>(null);
const SetterContext = createContext<(id: string | null) => void>(() => {});

export function ActiveSceneProvider({ children }: { children: ReactNode }) {
	const [id, setId] = useState<string | null>(null);
	return (
		<SetterContext value={setId}>
			<ValueContext value={id}>{children}</ValueContext>
		</SetterContext>
	);
}

export function useActiveSceneId() {
	return use(ValueContext);
}

export function useSetActiveSceneId() {
	return use(SetterContext);
}
