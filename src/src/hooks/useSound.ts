import { useCallback, useRef } from "react";

export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!audioRef.current) {
    audioRef.current = new Audio(src);
    audioRef.current.preload = "auto";
  }

  const play = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
      console.warn("Audio play blocked:", err);
    });
  }, []);

  const unlock = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current
      .play()
      .then(() => {
        audioRef.current?.pause();
      })
      .catch((err) => console.warn("Unlock failed:", err));
  }, []);

  return { play, unlock };
}
