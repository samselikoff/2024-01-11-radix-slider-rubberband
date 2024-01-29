# Pixels

```tsx
let pixels = useMotionValue(0);
```

```tsx
<Slider.Root
  value={[volume]}
  onValueChange={([v]) => setVolume(v)}
  onLostPointerCapture={() => {
    animate(pixels, 0, {
      type: "spring",
      bounce: 0.4,
      duration: 0.6,
    });
  }}
  onPointerMove={(e) => {
    if (e.buttons > 0) {
      let { x } = e.currentTarget.getBoundingClientRect();
      let diff = e.clientX - x;
      pixels.stop();

      if (diff < 0) {
        pixels.set(diff);
      }
    }
  }}
/>
```

## Move Icon

```tsx
<motion.div
  style={{
    translateX: iconTranslateX,
    // translateX: useTransform(style.scaleX, (v) => (v - 1) * -284),
    // scale: iconScale,
  }}
>
  <SpeakerXMarkIcon className="size-5 text-white" />
</motion.div>
```

## Stretch slider

```tsx
<motion.div
  style={{
    scaleX: useTransform(pixels, (p) => 1 + -p / 256),
    // scaleX: pixels,
    transformOrigin: "right",
  }}
  // style={{ scale: 1 + 30 / 256, transformOrigin: "right" }}
  className="relative flex h-full grow"
>
  <Slider.Track />
</motion.div>
```

## Decay

Linear:

```tsx
let pixelsDecayed = useTransform(
  pixels,
  [0, -MAX_PIXELS],
  [0, -MAX_PIXELS / 5],
);
```

Sigmoid:
