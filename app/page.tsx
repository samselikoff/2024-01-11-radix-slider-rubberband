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
function decay(x: number) {
  return 1 / (1 + Math.exp(-x)) - 0.5;
}

const MAX_PIXELS = 50;

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
      let newOverflow: number;

      if (latest < x) {
        setBounds("left");
        newOverflow = x - latest;
      } else if (latest > x + width) {
        setBounds("right");
        newOverflow = latest - x - width;
      } else {
        setBounds("initial");
        newOverflow = 0;
      }

      pixelsOverflow.set(decay(newOverflow / MAX_PIXELS) * MAX_PIXELS);
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full px-12">
        <motion.div
          whileHover="hovered"
          className="flex justify-center"
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
              <SpeakerXMarkIcon className="size-5 text-white" />
            </motion.div>

            <Slider.Root
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              ref={ref}
              onLostPointerCapture={() => {
                animate(pixelsOverflow, 0, { type: "spring", bounce: 0.5 });
              }}
              onPointerMove={(e) => {
                if (e.buttons > 0) {
                  clientX.set(e.clientX);
                }
              }}
              className="relative flex w-full grow cursor-grab touch-none select-none items-center py-4 active:cursor-grabbing"
            >
              <motion.div
                style={{
                  scaleX: useTransform(() => {
                    if (!ref.current) {
                      return 1;
                    }

                    return 1 + pixelsOverflow.get() / ref.current.clientWidth;
                  }),
                  scaleY: useTransform(() => {
                    return 1 - pixelsOverflow.get() / MAX_PIXELS;
                  }),
                  transformOrigin: useTransform(() => {
                    if (ref.current) {
                      let { x, width } = ref.current.getBoundingClientRect();
                      return clientX.get() < x + width / 2 ? "right" : "left";
                    }
                  }),
                  height: 6,
                }}
                variants={{
                  hovered: {
                    height: 16,
                    marginTop: -5,
                    marginBottom: -5,
                  },
                }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="flex grow"
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
              <SpeakerWaveIcon className="size-5 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <p className="mt-1 text-center font-medium">
        Volume: <span className="tabular-nums">{volume}</span>
      </p>
    </div>
  );
}
