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

const MAX_PIXELS = 150;

export default function Page() {
  let [volume, setVolume] = useState(50);

  let ref = useRef<ElementRef<typeof Slider.Root>>(null);
  let [region, setRegion] = useState("middle");
  let clientX = useMotionValue(0);
  let overflow = useMotionValue(0);
  let scale = useMotionValue(1);

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
      // overflow.set(newValue);
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full px-12">
        <div className="flex justify-center">
          <motion.div
            onHoverStart={() =>
              animate(scale, 1.2, { type: "spring", bounce: 0, duration: 0.4 })
            }
            onHoverEnd={() =>
              animate(scale, 1, { type: "spring", bounce: 0, duration: 0.4 })
            }
            style={{ scale, opacity: useTransform(scale, [1, 1.2], [0.8, 1]) }}
            className="flex w-full items-center gap-3 px-60"
          >
            <motion.div
              style={{
                x: useTransform(() =>
                  region === "left" ? -overflow.get() / scale.get() : 0,
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
                  transformOrigin: region === "left" ? "right" : "left",
                  scaleX: useTransform(() => {
                    if (ref.current) {
                      return (
                        1 +
                        overflow.get() /
                          ref.current.getBoundingClientRect().width
                      );
                    }
                  }),
                  scaleY: useTransform(() => 1 - overflow.get() / MAX_PIXELS),
                  height: useTransform(scale, [1, 1.2], [6, 16]),
                  marginTop: useTransform(scale, [1, 1.2], [0, -5]),
                  marginBottom: useTransform(scale, [1, 1.2], [0, -5]),
                }}
                className="flex grow"
              >
                <Slider.Track className="relative h-full grow overflow-hidden rounded-full bg-gray-600">
                  <Slider.Range className="absolute h-full bg-white" />
                </Slider.Track>
              </motion.div>
              <Slider.Thumb />
            </Slider.Root>

            <motion.div
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
