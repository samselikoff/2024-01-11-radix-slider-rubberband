"use client";

import * as Slider from "@radix-ui/react-slider";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

// sigmoid function
function decay(x: number) {
  return 1 / (1 + Math.exp(-x)) - 0.5;
}

const OVERFLOW_PIXELS = 75;
const STRETCH_PERCENTAGE = 1;

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
          <motion.div
            style={{
              scaleX,
              scaleY,
              translateX,
            }}
            className="relative z-50 overflow-hidden rounded-full"
          >
            <Slider.Root
              step={0.1}
              onPointerMove={(e) => {
                if (e.buttons > 0) {
                  let { x } =
                    e.currentTarget.parentElement?.parentElement.getBoundingClientRect();
                  let diff = e.clientX - x;
                  pixels.stop();
                  if (diff < 0) {
                    pixels.set(diff);
                  }
                }
              }}
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
