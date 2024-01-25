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
import { useEffect, useState } from "react";

// Sigmoid function. Output is between 0 and 1.
function decay(x: number) {
  return 1 / (1 + Math.exp(-x)) - 0.5;
}

const MAX_PIXELS = 100;
const STRETCH_PERCENTAGE = 0.2;

export default function Page() {
  let pixels = useMotionValue(0);
  let pixelsSync = useMotionValue(0);
  let pixelsDecayed = useTransform(
    pixels,
    [0, -MAX_PIXELS],
    [0, -MAX_PIXELS / 5],
  );
  // let pixelsDecayed = useSpring(pixels);
  // let pixelsDecayed = useTransform(pixels, (p) => {
  //   return decay(p / MAX_PIXELS) * MAX_PIXELS;
  // });
  // let pixelsProgress = useTransform(pixels, [0, -MAX_PIXELS], [0, 1], {
  //   clamp: false,
  // });
  // let pixelsProgressDecayed = useTransform(pixelsProgress, decay);
  // let pixelsProgressDecayed = useTransform(pixels, (p) => {
  //   return decay(p / MAX_PIXELS) * MAX_PIXELS;
  // });
  // let iconScaleAnimated = useSpring(iconScale, {
  //   bounce: 0.5,
  //   duration: 400,
  // });
  let [volume, setVolume] = useState(50);
  // let iconTranslateX = pixels;
  // let iconTranslateX = pixelsProgressDecayed;
  // let iconTranslateX = useTransform(pixels, (v) => {
  //   let f = exponentialDecay(0, v, 0);
  //   console.log(v, f);
  //   return f;
  // });
  // let iconTranslateX = useTransform(pixels, (v) => v / 5);
  // let iconTranslateX = useTransform(pixels, decay);

  // let overflowProgress = useTransform(pixels, [0, -MAX_PIXELS], [0, 1], {
  //   clamp: false,
  // });
  // let overflowProgressDecayed = useTransform(pixels, (v) => -v);
  // let overflowProgressDecayed = useTransform(overflowProgress, decay);
  // let overflowProgressDecayed = useTransform(pixels, (v) => -decay(v));

  // let style = {
  //   scaleX: useTransform(
  //     overflowProgressDecayed,
  //     [0, 1],
  //     [1, 1 + STRETCH_PERCENTAGE],
  //     {
  //       clamp: false,
  //     },
  //   ),
  //   scaleY: useTransform(overflowProgressDecayed, [0, 1], [1, 0.75], {
  //     clamp: false,
  //   }),
  //   translateX: useTransform(
  //     overflowProgressDecayed,
  //     [0, 1],
  //     ["0%", `-${(STRETCH_PERCENTAGE * 100) / 2}%`],
  //     { clamp: false },
  //   ),
  // };
  let iconScale = useMotionValue(1);

  useMotionValueEvent(pixelsSync, "change", (v) => {
    if (pixelsSync.getPrevious() >= 0 && v < 0) {
      // console.log("trigger!");
      animate(iconScale, [1, 1.4, 1], {
        // type: "spring",
        // type: "spring",
        // duration: 9,
        // bounce: 0.5,
        ease: "easeInOut",
        duration: 0.3,
      });
    }
  });

  // useEffect(() => {
  //   pixels.on("change", (v) => {
  //     let prev = pixels.getPrevious();
  //     if (prev >= 0 && v < 0) {
  //       console.log(prev, v);
  //       console.log("trigger!");
  //     }
  //   });
  // });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <div className="w-full max-w-xs">
        <div className="flex items-center gap-3">
          <motion.div
            // variants={{
            //   normal: { scale: 1 },
            //   pop: { scale: [1, 1.5, 1] },
            // }}
            // animate={something}
            style={{
              translateX: pixelsDecayed,
              // translateX: useTransform(style.scaleX, (v) => (v - 1) * -284),
              // scale: [1, 1.5, 1],
              scale: iconScale,
            }}
          >
            <SpeakerXMarkIcon className="size-5 text-white" />
          </motion.div>
          <Slider.Root
            value={[volume]}
            onValueChange={([v]) => setVolume(v)}
            // step={0.1}
            onLostPointerCapture={() => {
              // console.log("here?");
              pixelsSync.set(0);
              animate(pixels, 0, {
                type: "spring",
                bounce: 0.4,
                duration: 0.6,
              });
              // iconScale.set(1);
            }}
            onPointerMove={(e) => {
              if (e.buttons > 0) {
                let { x } = e.currentTarget.getBoundingClientRect();
                let diff = e.clientX - x;
                pixels.stop();

                // if (diff < 0) {
                pixels.set(diff);
                pixelsSync.set(diff);
                // }
              }
            }}
            className="relative flex h-3 w-full grow touch-none items-center "
          >
            {/* <motion.div style={style} className="relative flex h-full grow"> */}
            <motion.div
              style={{
                scaleX: useTransform(pixelsDecayed, (p) => 1 + -p / 256),
                // scaleX: "calc(100% + 10px)",
                // scaleX: pixels,
                transformOrigin: "right",
              }}
              // style={{ scale: 1 + 30 / 256, transformOrigin: "right" }}
              className="relative flex h-full grow"
            >
              <Slider.Track className="relative h-full grow overflow-hidden rounded-full bg-white">
                <Slider.Range className="absolute h-full bg-sky-500" />
              </Slider.Track>
            </motion.div>
            <Slider.Thumb />
          </Slider.Root>
          <div>
            <SpeakerWaveIcon className="size-5 text-white" />
          </div>
        </div>
      </div>

      <div className="mt-2 tabular-nums text-white">{volume}</div>
      {/* <motion.div className="mt-2 tabular-nums text-white">{pixels}</motion.div>
      <motion.div className="mt-2 tabular-nums text-white">
        {pixelsSync}
      </motion.div> */}
      {/* <motion.div className="mt-2 tabular-nums text-white">{pixels}</motion.div>
      <motion.div className="mt-2 tabular-nums text-white">
        {pixelsDecayed}
      </motion.div> */}
    </div>
  );
}
