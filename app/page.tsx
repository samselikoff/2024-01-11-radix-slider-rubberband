"use client";

import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/20/solid";
import * as Slider from "@radix-ui/react-slider";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "framer-motion";
import { useState } from "react";

// Sigmoid function. Output is between 0 and 1.
function decay(x: number) {
  return 1 / (1 + Math.exp(-x)) - 0.5;
}

const MAX_PIXELS = 150;
const SOME_WIDTH = 320;

export default function Page() {
  let [volume, setVolume] = useState(50);

  // Animation state
  let [pressed, setPressed] = useState(false);
  let pixels = useMotionValue(0);
  let [activeVariant, setActiveVariant] = useState("initial");

  let bounds = useTransform(() => {
    return pixels.get() < 0 ? -1 : pixels.get() > SOME_WIDTH ? 1 : 0;
  });

  let pixelsDecayed = useTransform(() => {
    if (pressed && bounds.get() !== 0) {
      return pixels.get() < 0 ? pixels.get() : pixels.get() - SOME_WIDTH;
    } else {
      return 0;
    }
  });

  let pixelsDecayedAnimated = useSpring(pixelsDecayed, {
    damping: 10,
    mass: 1,
    stiffness: 100,
  });
  let pixelsUsed = pressed ? pixelsDecayed : pixelsDecayedAnimated;

  let scaleX = useTransform(() => {
    // needs original width
    return bounds.get() < 0
      ? 1 - pixelsDecayed.get() / SOME_WIDTH
      : 1 + pixelsDecayed.get() / SOME_WIDTH;
  });

  // let pixelsDecayed = useSpring(pixelsDecayedR);

  // useMotionValueEvent(pixels, "change", (v) => {
  //   if (pressed.get()) {
  //     if (v < 0) {
  //       // dragging past left bounds
  //       let decayedPixels = decay(v / MAX_PIXELS) * MAX_PIXELS;
  //       pixelsDecayed.set(decayedPixels);
  //       // bounds.set(-1);
  //     } else if (v > SOME_WIDTH) {
  //       // dragging past right bounds
  //       let decayedPixels = decay((v - SOME_WIDTH) / MAX_PIXELS) * MAX_PIXELS;
  //       pixelsDecayed.set(decayedPixels);
  //       // bounds.set(1);
  //     } else {
  //       pixelsDecayed.set(0);
  //       // bounds.set(0);
  //     }
  //   }
  // });

  // useMotionValueEvent(pressed, "change", (v) => {
  //   if (!v && (pixels.get() < 0 || pixels.get() > SOME_WIDTH)) {
  //     animate(pixelsDecayed, 0, { type: "spring", bounce: 0.5 });
  //   }
  // });

  useMotionValueEvent(bounds, "change", (v) => {
    if (v === -1) {
      setActiveVariant("left");
    } else if (v === 1) {
      setActiveVariant("right");
    } else {
      setActiveVariant("initial");
    }
  });

  let pixelsF = useTransform(pixels, (p) => Math.floor(p));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <div className="w-full">
        <motion.div
          // whileHover={{ "--height": "12px", scale: 1.1 }}
          style={{ "--height": "6px", scale: 1 }}
          className="~bg-gray-900 flex cursor-grab justify-center p-3 active:cursor-grabbing"
          animate={activeVariant}
          // transition={{
          //   type: "spring",
          //   bounce: 0,
          //   duration: 0.4,
          // }}
        >
          <div className="flex w-full max-w-sm items-center gap-3">
            <motion.div
              variants={{
                left: { scale: [1, 1.4, 1], transition: { duration: 0.3 } },
              }}
              style={{
                translateX: useTransform(() =>
                  bounds.get() < 0 ? pixelsUsed.get() : 0,
                ),
                // translateX: useTransform(pixelsDecayed, (v) =>
                //   bounds.get() < 0 ? v : 0,
                // ),
              }}
            >
              <SpeakerXMarkIcon className="size-5 text-white" />
            </motion.div>

            <Slider.Root
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              onLostPointerCapture={() => {
                // animate(pixels, 0, {
                //   type: "spring",
                //   bounce: 0.4,
                //   duration: 0.6,
                // });
                // pressed.set(0);
                setPressed(false);
              }}
              onPointerDown={(e) => {
                let { x } = e.currentTarget.getBoundingClientRect();
                let diff = e.clientX - x;
                pixels.set(diff);
                // pressed.set(1);
                setPressed(true);
              }}
              // onPointerUp={() => {
              //   pressed.set(0);
              // }}
              onPointerMove={(e) => {
                if (e.buttons > 0) {
                  let { x } = e.currentTarget.getBoundingClientRect();
                  let diff = e.clientX - x;
                  pixels.set(diff);
                }
              }}
              className="relative flex w-full grow touch-none items-center "
            >
              <motion.div
                style={{
                  scaleX: useTransform(() => {
                    // needs original width
                    return bounds.get() < 0
                      ? 1 - pixelsUsed.get() / SOME_WIDTH
                      : 1 + pixelsUsed.get() / SOME_WIDTH;
                  }),

                  transformOrigin: useTransform(() =>
                    bounds.get() < 0 ? "right" : "left",
                  ),

                  height: "var(--height)",
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
                right: { scale: [1, 1.4, 1], transition: { duration: 0.3 } },
              }}
              style={{
                translateX: useTransform(() =>
                  bounds.get() > 0 ? pixelsUsed.get() : 0,
                ),
              }}
            >
              <SpeakerWaveIcon className="size-5 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* <div className="mt-2 tabular-nums text-white">{volume}</div> */}
      <div className=" text-center">
        <p className="text-white">
          Pixels:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pixelsF}
          </motion.span>
        </p>
        {/* <p className="text-white">
          Pixels extra:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pixelsExtra}
          </motion.span>
        </p> */}
        <p className="text-white">
          Pressed:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pressed ? "true" : "false"}
          </motion.span>
        </p>

        <p className="text-white">
          Bounds:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {bounds}
          </motion.span>
        </p>

        {/* <p className="text-white">
          Pixels decayed:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pixelsDecayed}
          </motion.span>
        </p> */}

        {/* 
        <p className="text-white">
          Pixels decayed left:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pixelsDecayedLeft}
          </motion.span>
        </p> */}
        {/* <p className="text-white">
          Pressed:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pressed}
          </motion.span>
        </p>
        <p className="text-white">
          Pixels sync:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pixelsSync}
          </motion.span>
        </p> */}
      </div>
    </div>
  );
}
