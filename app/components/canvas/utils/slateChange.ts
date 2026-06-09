import type { Operation } from "slate";

export function affectsDocument(operations: Operation[]): boolean {
	return operations.some((operation) => operation.type !== "set_selection");
}
