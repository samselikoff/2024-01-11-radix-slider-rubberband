"use client";

import * as Slider from "@radix-ui/react-slider";
import {
  animate,
  circIn,
  circOut,
  easeIn,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";

// sigmoid function
function decay(x: number) {
  return 1 / (1 + Math.exp(-x)) - 0.5;
}

const OVERFLOW_PIXELS = 75;
const STRETCH_PERCENTAGE = 0.75;

export default function Page() {
  let pixels = useMotionValue(0);

  let overflowProgress = useTransform(pixels, [0, -OVERFLOW_PIXELS], [0, 1], {
    clamp: false,
  });
  let overflowProgressDecayed = useTransform(overflowProgress, decay);

  let scaleX = useTransform(
    overflowProgressDecayed,
    [0, 1],
    [1, 1 + STRETCH_PERCENTAGE],
    {
      clamp: false,
    },
  );
  let scaleY = useTransform(overflowProgressDecayed, [0, 1], [1, 0.75], {
    clamp: false,
  });
  let translateX = useTransform(
    overflowProgressDecayed,
    [0, 1],
    ["0%", `-${(STRETCH_PERCENTAGE * 100) / 2}%`],
    { clamp: false },
  );

  return (
    <div
      onLostPointerCaptureCapture={() => {
        animate(pixels, 0, {
          type: "spring",
          bounce: 0.75,
          duration: 2,
        });
      }}
      className="flex min-h-screen items-center justify-center bg-gray-950"
    >
      <div className="w-60">
        <div className="relative">
          <div className="~border pointer-events-none absolute inset-0 z-10"></div>
          <motion.div
            style={{
              scaleX,
              scaleY: 0.5,
              translateX,
              borderRadius: 3,
              overflow: "hidden",
            }}
            className="relative z-50"
          >
            <Slider.Root
              step={0.1}
              onPointerMove={(e) => {
                if (e.buttons > 0) {
                  // console.log(e);
                  // debugger;
                  let { x } =
                    e.currentTarget.parentElement?.parentElement.getBoundingClientRect();
                  let diff = e.clientX - x;
                  // console.log(diff);
                  // console.log("stop");
                  pixels.stop();
                  if (diff < 0) {
                    // console.log("set");
                    pixels.set(diff);
                  }
                  // if (diff < 0) {
                  //   scaleX.set(1.05);
                  //   // scale.set;
                  // } else {
                  //   scaleX.set(1);
                } else {
                  // console.log("no-buttons!");
                }
                // let diffInPixels = e.clientX - startingValues.current.x;
                // let widthInPixels = ref.current.getBoundingClientRect().width;
                // let diffInValue = diffInPixels / (widthInPixels / (max - min));
                // let newValue = startingValues.current.value + diffInValue;
                // let valueToStep = roundToStep(newValue, step);
                // let clampedValue = clamp(valueToStep, min, max);
                // updateValue(clampedValue);
                // } else {
                // console.log("here");
                // animate(pixels, 0, {
                // type: "spring",
                // bounce: 0,
                //   duration: 5000,
                // });
                // }
              }}
              // onPointerUp={() => {
              //   animate(pixels, 0, {
              //     type: "spring",
              //     bounce: 0.9,
              //     duration: 2.4,
              //   });
              // }}
              className="relative flex h-4 w-full touch-none"
            >
              <Slider.Track className="grow bg-white">
                <Slider.Range className="absolute h-full bg-sky-500" />
              </Slider.Track>
              <Slider.Thumb />
            </Slider.Root>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
