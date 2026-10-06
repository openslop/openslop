"use client";

import type { Editor } from "slate";
import { useSlateSelector } from "slate-react";
import { titleText } from "./title";

const selectTitle = (editor: Editor) => titleText(editor.children);

export const useProjectTitle = (): string => useSlateSelector(selectTitle);
