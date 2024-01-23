"use client";

import * as Slider from "@radix-ui/react-slider";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ElementRef, useRef } from "react";

// sigmoid function
function decay(x: number) {
  return 1 / (1 + Math.exp(-x)) - 0.5;
}

const OVERFLOW_PIXELS = 50;
const STRETCH_PERCENTAGE = 0.2;

export default function Page() {
  let pixels = useMotionValue(0);

  let overflowProgress = useTransform(pixels, [0, -OVERFLOW_PIXELS], [0, 1], {
    clamp: false,
  });
  let overflowProgressDecayed = useTransform(overflowProgress, decay);

  let style = {
    scaleX: useTransform(
      overflowProgressDecayed,
      [0, 1],
      [1, 1 + STRETCH_PERCENTAGE],
      {
        clamp: false,
      },
    ),
    scaleY: useTransform(overflowProgressDecayed, [0, 1], [1, 0.75], {
      clamp: false,
    }),
    translateX: useTransform(
      overflowProgressDecayed,
      [0, 1],
      ["0%", `-${(STRETCH_PERCENTAGE * 100) / 2}%`],
      { clamp: false },
    ),
  };

  let containerRef = useRef<ElementRef<"div">>(null);

  return (
    <div
      onLostPointerCaptureCapture={() => {
        animate(pixels, 0, {
          type: "spring",
          bounce: 0.4,
          duration: 0.6,
        });
      }}
      className="flex min-h-screen items-center justify-center bg-gray-950"
    >
      <div className="w-full max-w-xs">
        <div ref={containerRef}>
          <Slider.Root
            step={0.1}
            onPointerMove={(e) => {
              if (e.buttons > 0 && containerRef.current) {
                let { x } = containerRef.current.getBoundingClientRect();
                let diff = e.clientX - x;

                pixels.stop();

                if (diff < 0) {
                  pixels.set(diff);
                }
              }
            }}
            className="relative flex h-4 w-full touch-none items-center"
          >
            <motion.div style={style} className="relative flex h-full grow">
              <Slider.Track className="relative h-full grow overflow-hidden rounded-full bg-white">
                <Slider.Range className="absolute h-full bg-sky-500" />
              </Slider.Track>
            </motion.div>

            <Slider.Thumb />
          </Slider.Root>
        </div>
      </div>
    </div>
  );
}
