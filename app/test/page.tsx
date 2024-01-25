"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function Page() {
  return (
    <motion.div
      whileHover={{ "--height": 2 }}
      style={{ "--height": 1 }}
      className="m-20 hover:bg-gray-200"
    >
      <motion.div
        style={{ scale: "var(--height)" }}
        // transition={{ duration: 2 }}
        className="h-20 w-20 bg-green-500"
      />
    </motion.div>
  );
}
