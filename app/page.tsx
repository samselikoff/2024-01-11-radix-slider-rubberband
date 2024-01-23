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

// function decay(x) {
//   return -Math.exp(Math.abs(x)) + 1;
// }

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x)) - 0.5;
}

export default function Page() {
  let pixels = useMotionValue(0);
  // let scaleX = useMotionValue(1);
  // let pixels = useSpring(pixelsRaw, { damping: 30, mass: 1, stiffness: 500 });

  let overflowAmount = 0.75;
  let overflowPixels = 75;

  let overflowR = useTransform(pixels, [0, -overflowPixels], [0, 1], {
    clamp: false,
  });
  let overflow = useTransform(overflowR, sigmoid);

  let scaleX = useTransform(overflow, [0, 1], [1, 1 + overflowAmount], {
    clamp: false,
  });
  let scaleY = useTransform(overflow, [0, 1], [1, 0.75], { clamp: false });
  let translateX = useTransform(
    overflow,
    [0, 1],
    ["0%", `-${(overflowAmount * 100) / 2}%`],
    { clamp: false },
  );

  // useEffect(() => {
  //   overflowR.on("change", (v) => {
  //     console.log(v, overflow.get());
  //   });
  // });

  // old
  // let scaleX = useTransform(pixels, [0, -100], [100, 130]);
  // let marginLeftRaw = useTransform(pixels, [0, -100], [0, -30]);
  // let xRaw = useTransform(scaleX, (v) => (v - 1) * 100);
  // let width = useMotionTemplate`${scaleX}%`;
  // let x = useMotionTemplate`${xRaw}%`;
  // let marginLeft = useMotionTemplate`${marginLeftRaw}%`;

  return (
    <div
      onLostPointerCaptureCapture={() => {
        console.log("onlost - root div!");
        animate(pixels, 0, {
          type: "spring",
          bounce: 0.75,
          duration: 2,
        });
      }}
      // onPointerUp={() => {
      //   console.log("onpointerup - root div!");
      //   animate(pixels, 0, {
      //     type: "spring",
      //     bounce: 0,
      //     duration: 0.2,
      //   });
      // }}
      className="flex min-h-screen items-center justify-center bg-gray-950"
    >
      <div className="w-60">
        <div className="relative">
          <div className="~border border-black~ pointer-events-none absolute inset-0 z-10"></div>
          {/* <motion.div style={{ width, marginLeft }}> */}
          {/* <motion.div style={{ scaleX }}> */}
          <motion.div
            style={{
              scaleX,
              scaleY,
              translateX,
              borderRadius: 9999,
              overflow: "hidden",
            }}
            className="relative z-50"
          >
            {/* <motion.div style={{ scaleX: 1.5, translateX: "-25%" }}> */}
            <Slider.Root
              step={0.1}
              onPointerDown={() => {
                // pixels.stop();
              }}
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
