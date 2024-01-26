"use client";

import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/20/solid";
import * as Slider from "@radix-ui/react-slider";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { useState } from "react";

// Sigmoid function. Output is between 0 and 1.
function decay(x: number) {
  return 1 / (1 + Math.exp(-x)) - 0.5;
}

const MAX_PIXELS = 75;
const SOME_WIDTH = 352;

export default function Page() {
  let pixels = useMotionValue(0);
  let pixelsSync = useMotionValue(0);

  let pixelsDecayed = useTransform(pixels, (p) => {
    return decay(p / MAX_PIXELS) * MAX_PIXELS;
  });

  let [volume, setVolume] = useState(50);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <div className="w-full">
        <motion.div
          whileHover={{ "--height": "12px", scale: 1.1 }}
          style={{ "--height": "6px", scale: 1 }}
          className="~bg-gray-900 flex cursor-grab justify-center p-3 active:cursor-grabbing"
          transition={{
            type: "spring",
            bounce: 0,
            duration: 0.4,
          }}
        >
          <div className="flex w-full max-w-sm items-center gap-3">
            <motion.div
              style={{
                translateX: useTransform(pixelsDecayed, (v) => {
                  return pixelsSync.get() < 0 ? v : 0;
                }),
                scale: useTransform(pixels, [0, -MAX_PIXELS], [1, 1.4]),
                transformOrigin: "right",
              }}
            >
              <SpeakerXMarkIcon className="size-5 text-white" />
            </motion.div>
            <Slider.Root
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              onLostPointerCapture={() => {
                animate(pixels, 0, {
                  type: "spring",
                  bounce: 0.4,
                  duration: 0.6,
                });
              }}
              onPointerMove={(e) => {
                if (e.buttons > 0) {
                  let { x } = e.currentTarget.getBoundingClientRect();
                  let diff = e.clientX - x;
                  pixels.stop();
                  pixelsSync.set(diff);

                  if (diff < 0) {
                    pixels.set(diff);
                  } else if (diff > SOME_WIDTH) {
                    pixels.set(diff - SOME_WIDTH);
                  } else {
                    pixels.set(0);
                  }
                }
              }}
              className="relative flex w-full grow touch-none items-center "
            >
              <motion.div
                style={{
                  scaleX: useTransform(pixelsDecayed, (p) => {
                    // needs original width
                    return pixelsSync.get() < 0 ? 1 - p / 320 : 1 + p / 320;
                  }),
                  transformOrigin: useTransform(pixelsSync, (p) =>
                    p < 0 ? "right" : "left",
                  ),
                  height: "var(--height)",
                }}
                className="relative flex grow"
              >
                <Slider.Track className="relative h-full grow overflow-hidden rounded-full bg-white">
                  <Slider.Range className="absolute h-full bg-sky-500" />
                </Slider.Track>
              </motion.div>
              <Slider.Thumb />
            </Slider.Root>
            <motion.div
              style={{
                translateX: useTransform(pixelsDecayed, (v) => {
                  return pixelsSync.get() > 0 ? v : 0;
                }),
                scale: useTransform(pixels, [0, MAX_PIXELS], [1, 1.4]),
              }}
            >
              <SpeakerWaveIcon className="size-5 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="mt-2 tabular-nums text-white">{volume}</div>
      <div className="invisible text-center">
        <p className="text-white">
          Pixels decayed:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pixels}
          </motion.span>
        </p>
        <p className="text-white">
          Pixels sync:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pixelsSync}
          </motion.span>
        </p>
      </div>
      {/* <motion.div className="mt-2 tabular-nums text-white">{pixels}</motion.div>
      <motion.div className="mt-2 tabular-nums text-white">
        {pixelsDecayed}
      </motion.div> */}
    </div>
  );
}
