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
function decay(value: number, max: number) {
  let entry = value / max;
  let sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);

  return sigmoid * max;
}

export default function Page() {
  let [volume, setVolume] = useState(50);
  let [debug, setDebug] = useState(false);

  let ref = useRef<ElementRef<typeof Slider.Root>>(null);
  let [region, setRegion] = useState("middle");
  let clientX = useMotionValue(0);
  let overflow = useMotionValue(0);
  let scale = useMotionValue(1);

  useMotionValueEvent(clientX, "change", (latest) => {
    if (ref.current) {
      let { left, right } = ref.current.getBoundingClientRect();
      let newValue;

      if (latest < left) {
        setRegion("left");
        newValue = left - latest;
      } else if (latest > right) {
        setRegion("right");
        newValue = latest - right;
      } else {
        setRegion("middle");
        newValue = 0;
      }

      overflow.set(decay(newValue, 75));
    }
  });

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center">
      <div className="flex w-full flex-col items-center">
        <div className="flex w-full select-none justify-center px-12">
          <motion.div
            onHoverStart={() => {
              animate(scale, 1.2);
            }}
            onHoverEnd={() => {
              animate(scale, 1);
            }}
            onPointerDown={() => {
              animate(scale, 1.2);
            }}
            onPointerUp={() => {
              animate(scale, 1);
            }}
            style={{
              scale,
              opacity: useTransform(scale, [1, 1.2], [0.7, 1]),
            }}
            className="flex w-full touch-none select-none items-center justify-center gap-3"
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
              <SpeakerXMarkIcon className="size-5 translate-x-0 translate-y-0 text-white" />
            </motion.div>

            <Slider.Root
              ref={ref}
              value={[volume]}
              onValueChange={([v]) => setVolume(Math.floor(v))}
              step={0.01}
              className="relative flex w-full max-w-[200px] grow cursor-grab touch-none select-none items-center py-4 active:cursor-grabbing"
              onPointerMove={(e) => {
                if (e.buttons > 0) {
                  clientX.jump(e.clientX);
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
                  scaleY: useTransform(overflow, [0, 75], [1, 0.8]),
                  transformOrigin: useTransform(() => {
                    if (ref.current) {
                      let { left, width } = ref.current.getBoundingClientRect();

                      return clientX.get() < left + width / 2
                        ? "right"
                        : "left";
                    }
                  }),
                  height: useTransform(scale, [1, 1.2], [6, 12]),
                  marginTop: useTransform(scale, [1, 1.2], [0, -3]),
                  marginBottom: useTransform(scale, [1, 1.2], [0, -3]),
                }}
                className="flex grow"
              >
                <Slider.Track className="relative isolate h-full grow overflow-hidden rounded-full bg-gray-500 ">
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
              <SpeakerWaveIcon className="size-5 translate-x-0 translate-y-0 text-white" />
            </motion.div>
          </motion.div>
        </div>

        <p className="mt-1 text-center font-medium">
          Volume: <span className="tabular-nums">{volume}</span>
        </p>

        <div className="mt-10">
          <button
            onClick={() => setDebug(!debug)}
            className="mt-4 w-full text-center text-sm font-medium text-gray-500 hover:underline"
          >
            {debug ? "Close" : "Debug"}
          </button>
          <div
            className={`${
              debug ? "" : "opacity-0"
            } mt-8 border border-gray-800 px-4 py-2`}
          >
            <table className="mx-auto max-w-xs text-gray-500">
              <tbody>
                <tr>
                  <td className="text-right">clientX:</td>
                  <motion.td className="w-[80px] pl-4 tabular-nums">
                    {useTransform(() => Math.floor(clientX.get()))}
                  </motion.td>
                </tr>
                <tr>
                  <td className="text-right">overflow:</td>
                  <motion.td className="w-[80px] pl-4 tabular-nums">
                    {useTransform(() => Math.floor(overflow.get()))}
                  </motion.td>
                </tr>
                <tr>
                  <td className="text-right">region:</td>
                  <td className="w-[80px] pl-4">{region}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
