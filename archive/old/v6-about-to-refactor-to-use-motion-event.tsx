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

  let pixelsOverflowNew = useTransform(() => {
    if (ref.current) {
      let { x, width } = ref.current.getBoundingClientRect();
      if (clientX.get() < x) {
        return clientX.get() - x;
      } else if (clientX.get() > x + width) {
        return clientX.get() - x - width;
      } else {
        return 0;
      }
    } else {
      return 0;
    }

    // if ()

    // if (ref.current) {
    //   let { x, width } = ref.current.getBoundingClientRect();
    //   return x + width;
    // } else {
    //   return 0;
    // }
    // // return clientX.get();
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full">
        <MotionConfig transition={{ type: "spring", bounce: 0, duration: 0.4 }}>
          <motion.div
            whileHover="hovered"
            // whileHover={
            //   {
            //     "--height": "12px",
            //     scale: 1.1,
            //   } as CSSProperties
            // }
            style={{ "--height": "6px", scale: 1 } as CSSProperties}
            className="~bg-gray-900 flex cursor-grab justify-center p-3 active:cursor-grabbing"
            initial={false}
            animate={bounds}
            variants={{
              hovered: {
                scale: 1.1,
              },
            }}
            // transition={{
            //   type: "spring",
            //   bounce: 0,
            //   duration: 0.4,
            // }}
          >
            <div className="flex w-full max-w-sm items-center gap-3">
              <motion.div
                variants={{
                  left: { scale: [1, 1.4, 1], transition: { duration: 0.25 } },
                }}
                style={{ translateX: bounds === "left" ? pixelsOverflow : 0 }}
              >
                <SpeakerXMarkIcon className="size-5 text-white" />
              </motion.div>
              <Slider.Root
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                ref={ref}
                onLostPointerCapture={() => {
                  animate(pixelsOverflow, 0, { type: "spring" });
                }}
                onPointerDown={(e) => {
                  clientX.set(e.clientX);
                }}
                onPointerMove={(e) => {
                  if (e.buttons > 0) {
                    let { x } = e.currentTarget.getBoundingClientRect();
                    clientX.set(e.clientX);
                    let pixelsFromLeft = e.clientX - x;
                    if (pixelsFromLeft < 0) {
                      setBounds("left");
                      pixelsOverflow.set(pixelsFromLeft);
                    } else if (pixelsFromLeft > SOME_WIDTH) {
                      setBounds("right");
                      pixelsOverflow.set(pixelsFromLeft - SOME_WIDTH);
                    } else {
                      setBounds("initial");
                      pixelsOverflow.set(0);
                    }
                  }
                }}
                className="~border border-red-500~ relative flex w-full grow touch-none items-center py-2 "
              >
                <motion.div
                  style={{
                    scaleX: useTransform(() => {
                      // needs original width
                      return bounds === "left"
                        ? 1 - pixelsOverflow.get() / SOME_WIDTH
                        : 1 + pixelsOverflow.get() / SOME_WIDTH;
                    }),
                    transformOrigin: bounds === "left" ? "right" : "left",
                    height: 6,
                  }}
                  variants={{
                    hovered: {
                      height: 12,
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
                variants={{
                  right: { scale: [1, 1.4, 1], transition: { duration: 0.25 } },
                }}
                style={{ translateX: bounds === "right" ? pixelsOverflow : 0 }}
              >
                <SpeakerWaveIcon className="size-5 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </MotionConfig>
      </div>

      <div className="mt-8 w-full max-w-sm text-left">
        <Debug label="pixelsOverflow" motionValue={pixelsOverflow} />
        <Debug label="pixelsOverflowNew" motionValue={pixelsOverflowNew} />
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
