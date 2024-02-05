"use client";

import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/20/solid";
import * as RadixSlider from "@radix-ui/react-slider";
import { useState } from "react";

export default function Slider({
  value = 50,
  onValueChange = () => {},
  name,
  min = 0,
  max = 100,
  step = 1,
}: {
  value?: number;
  onValueChange?: (value: number) => void;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  let [isUsingPointer, setIsUsingPointer] = useState(false);
  let [internalValue, setInternalValue] = useState(value);
  let [stash, setStash] = useState({ clientX: 0, internalValue });

  function updateValue(v: number) {
    setInternalValue(v);
    onValueChange(v);
  }

  return (
    <div className="group flex touch-none select-none items-center gap-3 transition-[margin] duration-[350ms] *:duration-[350ms] hover:-mx-3 hover:cursor-grab active:cursor-grabbing ">
      <SpeakerXMarkIcon className="size-5 transition group-hover:scale-125 group-hover:text-white" />
      <RadixSlider.Root
        value={[internalValue]}
        onValueCommit={([v]) => {
          updateValue(v);
        }}
        min={min}
        max={max}
        step={step}
        defaultValue={[50]}
        className="relative flex h-1.5 grow items-center transition-[height] group-hover:h-4"
        name={name}
        onPointerDown={(e) => {
          setStash({
            clientX: e.clientX,
            internalValue,
          });
          setIsUsingPointer(true);
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0) {
            let diffInPixels = e.clientX - stash.clientX;
            let sliderWidth = e.currentTarget.clientWidth;
            let pixelsPerUnit = (max - min) / sliderWidth;
            let diffInUnits = diffInPixels * pixelsPerUnit;
            let newValue = stash.internalValue + diffInUnits;
            let clampedValue = clamp(newValue, min, max);
            let steppedValue = roundToStep(clampedValue, step);

            updateValue(steppedValue);
          }
        }}
        onBlur={() => setIsUsingPointer(false)}
      >
        <RadixSlider.Track
          className={`${
            isUsingPointer
              ? ""
              : "group-has-[:focus-visible]:outline group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-2 group-has-[:focus-visible]:outline-sky-500"
          } relative h-full grow overflow-hidden rounded-full bg-gray-700`}
        >
          <RadixSlider.Range className="absolute h-full bg-gray-300 transition group-hover:bg-white">
            <div className="absolute inset-0 group-has-[:focus-visible]:bg-white" />
          </RadixSlider.Range>
        </RadixSlider.Track>
        <RadixSlider.Thumb />
      </RadixSlider.Root>
      <SpeakerWaveIcon className="size-5 transition group-hover:scale-125 group-hover:text-white" />
    </div>
  );
}

function clamp(number: number, min: number, max: number) {
  return Math.min(max, Math.max(number, min));
}

function roundToStep(num: number, step: number) {
  const inverseStep = 1 / step;
  return Math.round(num * inverseStep) / inverseStep;
}
