import { createSignal, createEffect, onCleanup, Show } from "solid-js";
import { decodeBits } from "../utils/decoder";
import { EncodingType } from "../utils/config";

interface ScannerProps {
  active: boolean;
  hz: number;
  encoding: EncodingType;
  onClose: () => void;
}

export const Scanner = (props: ScannerProps) => {
  let videoRef: HTMLVideoElement | undefined;
  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  const [bits, setBits] = createSignal<number[]>([]);
  const [decoded, setDecoded] = createSignal<string>("");

  const SAMPLE_SIZE = 16; // px square
  const MAX_BITS = 2048;

  createEffect(() => {
    if (!props.active) return;

    let stream: MediaStream;
    let rafId = 0;
    let lastTick = 0;

    const interval = 1000 / Math.min(props.hz, 60);

    const startCamera = async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (!videoRef) return;

      videoRef.srcObject = stream;
      await videoRef.play();

      const loop = (time: number) => {
        if (time - lastTick >= interval) {
          lastTick = time;
          sample();
        }
        rafId = requestAnimationFrame(loop);
      };

      rafId = requestAnimationFrame(loop);
    };

    const sample = () => {
      if (!canvasRef || !videoRef) return;
      const ctx = canvasRef.getContext("2d");
      if (!ctx) return;

      const w = videoRef.videoWidth;
      const h = videoRef.videoHeight;
      if (!w || !h) return;

      canvasRef.width = w;
      canvasRef.height = h;
      ctx.drawImage(videoRef, 0, 0, w, h);

      const x = Math.floor(w / 2 - SAMPLE_SIZE / 2);
      const y = Math.floor(h / 2 - SAMPLE_SIZE / 2);

      const data = ctx.getImageData(x, y, SAMPLE_SIZE, SAMPLE_SIZE).data;

      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      }

      const brightness = sum / (data.length / 4);
      const bit = brightness > 128 ? 1 : 0;

      setBits((prev) => {
        const next = [...prev, bit].slice(-MAX_BITS);
        const text = decodeBits(next, props.encoding);
        if (text) setDecoded(text);
        return next;
      });
    };

    startCamera();

    onCleanup(() => {
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
      setBits([]);
      setDecoded("");
    });
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
        class="fixed inset-0 z-50 bg-black"
      >
        <video
          ref={videoRef}
          class="absolute inset-0 w-full h-full object-cover opacity-40"
          playsinline
          muted
        />

        <canvas ref={canvasRef} class="hidden" />

        {/* Center sampling square */}
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-16 h-16 border border-white/80" />
        </div>

        {/* UI */}
        <div class="absolute bottom-6 left-0 right-0 text-center text-white text-xs font-mono tracking-widest">
          {decoded() || "SCANNING…"}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            props.onClose();
          }}
          class="absolute top-6 right-6 bg-white text-black px-4 py-2 text-xs font-mono uppercase tracking-widest"
        >
          Stop
        </button>
      </div>
    </Show>
  );
};
