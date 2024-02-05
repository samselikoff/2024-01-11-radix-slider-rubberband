"use client";

import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/20/solid";
import * as Slider from "@radix-ui/react-slider";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";

export default function Page() {
  let [volume, setVolume] = useState(50);

  let position = useMotionValue(0);
  let x = useMotionValue(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full">
        <div className="flex justify-center">
          <div className="flex w-full max-w-sm items-center gap-3">
            <motion.div style={{ x: x }}>
              <SpeakerXMarkIcon className="size-5 text-white" />
            </motion.div>

            <Slider.Root
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              className="relative flex w-full grow cursor-grab touch-none items-center py-4 active:cursor-grabbing"
              onPointerMove={(e) => {
                if (e.buttons > 0) {
                  let bounds = e.currentTarget.getBoundingClientRect();
                  let overflow = e.clientX - bounds.x;

                  if (overflow < 0) {
                    x.set(overflow);
                  } else {
                    x.set(0);
                  }
                }
              }}
              onLostPointerCapture={() => {
                animate(x, 0, { type: "spring", bounce: 0.5 });
              }}
            >
              <motion.div
                style={{
                  scaleX: useTransform(() => {
                    return (320 - x.get()) / 320;
                  }),
                  transformOrigin: "right",
                }}
                className="flex h-1.5 grow"
              >
                <Slider.Track className="relative h-full grow overflow-hidden rounded-full bg-white">
                  <Slider.Range className="absolute h-full bg-sky-500" />
                </Slider.Track>
              </motion.div>
              <Slider.Thumb />
            </Slider.Root>

            <div>
              <SpeakerWaveIcon className="size-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div>
        position:{" "}
        <motion.span className="tabular-nums">
          {useTransform(() => Math.floor(position.get()))}
        </motion.span>
      </div>
      <div>
        x:{" "}
        <motion.span className="tabular-nums">
          {useTransform(() => Math.floor(x.get()))}
        </motion.span>
      </div>

      {/* <p className="mt-1 text-center font-medium">
        Volume: <span className="tabular-nums">{volume}</span>
      </p> */}
    </div>
  );
}
