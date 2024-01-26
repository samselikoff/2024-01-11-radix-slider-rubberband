"use client";

import { useState } from "react";
import Slider from "./slider";

export default function Page() {
  let [volume, setVolume] = useState(75);

  return (
    <div className="mx-auto w-full max-w-xs">
      <div>
        <Slider value={volume} onValueChange={setVolume} />

        <p className="mt-4">The volume is {volume}</p>
      </div>
    </div>
  );
}
