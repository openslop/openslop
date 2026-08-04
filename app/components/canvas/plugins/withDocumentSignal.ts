import type { CanvasEditor } from "@/lib/canvas/types";

export type DocumentSignal = {
	/** Notifies on every change that replaces the document; returns an unsubscribe. */
	subscribeToDocument: (listener: () => void) => () => void;
};

export type SignallingEditor = CanvasEditor & DocumentSignal;

/**
 * Lets code outside `<Slate>` derive values from the document without holding a
 * copy of it in React state. Slate rebuilds `children` for every document
 * operation and leaves it alone for selection moves, so identity is the signal.
 */
export const withDocumentSignal = (editor: CanvasEditor): SignallingEditor => {
	const { onChange } = editor;
	const listeners = new Set<() => void>();
	const signalling = editor as SignallingEditor;
	let document = editor.children;

	signalling.subscribeToDocument = (listener) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	};

	signalling.onChange = (options) => {
		onChange(options);
		if (signalling.children === document) return;
		document = signalling.children;
		for (const listener of listeners) listener();
	};

	return signalling;
};
