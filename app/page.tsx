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

// Sigmoid-based decay function
// https://en.wikipedia.org/wiki/Sigmoid_function
function decay(value: number, max: number) {
  let entry = value / max;
  let sigmoid = 2 / (1 + Math.exp(-entry)) - 1;

  return sigmoid * max;
}

export default function Page() {
  let [volume, setVolume] = useState(50);

  let clientX = useMotionValue(0);
  let overflow = useMotionValue(0);
  let scale = useMotionValue(1);
  let [region, setRegion] = useState<"left" | "middle" | "right">("middle");
  let ref = useRef<ElementRef<typeof Slider.Root>>(null);

  useMotionValueEvent(clientX, "change", (latest) => {
    if (ref.current) {
      let { left, right } = ref.current.getBoundingClientRect();
      let newOverflow;

      if (latest < left) {
        setRegion("left");
        newOverflow = left - latest;
      } else if (latest > right) {
        setRegion("right");
        newOverflow = latest - right;
      } else {
        setRegion("middle");
        newOverflow = 0;
      }

      overflow.jump(decay(newOverflow, 75));
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full">
        <div className="flex justify-center">
          <motion.div
            onHoverStart={() => animate(scale, 1.2)}
            onHoverEnd={() => animate(scale, 1)}
            style={{ scale }}
            className="flex w-full items-center gap-3 px-60"
          >
            <motion.div
              animate={{
                scale: region === "left" ? [1, 1.4, 1] : 1,
                transition: { duration: 0.25 },
              }}
              style={{
                x: useTransform(() =>
                  region === "left" ? -overflow.get() / scale.get() : 0,
                ),
              }}
            >
              <SpeakerXMarkIcon className="size-5 text-white" />
            </motion.div>

            <Slider.Root
              ref={ref}
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              className="relative flex w-full grow cursor-grab touch-none items-center py-4 active:cursor-grabbing"
              onPointerMove={(e) => {
                if (e.buttons > 0) {
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
                      let bounds = ref.current.getBoundingClientRect();

                      return (bounds.width + overflow.get()) / bounds.width;
                    }
                  }),
                  scaleY: useTransform(overflow, [0, 75], [1, 0.5]),
                  transformOrigin: region === "left" ? "right" : "left",
                  height: useTransform(scale, [1, 1.2], [6, 16]),
                  marginTop: useTransform(scale, [1, 1.2], [0, -5]),
                  marginBottom: useTransform(scale, [1, 1.2], [0, -5]),
                }}
                className="flex grow"
              >
                <Slider.Track className="relative h-full grow overflow-hidden rounded-full bg-gray-500">
                  <Slider.Range className="absolute h-full bg-white" />
                </Slider.Track>
              </motion.div>
              <Slider.Thumb />
            </Slider.Root>

            <motion.div
              animate={{
                scale: region === "right" ? [1, 1.4, 1] : 1,
                transition: { duration: 0.25 },
              }}
              style={{
                x: useTransform(() =>
                  region === "right" ? overflow.get() / scale.get() : 0,
                ),
              }}
            >
              <SpeakerWaveIcon className="size-5 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* <div className="w-[120px]">
        <p>
          clientX:{" "}
          <motion.span className="tabular-nums">
            {useTransform(() => Math.floor(clientX.get()))}
          </motion.span>
        </p>
        <p>
          overflow:{" "}
          <motion.span className="tabular-nums">
            {useTransform(() => Math.floor(overflow.get()))}
          </motion.span>
        </p>
        <p>region: {region}</p>
      </div> */}

      <p className="mt-1 text-center font-medium">
        Volume: <span className="tabular-nums">{volume}</span>
      </p>
    </div>
  );
}
