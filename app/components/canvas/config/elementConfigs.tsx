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
  panelColor: string;
  defaultAttributes?: Record<string, string>;
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
    panelColor: "slate",
    defaultAttributes: {
      gender: TTSGender.Male,
      age: TTSAge.Adult,
      pitch: TTSPitch.Medium,
      accent: TTSAccent.American,
    },
  },
  character: {
    id: "character",
    type: "character",
    connector: "tts",
    label: "Character",
    icon: <User size={16} />,
    bgColor: "bg-amber-600",
    placeholder: "What does this character say?",
    panelColor: "amber",
    defaultAttributes: {
      gender: TTSGender.Male,
      age: TTSAge.Adult,
      pitch: TTSPitch.Medium,
      accent: TTSAccent.American,
    },
  },
  image: {
    id: "image",
    type: "image",
    connector: "image",
    label: "Image",
    icon: <ImageIcon size={16} />,
    bgColor: "bg-cyan-600",
    placeholder: "Describe the image...",
    panelColor: "cyan",
  },
  clip: {
    id: "clip",
    type: "clip",
    connector: "video",
    label: "Clip",
    icon: <Film size={16} />,
    bgColor: "bg-indigo-600",
    placeholder: "Describe the video clip...",
    panelColor: "indigo",
    defaultAttributes: {
      duration: "5s",
    },
  },
  sound: {
    id: "sound",
    type: "sound",
    connector: "sfx",
    label: "Sound",
    icon: <Volume2 size={16} />,
    bgColor: "bg-emerald-600",
    placeholder: "Describe the sound effect...",
    panelColor: "emerald",
    defaultAttributes: {
      type: SoundType.Transient,
    },
  },
  music: {
    id: "music",
    type: "music",
    connector: "music",
    label: "Music",
    icon: <Music size={16} />,
    bgColor: "bg-violet-600",
    placeholder: "Describe the music...",
    panelColor: "violet",
  },
};

export const colorClasses: Record<
  string,
  {
    background: string;
    outline: string;
    hoverBackground: string;
    hoverOutline: string;
  }
> = {
  slate: {
    background: "bg-slate-400/30",
    outline: "outline outline-1 outline-slate-300/60",
    hoverBackground: "hover:bg-slate-400/50",
    hoverOutline: "hover:outline-slate-300/80",
  },
  amber: {
    background: "bg-amber-400/30",
    outline: "outline outline-1 outline-amber-300/60",
    hoverBackground: "hover:bg-amber-400/50",
    hoverOutline: "hover:outline-amber-300/80",
  },
  cyan: {
    background: "bg-cyan-400/30",
    outline: "outline outline-1 outline-cyan-300/60",
    hoverBackground: "hover:bg-cyan-400/50",
    hoverOutline: "hover:outline-cyan-300/80",
  },
  indigo: {
    background: "bg-indigo-400/30",
    outline: "outline outline-1 outline-indigo-300/60",
    hoverBackground: "hover:bg-indigo-400/50",
    hoverOutline: "hover:outline-indigo-300/80",
  },
  emerald: {
    background: "bg-emerald-400/30",
    outline: "outline outline-1 outline-emerald-300/60",
    hoverBackground: "hover:bg-emerald-400/50",
    hoverOutline: "hover:outline-emerald-300/80",
  },
  violet: {
    background: "bg-violet-400/30",
    outline: "outline outline-1 outline-violet-300/60",
    hoverBackground: "hover:bg-violet-400/50",
    hoverOutline: "hover:outline-violet-300/80",
  },
};
