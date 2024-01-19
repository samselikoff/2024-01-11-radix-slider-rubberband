"use client";

import * as Slider from "@radix-ui/react-slider";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

export default function Page() {
  let pixels = useMotionValue(0);
  // let scaleX = useMotionValue(1);
  // let pixels = useSpring(pixelsRaw, { damping: 30, mass: 1, stiffness: 500 });
  let scaleX = useTransform(pixels, [0, -100], [100, 130]);
  let marginLeftRaw = useTransform(pixels, [0, -100], [0, -30]);
  // let scaleX = useSpring(scaleXRaw, { mass: 1, stiffness: 100 });
  let xRaw = useTransform(scaleX, (v) => (v - 1) * 100);
  let width = useMotionTemplate`${scaleX}%`;
  let x = useMotionTemplate`${xRaw}%`;
  let marginLeft = useMotionTemplate`${marginLeftRaw}%`;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-80">
        <motion.div>
          <motion.div style={{ width, marginLeft }}>
            <Slider.Root
              onPointerMove={(e) => {
                if (e.buttons > 0) {
                  let { x } = e.currentTarget.getBoundingClientRect();
                  let diff = e.clientX - x;
                  console.log(diff);
                  pixels.stop();
                  pixels.set(diff);
                  // if (diff < 0) {
                  //   scaleX.set(1.05);
                  //   // scale.set;
                  // } else {
                  //   scaleX.set(1);
                  // }
                  // let diffInPixels = e.clientX - startingValues.current.x;
                  // let widthInPixels = ref.current.getBoundingClientRect().width;
                  // let diffInValue = diffInPixels / (widthInPixels / (max - min));
                  // let newValue = startingValues.current.value + diffInValue;
                  // let valueToStep = roundToStep(newValue, step);
                  // let clampedValue = clamp(valueToStep, min, max);
                  // updateValue(clampedValue);
                } else {
                  // console.log("here");
                  animate(pixels, 0, {
                    type: "spring",
                    bounce: 0,
                    duration: 0.5,
                  });
                }
              }}
              onPointerUp={() => {
                // pixels.set(0);
                console.log("h");
                animate(pixels, 0, {
                  type: "spring",
                  bounce: 0,
                  duration: 0.5,
                });
              }}
              className="flex relative w-full h-4"
            >
              <Slider.Track className="bg-gray-400 grow">
                <Slider.Range className="bg-gray-800 absolute h-full" />
              </Slider.Track>
              <Slider.Thumb />
            </Slider.Root>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
