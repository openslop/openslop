"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type PlayerPosition = "top" | "right";

const NARROW_BREAKPOINT = 1066;

const PlayerPositionContext = createContext<{
  position: PlayerPosition;
  visible: boolean;
  setPosition: (position: PlayerPosition) => void;
  setVisible: (visible: boolean) => void;
  showPlayer: () => void;
  narrowViewport: boolean;
}>({
  position: "top",
  visible: false,
  setPosition: () => {},
  setVisible: () => {},
  showPlayer: () => {},
  narrowViewport: false,
});

export function PlayerPositionProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<PlayerPosition>("top");
  const [visible, setVisible] = useState(false);
  const [narrowViewport, setNarrowViewport] = useState(false);

  const showPlayer = useCallback(() => setVisible(true), []);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${NARROW_BREAKPOINT}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setNarrowViewport(e.matches);
      if (e.matches) {
        setPosition((prev) => (prev === "right" ? "top" : prev));
      }
    };
    onChange(mql);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <PlayerPositionContext
      value={{
        position,
        visible,
        setPosition,
        setVisible,
        showPlayer,
        narrowViewport,
      }}
    >
      {children}
    </PlayerPositionContext>
  );
}

export function usePlayerPosition() {
  return useContext(PlayerPositionContext);
}
