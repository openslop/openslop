"use client";

import { Component, type ReactNode } from "react";
import { toastError } from "@/lib/toastError";

type Props = { children: ReactNode; label?: string };
type State = { hasError: boolean };

/**
 * Catches render errors in its subtree, surfaces them via a sonner toast, and
 * renders nothing in place of the broken subtree. Use to keep one misbehaving
 * widget from blanking the whole app.
 */
export class ToastErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: unknown) {
		toastError(error, this.props.label);
	}

	render() {
		return this.state.hasError ? null : this.props.children;
	}
}
