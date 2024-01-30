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

    if (overflow < 0) {
      x.set(overflow);
    }
  }
}}
```

Works – but can get "stuck". Reset to 0.

```tsx
if (overflow < 0) {
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

# 5: Animate Right icon

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

Cool, tracks mouse along whole way!

So, if we can rewrite `x` so that it's derived from `position` on the left side, we should be able to get the right side working too.

And it looks pretty straightforward: when `position` is negative, `x` tracks it; and when `position` is positive, `x` is 0.

...except when we let go. When we let go, we actually want to animate `x` independent of `position`.

So, `x` is not purely derived from `position`, but it should track its changes when `position` is negative. And Framer Motion has a Hook that's perfect for this: it's called `useMotionValueEvent`:

```tsx
useMotionValueEvent(position, "change", (latestValue) => {
  console.log(latestValue);
});
```

and we'll see that every time it changes, we'll see that event callback being fired.

So let's grab the code from the pointermove callback that's updating `x` and save, so now pointermove is only updating `position`, and paste it in the change event handler:

```tsx
useMotionValueEvent(position, "change", (latestValue) => {
  if (latestValue <= 0) {
    x.set(latestValue);
  } else {
    x.set(0);
  }
});
```

and now `x` updates whenever `position` changes, but if we let go, we can still animate it!

And now that `x` is expressed in terms of `position` on the left, we should be able to do the same thing for the right.

Let's rename `x` to `xLeft` and make a new MV `xRight`. Debug it.

What should the logic be? Once its past 320 - the width! - xRight should start tracking it. Otherwise reset to 0.

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

Nice! Now when we let go, let's also animate it:

```tsx
onLostPointerCapture={() => {
  animate(xLeft, 0, { type: "spring", bounce: 0.5, });
  animate(xRight, 0, { type: "spring", bounce: 0.5, });
}}
```

Sweet!

Now let's make the bar stretch right.

# 6: Stretch bar right

Should just be the opposite of left. Comment it out and reverse:

```tsx
<motion.div
  style={{
    scaleX: useTransform(() => {
      return (320 + xRight.get()) / 320;
    }),
    transformOrigin: "left",
  }}
  // style={{
  //   scaleX: useTransform(() => {
  //     return (320 - xLeft.get()) / 320;
  //   }),
  //   transformOrigin: "right",
  // }}
  className="flex h-1.5 grow"
/>
```

Works - and animates! So cool.

So, we need to know if we're dragging past the left or the right so we can switch this logic. How can we know?

Let's add some state!

```tsx
let [region, setRegion] = useState("middle");
```

and set it in our change event:

```tsx
useMotionValueEvent(position, "change", (latestValue) => {
  if (latestValue < 0) {
    setRegion("left");
    xLeft.set(latestValue);
  } else if (latestValue > 320) {
    setRegion("right");
    xRight.set(latestValue - 320);
  } else {
    setRegion("middle");
    xLeft.set(0);
    xRight.set(0);
  }
});
```

Now use it in style:

```tsx
<motion.div
  style={{
    scaleX: useTransform(() => {
      return region === "left"
        ? (320 - xLeft.get()) / 320
        : (320 + xRight.get()) / 320;
    }),
    transformOrigin: region === "left" ? "right" : "left",
  }}
  className="flex h-1.5 grow"
/>
```

It works!
