# 1: Move icon

To start want icon to move with mouse.

How to move icon? Turn into motion.div and set x:

```tsx
<motion.div style={{ x: -20 }}>
  <SpeakerXMarkIcon className="size-5 text-white" />
</motion.div>
```

Can make this a variable:

```tsx
let x = useMotionValue(20);

<motion.div style={{ x }}>
```

```tsx
onPointerMove={(e) => {
  if (e.buttons > 0) {
    let bounds = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - bounds.x);
  }
}}
```

# 2: Only want negative overflow

```tsx
onPointerMove={(e) => {
  if (e.buttons > 0) {
    let bounds = e.currentTarget.getBoundingClientRect();
    let overflow = e.clientX - bounds.x;

    if (overflow <= 0) {
      x.set(overflow);
    }
  }
}}
```

Works – but can get "stuck". Reset to 0.

```tsx
if (overflow <= 0) {
  x.set(overflow);
} else {
  x.set(0);
}
```

Nice!

# 3: Letting go

When let go, should go back to 0.

```tsx
onPointerUp={() => {
  x.set(0);
}}
```

Cool! But flaky (move fast). Use lostpointercapture instead:

```tsx
onLostPointerCapture={() => {
  x.set(0);
}}
```

Nice! Dont want instant tho, want to animate:

```tsx
onLostPointerCapture={() => {
  animate(x, 0);
}}
```

Make it cooler, accepts normal transition options

```tsx
onLostPointerCapture={() => {
  animate(x, 0, {type: 'spring', bounce: .5});
}}
```

Nice!

# 4: Stretch bar

How do we grow bar? Turn wrapping div into motion, use scaleX helper

```tsx
<motion.div style={{ scaleX: 1.1 }} className="flex h-1.5 grow" />
```

Grows but in both direction. Set anchor point to right with tOrigin:

```tsx
<motion.div
  style={{ scaleX: 1.1, transformOrigin: "right" }}
  className="flex h-1.5 grow"
/>
```

Now it grows to the left! So how much should it grow? Well x is -50 so want an extra 50 pixels. But we can't set scale in terms of pixels, scale has to be a percentage.

How to find out? Width is 320, want extra 50, so 370 / 320.

Want it dynamic, useTransform:

```tsx
style={{
  // scaleX: 370 / 320,
  scaleX: useTransform(() => {
    return (320 - x.get()) / 320;
  }),
  transformOrigin: "right",
}}
```

Now bar tracks the icon – even when we let go and animate it!! so cool.

# New 5: Animate Right icon

Debug to get a sense

```tsx
<div>
  X: <motion.span>{useTransform(() => Math.floor(x.get()))}</motion.span>
</div>
```

X stops at 0 but need to track position over rest of slider. Let's make a new MV:

```tsx
let position = useMotionValue(0);
```

and update it all the time:

```tsx
position.set(overflow);
```

and also debug it:

```tsx
<div>
  positiion:{" "}
  <motion.span>{useTransform(() => Math.floor(position.get()))}</motion.span>
</div>
```

Cool, tracks mouse along whole way! So if we express x as a function of position on the left side, we should be able to get the right side working too.

So if we look, when position is negative, x tracks it. So x is derived... excpet when we let go. Doesn't track.

So we want x to track position sometimes, but we also want to be able to animate it other times. So let's use a hook from FM called useMotionValueEvent to respond to changes in position.

```tsx
useMotionValueEvent(position, "change", (latest) => {
  if (latest < 0) {
    x.set(latest);
  } else {
    x.set(0);
  }
});
```

Look at that – when position is negative x tracks, but x is also its own motionvalue so we can animate.

Let's do the same thing for the right.

```tsx
useMotionValueEvent(position, "change", (latest) => {
  if (latest < 0) {
    xLeft.set(latest);
  } else if (latest > 320) {
    xRight.set(latest - 320);
  } else {
    xLeft.set(0);
    xRight.set(0);
  }
});
```

Last thing to do is grow right.

# 5: Animate Right icon

Debug to get a sense

```tsx
<div>
  X: <motion.span>{useTransform(() => Math.floor(x.get()))}</motion.span>
</div>
```

Want a new one

```tsx
let xLeft = useMotionValue(0);
let xRight = useMotionValue(0);
```

```tsx
<motion.p>{useTransform(() => Math.floor(xLeft.get()))}</motion.p>
<motion.p>{useTransform(() => Math.floor(xRight.get()))}</motion.p>
```

Now add condition:

```tsx
if (overflow <= 0) {
  xLeft.set(overflow);
} else if (overflow >= 320) {
  xRight.set(overflow - 320);
} else {
  xLeft.set(0);
  xRight.set(0);
}
```

And reset on release:

```tsx
onLostPointerCapture={() => {
  animate(xLeft, 0, { type: "spring", bounce: 0.5 });
  animate(xRight, 0, { type: "spring", bounce: 0.5 });
}}
```

Sweet!

# 6: Grow bar right

Current for left:

```tsx
return (320 - xLeft.get()) / 320;
```

For right logic is reverse:

```tsx
return (320 + xRight.get()) / 320;
```

Also need transformOrigin left. Cool right side works!

So let's make dynamic. If dragging to left xRight is 0.

```tsx
scaleX: useTransform(() => {
  return xRight.get() === 0
    ? (320 - xLeft.get()) / 320
    : (320 + xRight.get()) / 320;
}),
transformOrigin: useTransform(() => {
  return xRight.get() === 0 ? "right" : "left";
}),
```
