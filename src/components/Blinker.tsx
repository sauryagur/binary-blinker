// components/Blinker.tsx
import { createSignal, createEffect, onCleanup, Show } from "solid-js";
import { encodeData, EncodingType } from "../utils/encoder";

interface BlinkerProps {
  message: string;
  hz: number;
  encoding: EncodingType;
  active: boolean;
  onClose: () => void;
}

export const Blinker = (props: BlinkerProps) => {
  const [color, setColor] = createSignal("black");
  let containerRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (!props.active) return;

    const data = encodeData(props.message, props.encoding);
    let bitIndex = 0;
    let rafId: number;
    let lastTick = 0;

    // Calculate interval in ms based on Hz
    const interval = 1000 / props.hz;

    const loop = (time: number) => {
      if (time - lastTick >= interval) {
        lastTick = time;
        if (bitIndex < data.length) {
          setColor(data[bitIndex] === 1 ? "white" : "black");
          bitIndex++;
        } else {
          bitIndex = 0; // Loop transmission
        }
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    onCleanup(() => cancelAnimationFrame(rafId));
  });

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <Show when={props.active}>
      <div
        ref={containerRef}
        onClick={handleFullscreen}
        class="fixed inset-0 z-50 flex items-center justify-center cursor-none"
        style={{ "background-color": color(), transition: "none" }}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); props.onClose(); }}
          class="opacity-0 hover:opacity-100 transition-opacity bg-white text-black px-6 py-3 font-mono text-xs border border-black uppercase tracking-widest"
        >
          Stop / Exit
        </button>
      </div>
    </Show>
  );
};