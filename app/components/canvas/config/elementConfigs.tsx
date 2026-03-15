import {
  BookOpen,
  User,
  Image as ImageIcon,
  Film,
  Volume2,
  Music,
} from "lucide-react";
import type { CanvasElementType } from "../types";
import type { ConnectorType } from "@/lib/connectors/types";
import {
  TTSGender,
  TTSAge,
  TTSPitch,
  TTSAccent,
} from "@/lib/connectors/tts/enums";
import { SoundType } from "@/lib/connectors/sfx/enums";

export interface ElementConfig {
  id: string;
  type: CanvasElementType;
  connector: ConnectorType;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  placeholder: string;
  defaultAttributes?: Record<string, string>;
  visibleAttributes: string[];
}

export const ELEMENT_CONFIGS: Record<CanvasElementType, ElementConfig> = {
  narration: {
    id: "narration",
    type: "narration",
    connector: "tts",
    label: "Narration",
    icon: <BookOpen size={16} />,
    bgColor: "bg-slate-600",
    placeholder: "Write the narration...",

    defaultAttributes: {
      gender: TTSGender.Male,
      age: TTSAge.Adult,
      pitch: TTSPitch.Medium,
      accent: TTSAccent.American,
    },
    visibleAttributes: ["model"],
  },
  character: {
    id: "character",
    type: "character",
    connector: "tts",
    label: "Character",
    icon: <User size={16} />,
    bgColor: "bg-amber-600",
    placeholder: "What does this character say?",

    defaultAttributes: {
      gender: TTSGender.Male,
      age: TTSAge.Adult,
      pitch: TTSPitch.Medium,
      accent: TTSAccent.American,
    },
    visibleAttributes: ["model"],
  },
  image: {
    id: "image",
    type: "image",
    connector: "image",
    label: "Image",
    icon: <ImageIcon size={16} />,
    bgColor: "bg-cyan-600",
    placeholder: "Describe the image...",
    visibleAttributes: ["model", "art_style"],
  },
  clip: {
    id: "clip",
    type: "clip",
    connector: "video",
    label: "Clip",
    icon: <Film size={16} />,
    bgColor: "bg-indigo-600",
    placeholder: "Describe the video clip...",
    defaultAttributes: {
      duration: "5s",
    },
    visibleAttributes: ["model", "duration"],
  },
  sound: {
    id: "sound",
    type: "sound",
    connector: "sfx",
    label: "Sound",
    icon: <Volume2 size={16} />,
    bgColor: "bg-emerald-600",
    placeholder: "Describe the sound effect...",

    defaultAttributes: {
      type: SoundType.Transient,
    },
    visibleAttributes: ["model", "type"],
  },
  music: {
    id: "music",
    type: "music",
    connector: "music",
    label: "Music",
    icon: <Music size={16} />,
    bgColor: "bg-violet-600",
    placeholder: "Describe the music...",
    visibleAttributes: ["model", "length"],
  },
};

export const ELEMENT_LIST = Object.values(ELEMENT_CONFIGS);
