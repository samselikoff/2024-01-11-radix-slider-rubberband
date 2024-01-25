"use client";

import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/20/solid";
import * as Slider from "@radix-ui/react-slider";
import {
  MotionConfig,
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
  let [bounds, setBounds] = useState("initial");
  let pixels = useMotionValue(0);

  let pixelsOverflow = useTransform(() => {
    if (bounds === "initial" || !pressed) return 0;

    return bounds === "left" ? pixels.get() : pixels.get() - SOME_WIDTH;
  });

  // let pixelsOverflowAnimated = useSpring(pixelsOverflow, {
  //   damping: 10,
  //   mass: 1,
  //   stiffness: 100,
  // });
  // let pixelsUsed = pressed ? pixelsOverflow : pixelsOverflowAnimated;

  let pixelsF = useTransform(pixels, (p) => Math.floor(p));
  let pixelsB = useTransform(pixelsOverflow, (p) => Math.floor(p));
  let pixelsC = useTransform(pixelsOverflowAnimated, (p) => Math.floor(p));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <div className="w-full">
        <MotionConfig
          transition={{ type: "spring", duration: pressed ? 0 : 0.5 }}
        >
          <motion.div
            // whileHover={{ "--height": "12px", scale: 1.1 }}
            style={{ "--height": "6px", scale: 1 }}
            className="~bg-gray-900 flex cursor-grab justify-center p-3 active:cursor-grabbing"
            animate={bounds}
            // transition={{
            //   type: "spring",
            //   bounce: 0,
            //   duration: 0.4,
            // }}
          >
            <div className="flex w-full max-w-sm items-center gap-3">
              <motion.div
                variants={{
                  left: {
                    scale: [1, 1.4, 1],
                    transition: { duration: 0.3 },
                  },
                }}
                style={{
                  translateX: bounds === "left" ? pixelsOverflow : 0,
                  // translateX: pixelsOverflow,
                }}
              >
                <SpeakerXMarkIcon className="size-5 text-white" />
              </motion.div>

              <Slider.Root
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                onLostPointerCapture={() => {
                  setPressed(false);
                }}
                onPointerDown={(e) => {
                  let { x } = e.currentTarget.getBoundingClientRect();
                  let diff = e.clientX - x;
                  pixels.set(diff);
                  setPressed(true);
                  setBounds("initial");
                }}
                onPointerMove={(e) => {
                  if (e.buttons > 0) {
                    let { x } = e.currentTarget.getBoundingClientRect();
                    let diff = e.clientX - x;
                    pixels.set(diff);

                    if (diff < 0) {
                      setBounds("left");
                    } else if (diff > SOME_WIDTH) {
                      setBounds("right");
                    } else {
                      setBounds("initial");
                    }
                  }
                }}
                className="relative flex w-full grow touch-none items-center border border-red-500 py-2 "
              >
                <motion.div
                  style={{
                    scaleX: useTransform(() => {
                      // needs original width
                      return bounds === "left"
                        ? 1 - pixelsUsed.get() / SOME_WIDTH
                        : 1 + pixelsUsed.get() / SOME_WIDTH;
                    }),

                    transformOrigin: bounds === "left" ? "right" : "left",

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
                    bounds === "right" ? pixelsUsed.get() : 0,
                  ),
                }}
              >
                <SpeakerWaveIcon className="size-5 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </MotionConfig>
      </div>

      {/* <div className="mt-2 tabular-nums text-white">{volume}</div> */}
      <div className=" text-left">
        <p className="text-white">
          Pixels:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pixelsF}
          </motion.span>
        </p>
        <p className="text-white">
          pixelsOverflow:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pixelsB}
          </motion.span>
        </p>
        <p className="text-white">
          pixelsOverflowAnimated:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pixelsC}
          </motion.span>
        </p>
        {/* <p className="text-white">
          Pixels extra:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pixelsExtra}
          </motion.span>
        </p> */}
        {/* <p className="text-white">
          Pressed:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {pressed ? "true" : "false"}
          </motion.span>
        </p> */}

        {/* <p className="text-white">
          Bounds:{" "}
          <motion.span className="mt-2 tabular-nums text-white">
            {bounds}
          </motion.span>
        </p> */}

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
