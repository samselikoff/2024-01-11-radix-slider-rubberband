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
import { ElementRef, useRef, useState } from "react";

// Sigmoid function. Output is between 0 and 1.
function decay(value: number) {
  return 1 / (1 + Math.exp(-value)) - 0.5;
}

const MAX_PIXELS = 75;

export default function Page() {
  let [volume, setVolume] = useState(50);

  let ref = useRef<ElementRef<typeof Slider.Root>>(null);
  let [region, setRegion] = useState("middle");
  let clientX = useMotionValue(0);
  let overflow = useMotionValue(0);

  useMotionValueEvent(clientX, "change", (latestValue) => {
    if (ref.current) {
      let { left, right } = ref.current.getBoundingClientRect();
      let newValue;

      if (latestValue < left) {
        setRegion("left");
        newValue = left - latestValue;
      } else if (latestValue > right) {
        setRegion("right");
        newValue = latestValue - right;
      } else {
        setRegion("middle");
        newValue = 0;
      }

      overflow.set(decay(newValue / MAX_PIXELS) * MAX_PIXELS);
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full">
        <div className="flex justify-center">
          <div className="flex w-full max-w-xs items-center gap-3">
            <motion.div
              style={{
                x: useTransform(() =>
                  region === "left" ? -overflow.get() : 0,
                ),
              }}
            >
              <SpeakerXMarkIcon className="size-5 text-white" />
            </motion.div>

            <Slider.Root
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              className="relative flex w-full grow cursor-grab touch-none items-center py-4 active:cursor-grabbing"
              ref={ref}
              onPointerMove={(e) => {
                if (e.buttons > 0) {
                  overflow.stop();
                  clientX.set(e.clientX);
                }
              }}
              onLostPointerCapture={() => {
                animate(overflow, 0, { type: "spring", bounce: 0.5 });
              }}
            >
              <motion.div
                style={{
                  scaleX: useTransform(() => {
                    if (ref.current) {
                      let { width } = ref.current.getBoundingClientRect();

                      return 1 + overflow.get() / width;
                    }
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

            <motion.div style={{ x: region === "right" ? overflow : 0 }}>
              <SpeakerWaveIcon className="size-5 text-white" />
            </motion.div>
          </div>
        </div>
      </div>

      <div className=" text-center">
        <div>
          clientX:{" "}
          <motion.span className="tabular-nums">
            {useTransform(() => Math.floor(clientX.get()))}
          </motion.span>
        </div>
        <div>
          overflow:{" "}
          <motion.span className="tabular-nums">
            {useTransform(() => Math.floor(overflow.get()))}
          </motion.span>
        </div>
        <div>region: {region}</div>
      </div>

      {/* <p className="mt-1 text-center font-medium">
        Volume: <span className="tabular-nums">{volume}</span>
      </p> */}
    </div>
  );
}
