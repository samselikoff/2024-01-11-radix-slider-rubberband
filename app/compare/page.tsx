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
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-20">
      <Begin />
      <End />
    </div>
  );
}

function Begin() {
  let [volume, setVolume] = useState(50);

  return (
    <div className="w-full">
      <div className="w-full px-12">
        <div className="flex justify-center">
          <div className="flex w-full max-w-sm items-center gap-3">
            <div>
              <SpeakerXMarkIcon className="size-5 text-white" />
            </div>

            <Slider.Root
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              className="relative flex w-full grow cursor-grab touch-none items-center py-4 active:cursor-grabbing"
            >
              <div className="flex h-1.5 grow">
                <Slider.Track className="relative h-full grow overflow-hidden rounded-full bg-gray-500">
                  <Slider.Range className="absolute h-full bg-white" />
                </Slider.Track>
              </div>
              <Slider.Thumb />
            </Slider.Root>

            <div>
              <SpeakerWaveIcon className="size-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-1 text-center font-medium">
        Volume: <span className="tabular-nums">{volume}</span>
      </p>
    </div>
  );
}

function End() {
  let [volume, setVolume] = useState(50);

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
    <div className="w-full">
      <div className="w-full">
        <div className="flex justify-center">
          <motion.div
            // whileHover={{ scale: 1.2 }}
            onHoverStart={() => {
              animate(scale, 1.2);
            }}
            onHoverEnd={() => {
              animate(scale, 1);
            }}
            style={{
              scale,
              // opacity: useTransform(scale, [1, 1.2], [0.7, 1])
            }}
            className="flex w-full max-w-sm items-center gap-3"
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
                  transformOrigin: useTransform(() => {
                    if (ref.current) {
                      let { left, width } = ref.current.getBoundingClientRect();

                      return clientX.get() < left + width / 2
                        ? "right"
                        : "left";
                    }
                  }),
                  scaleY: useTransform(overflow, [0, 75], [1, 0.8]),
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

      {/* <div>
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
      <div>region: {region}</div> */}

      <p className="mt-1 text-center font-medium">
        Volume: <span className="tabular-nums">{volume}</span>
      </p>
    </div>
  );
}
