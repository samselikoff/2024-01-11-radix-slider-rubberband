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

export default function Page() {
  let [volume, setVolume] = useState(50);

  let position = useMotionValue(0);
  let xLeft = useMotionValue(0);
  let xRight = useMotionValue(0);

  useMotionValueEvent(position, "change", (latestValue) => {
    if (latestValue < 0) {
      xLeft.set(latestValue);
    } else if (latestValue > 320) {
      xRight.set(latestValue - 320);
    } else {
      xLeft.set(0);
      xRight.set(0);
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full">
        <div className="flex justify-center">
          <div className="flex w-full max-w-sm items-center gap-3">
            <motion.div style={{ x: xLeft }}>
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

                  position.set(overflow);
                }
              }}
              onLostPointerCapture={() => {
                animate(xLeft, 0, { type: "spring", bounce: 0.5 });
                animate(xRight, 0, { type: "spring", bounce: 0.5 });
              }}
            >
              <motion.div
                style={{
                  scaleX: useTransform(() => {
                    return (320 + xRight.get()) / 320;
                  }),
                  transformOrigin: "left",
                }}
                // style={{
                //   scaleX: useTransform(() => {
                //     return (320 - xLeft.get()) / 320;
                //   }),
                //   transformOrigin: "right",
                // }}
                className="flex h-1.5 grow"
              >
                <Slider.Track className="relative h-full grow overflow-hidden rounded-full bg-white">
                  <Slider.Range className="absolute h-full bg-sky-500" />
                </Slider.Track>
              </motion.div>
              <Slider.Thumb />
            </Slider.Root>

            <motion.div style={{ x: xRight }}>
              <SpeakerWaveIcon className="size-5 text-white" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* <div>
        region: <motion.span className="tabular-nums">{region}</motion.span>
      </div> */}
      {/* <div>
        position:{" "}
        <motion.span className="tabular-nums">
          {useTransform(() => Math.floor(position.get()))}
        </motion.span>
      </div> */}
      <div>
        position:{" "}
        <motion.span className="tabular-nums">
          {useTransform(() => Math.floor(position.get()))}
        </motion.span>
      </div>
      <div>
        xLeft:{" "}
        <motion.span className="tabular-nums">
          {useTransform(() => Math.floor(xLeft.get()))}
        </motion.span>
      </div>
      <div>
        xRight:{" "}
        <motion.span className="tabular-nums">
          {useTransform(() => Math.floor(xRight.get()))}
        </motion.span>
      </div>

      {/* <p className="mt-1 text-center font-medium">
        Volume: <span className="tabular-nums">{volume}</span>
      </p> */}
    </div>
  );
}
