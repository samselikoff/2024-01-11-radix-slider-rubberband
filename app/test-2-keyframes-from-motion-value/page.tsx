"use client";

import { animate, motion, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  let scaleMv = useMotionValue(1);

  useEffect(() => {
    let id = setInterval(() => {
      let newValue = scaleMv.get() === 1 ? 2 : 1;
      animate(scaleMv, [1, 2, 3, 1]);
    }, 1000);

    return () => clearInterval(id);
  }, [scaleMv]);

  return (
    <motion.div style={{ scale: scaleMv }} className="size-20 bg-green-500" />
  );

  // This works
  // let [scale, setScale] = useState(1);

  // useEffect(() => {
  //   let id = setInterval(() => {
  //     setScale(scale === 1 ? 2 : 1);
  //   }, 1000);

  //   return () => clearInterval(id);
  // }, [scale]);

  // return <motion.div animate={{ scale }} className="size-20 bg-green-500" />;
}
