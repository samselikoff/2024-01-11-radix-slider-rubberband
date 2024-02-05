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

# 7: Refactor xLeft and xRight to x using region

Let's take a look at what we have. Let's add `region` to debug:

```tsx
<div>region: {region}</div>
```

xLeft and xRight are never used at the same time. so let's see if we clean this up and bring back an single x MV.

```tsx
let x = useMotionValue(0);
```

and add to debugger.

and set it in the change event:

```tsx
useMotionValueEvent(position, "change", (latestValue) => {
  if (latestValue < 0) {
    setRegion("left");
    xLeft.set(latestValue);
    x.set(latestValue);
  } else if (latestValue > 320) {
    setRegion("right");
    xRight.set(latestValue - 320);
    x.set(latestValue - 320);
  } else {
    setRegion("middle");
    xLeft.set(0);
    xRight.set(0);
    x.set(0);
  }
});
```

Now if we change the left icon from `xLeft` to use `x`:

```tsx
<motion.div style={{ x: x }} />
```

it tracks it – but also moves when we drag right.

Let's use `region` so it only moves when in the left:

```tsx
<motion.div style={{ x: region === "left" ? x : 0 }} />
```

Boom! Same right right.

```tsx
<motion.div style={{ x: region === "right" ? x : 0 }} />
```

Nice. Now on release need to animate x.

```tsx
onLostPointerCapture={() => {
  animate(xLeft, 0, { type: "spring", bounce: 0.5 });
  animate(xRight, 0, { type: "spring", bounce: 0.5 });
  animate(x, 0, { type: "spring", bounce: 0.5 });
}}
```

Awesome.

And now in the bar we can replace xLeft and xRight with x:

```tsx
scaleX: useTransform(() => {
  return region === "left"
    ? (320 - x.get()) / 320
    : (320 + x.get()) / 320;
}),
```

Sick. Delete xLeft/xRight, show x in debug. All working.

This region state is nice and easy, and everything still works when we let go.

# 8: Refactor magic number (width)

Right now 320 hard coded - change `max-w-sm` to `max-w-xs` and it breaks.

Where does it come from? Width of slider element. So let's get a ref.

```tsx
let ref = useRef<ElementRef<typeof Slider.Root>>(null);

<Slider.Root ref={ref} />;
```

Update our change event

```tsx
useMotionValueEvent(position, "change", (latestValue) => {
  if (ref.current) {
    let bounds = ref.current.getBoundingClientRect();

    if (latestValue < 0) {
      setRegion("left");
      x.set(latestValue);
    } else if (latestValue > bounds.width) {
      setRegion("right");
      x.set(latestValue - bounds.width);
    } else {
      setRegion("middle");
      x.set(0);
    }
  }
});
```

And the scale:

```tsx
<motion.div
  style={{
    scaleX: useTransform(() => {
      if (ref.current) {
        let { width } = ref.current.getBoundingClientRect();

        return region === "left"
          ? (width - x.get()) / width
          : (width + x.get()) / width;
      }
    }),
    transformOrigin: region === "left" ? "right" : "left",
  }}
/>
```

Sweet! No more magic number, works for max-w-xs.

Let's clean this up a bit more.

We're using bounds to set position, then also using it in change listener to calculate x. Logic is split.

Let's simplify pointermove to just set clientX:

```tsx
onPointerMove={(e) => {
  if (e.buttons > 0) {
    clientX.set(e.clientX);
  }
}}
```

```tsx
useMotionValueEvent(clientX, "change", (latestValue) => {
  if (ref.current) {
    let { left, right } = ref.current.getBoundingClientRect();

    if (latestValue < left) {
      setRegion("left");
      x.set(latestValue - left);
    } else if (latestValue > right) {
      setRegion("right");
      x.set(latestValue - right);
    } else {
      setRegion("middle");
      x.set(0);
    }
  }
});
```

Nice!

Now let's look at scale:

```tsx
scaleX: useTransform(() => {
  if (ref.current) {
    let bounds = ref.current.getBoundingClientRect();

    return region === "left"
      ? (bounds.width - x.get()) / bounds.width
      : (bounds.width + x.get()) / bounds.width;
  }
```

`x` is not the best name – originally used because the icons move by x. Let's rename it to `overflow`.

Now overflow is negative when region is left, positive when region is right, so this scale code has to add or subtract based on that. Let's make overflow a pure magnitude - so when left, swap these:

```tsx
setRegion("left");
overflow.set(left - latestValue);
```

Positive now. Fix left icon:

```tsx
<motion.div
  style={{
    x: useTransform(() => (region === "left" ? -overflow.get() : 0)),
  }}
/>
```

and now can simplify scaleX:

```tsx
scaleX: useTransform(() => {
  if (ref.current) {
    let { width } = ref.current.getBoundingClientRect();

    return (width + overflow.get()) / width;
  }
}),
```

or more simply, 100% + the overflow:

```tsx
return 1 + overflow.get() / width;
```

## QUESTION FOR RYAN

stop?

```tsx
onPointerMove={(e) => {
  if (e.buttons > 0) {
    overflow.stop();
    clientX.set(e.clientX);
  }
}}
```

# 9: Decay

Let's decay this stretching a bit. Could do something simple:

```tsx
overflow.set((left - latestValue) / 3);
```

but that's linear. Let's use something that decays more the farther we drag.

```tsx
// Sigmoid-based decay function
// https://en.wikipedia.org/wiki/Sigmoid_function
function decay(value: number, max: number) {
  let entry = value / max;
  let sigmoid = 2 / (1 + Math.exp(-entry)) - 1;

  return sigmoid * max;
}
```

decay maps [0, 1] to [0, 1]. So pick a max pixels and convert to fraction:

```tsx
let newValue = left - latestValue;
overflow.set(decay(newValue, 50));
```

Awesome! Let's cover all branches.

```tsx
let { left, right } = ref.current.getBoundingClientRect();
let newValue;

if (latestValue < left) {
  setRegion("left");
  newValue = left - latestValue;
} else if (latestValue > right) {
  setRegion("right");
  newValue = latestValue - right;
} else {
  setRegion("middle");
  newValue = 0;
}

overflow.set(decay(newValue, 75));
```

# 10: Grow on hover

Let's add a hover on grow effect.

```tsx
<motion.div
  whileHover={{ scale: 1.1 }}
  transition={{
    type: "spring",
    bounce: 0,
    duration: 0.4,
  }}
  className="flex w-full max-w-sm items-center gap-3"
/>
```

Can see something's off... remove decay().

Our icons are scaled but moving by pixels. need to account for scale.

Another motion value:

```tsx
let scale = useMotionValue(1);
```

Refactor to use:

```tsx
<motion.div
  onHoverStart={() =>
    animate(scale, 1.2, { type: "spring", bounce: 0, duration: 0.4 })
  }
  onHoverEnd={() =>
    animate(scale, 1, { type: "spring", bounce: 0, duration: 0.4 })
  }
  style={{ scale }}
/>
```

Now update icons `x` to account for scale:

```tsx
<motion.div
  style={{
    x: useTransform(() =>
      region === "left" ? -overflow.get() / scale.get() : 0,
    ),
  }}
/>
```

```tsx
<motion.div
  style={{
    x: useTransform(() =>
      region === "right" ? overflow.get() / scale.get() : 0,
    ),
  }}
/>
```

Lets also animate height of slider with some transforms:

```tsx
<motion.div
  style={{
    transformOrigin: region === "left" ? "right" : "left",
    scaleX: useTransform(() => {
      if (ref.current) {
        return 1 + overflow.get() / ref.current.getBoundingClientRect().width;
      }
    }),
    height: useTransform(scale, [1, 1.2], [6, 16]),
  }}
/>
```

Account for layout shift with margin:

```tsx
marginTop: useTransform(scale, [1, 1.2], [0, -5]),
marginBottom: useTransform(scale, [1, 1.2], [0, -5]),
```

Another, scaleY:

```tsx
scaleY: useTransform(() => 1 - overflow.get() / MAX_PIXELS),
```

And why not opacity:

```tsx
<motion.div
  style={{ scale, opacity: useTransform(scale, [1, 1.2], [0.8, 1]) }}
  className="flex w-full items-center gap-3 px-60"
/>
```

# 11: Bounce icons

Final piece of polish. When we overflow left let's bounce this icon:

```tsx
<motion.div
  animate={{
    scale: region === "left" ? [1, 1.4, 1] : 1,
    transition: { duration: 0.25 },
  }}
/>
```

Done!! Uncomment state.
