import { useEffect } from "react";

export default function PlaybackControls({
  history,
  playbackIndex,
  setPlaybackIndex,
  isPlaying,
  setIsPlaying,
}) {
  useEffect(() => {
    if (!isPlaying || history.length === 0) return;

    const timer = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev >= history.length - 1) {
          setIsPlaying(false);
          return prev;
        }

        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, history, setPlaybackIndex, setIsPlaying]);

  return (
    <div className="flex gap-3 mb-4">
      <button
        onClick={() => setIsPlaying(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg"
      >
        ▶ Play
      </button>

      <button
        onClick={() => setIsPlaying(false)}
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
      >
        ⏸ Pause
      </button>

      <button
        onClick={() => {
          setPlaybackIndex(0);
          setIsPlaying(false);
        }}
        className="bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        🔄 Reset
      </button>
    </div>
  );
}