import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

export type CanvasElementType =
  | "narration"
  | "character"
  | "image"
  | "clip"
  | "sound"
  | "music";

const CANVAS_ELEMENT_TYPE_LIST: CanvasElementType[] = [
  "narration",
  "character",
  "image",
  "clip",
  "sound",
  "music",
];

export const CANVAS_ELEMENT_TYPES = new Set<CanvasElementType>(
  CANVAS_ELEMENT_TYPE_LIST,
);

export type CanvasEditor = BaseEditor & ReactEditor & { id?: string };

export type CanvasElement = {
  id: string;
  type: CanvasElementType;
  customAttributes?: Record<string, string>;
  children: CanvasText[];
};

export type CanvasText = {
  id: string;
  type: CanvasElementType;
  text: string;
};

declare module "slate" {
  interface CustomTypes {
    Editor: CanvasEditor;
    Element: CanvasElement;
    Text: CanvasText;
  }
}
