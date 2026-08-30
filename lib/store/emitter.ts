/** A store's subscription list, shaped for `useSyncExternalStore`. */
export interface Emitter {
	subscribe: (listener: () => void) => () => void;
	notify: () => void;
}

export function createEmitter(): Emitter {
	const listeners = new Set<() => void>();
	return {
		subscribe: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		notify: () => {
			for (const listener of listeners) listener();
		},
	};
}
