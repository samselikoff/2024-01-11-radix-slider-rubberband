"use client";

import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/20/solid";
import * as Slider from "@radix-ui/react-slider";
import {
  MotionConfig,
  MotionValue,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "framer-motion";
import { CSSProperties, ElementRef, useRef, useState } from "react";

// Sigmoid function. Output is between 0 and 1.
function decay(x: number) {
  return 1 / (1 + Math.exp(-x)) - 0.5;
}

const MAX_PIXELS = 150;
const SOME_WIDTH = 320;

export default function Page() {
  let [volume, setVolume] = useState(50);

  // Animation state
  let ref = useRef<ElementRef<typeof Slider.Root>>(null);
  let [bounds, setBounds] = useState("initial");
  let clientX = useMotionValue(0);
  let pixelsOverflow = useMotionValue(0);

  useMotionValueEvent(clientX, "change", (latest) => {
    if (ref.current) {
      let { x, width } = ref.current.getBoundingClientRect();

      if (latest < x) {
        setBounds("left");
        pixelsOverflow.set(x - latest);
      } else if (latest > x + width) {
        setBounds("right");
        pixelsOverflow.set(latest - x - width);
      } else {
        setBounds("initial");
        pixelsOverflow.set(0);
      }
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full">
        <motion.div
          whileHover="hovered"
          className="~bg-gray-900 flex justify-center"
          initial={false}
          animate={bounds}
          variants={{
            hovered: {
              scale: 1.1,
              transition: { type: "spring", bounce: 0, duration: 0.4 },
            },
          }}
        >
          <div className="flex w-full max-w-sm items-center gap-3">
            <motion.div
              animate={{
                scale: bounds === "left" ? [1, 1.4, 1] : 1,
                transition: { duration: 0.25 },
              }}
              style={{
                translateX: useTransform(() =>
                  bounds === "left" ? -pixelsOverflow.get() : 0,
                ),
              }}
            >
              <SpeakerXMarkIcon className="size-6 text-white" />
            </motion.div>

            <Slider.Root
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              ref={ref}
              onLostPointerCapture={() => {
                animate(pixelsOverflow, 0, { type: "spring" });
              }}
              onPointerMove={(e) => {
                if (e.buttons > 0) {
                  clientX.set(e.clientX);
                }
              }}
              className="~border relative flex w-full grow cursor-grab touch-none items-center border-red-500 py-4 active:cursor-grabbing "
            >
              <motion.div
                style={{
                  scaleX: useTransform(
                    () => 1 + pixelsOverflow.get() / SOME_WIDTH,
                  ),
                  transformOrigin: bounds === "left" ? "right" : "left",
                  height: 6,
                }}
                variants={{
                  hovered: {
                    height: 12,
                    transition: { type: "spring", bounce: 0, duration: 0.4 },
                  },
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
              animate={{
                scale: bounds === "right" ? [1, 1.4, 1] : 1,
                transition: { duration: 0.25 },
              }}
              style={{ translateX: bounds === "right" ? pixelsOverflow : 0 }}
            >
              <SpeakerWaveIcon className="size-6 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 w-full max-w-sm text-left">
        <Debug label="pixelsOverflow" motionValue={pixelsOverflow} />
        <Debug label="clientX" motionValue={clientX} />
        <p>Bounds: {bounds}</p>
      </div>
    </div>
  );
}

function Debug({
  label,
  motionValue,
}: {
  label: string;
  motionValue: MotionValue;
}) {
  let flooredMV = useTransform(motionValue, (v) => Math.floor(v));

  return (
    <p>
      {label}:{" "}
      <motion.span className="mt-2 tabular-nums text-white">
        {flooredMV}
      </motion.span>
    </p>
  );
}
