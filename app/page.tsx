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

  let [region, setRegion] = useState("middle");
  let position = useMotionValue(0);
  let x = useMotionValue(0);

  useMotionValueEvent(position, "change", (latestValue) => {
    if (latestValue < 0) {
      setRegion("left");
      x.set(latestValue);
    } else if (latestValue > 320) {
      setRegion("right");
      x.set(latestValue - 320);
    } else {
      setRegion("middle");
      x.set(0);
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full">
        <div className="flex justify-center">
          <div className="flex w-full max-w-sm items-center gap-3">
            <motion.div style={{ x: region === "left" ? x : 0 }}>
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
                animate(x, 0, { type: "spring", bounce: 0.5 });
              }}
            >
              <motion.div
                style={{
                  scaleX: useTransform(() => {
                    return region === "left"
                      ? (320 - x.get()) / 320
                      : (320 + x.get()) / 320;
                  }),
                  transformOrigin: region === "left" ? "right" : "left",
                }}
                className="flex h-1.5 grow"
              >
                <Slider.Track className="relative h-full grow overflow-hidden rounded-full bg-white">
                  <Slider.Range className="absolute h-full bg-sky-500" />
                </Slider.Track>
              </motion.div>
              <Slider.Thumb />
            </Slider.Root>

            <motion.div style={{ x: region === "right" ? x : 0 }}>
              <SpeakerWaveIcon className="size-5 text-white" />
            </motion.div>
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

      <div>region: {region}</div>

      {/* <p className="mt-1 text-center font-medium">
        Volume: <span className="tabular-nums">{volume}</span>
      </p> */}
    </div>
  );
}
