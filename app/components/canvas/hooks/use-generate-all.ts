import type { Editor } from "slate";
import { getContentElements } from "@/lib/canvas/scenes";
import { useGenerateScope, type GenerateScope } from "./use-generate-scope";

const allElements = (editor: Editor) => getContentElements(editor.children);

export const useGenerateAll = (): GenerateScope =>
	useGenerateScope(allElements, "project");
