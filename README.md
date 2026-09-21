# Game Lab 01 — Spaceflight simulation

This project is a small vanilla JS arcade prototype built with Vite. The game loop uses a fixed 60 Hz simulation step with interpolation for rendering, and the ship moves inside a wrap-around arena.

## What is implemented

- Fixed-step game loop with `requestAnimationFrame`
- Interpolated render pass
- Clean physics function `integrate(ship, input, dt)`
- Keyboard input captured by closure-based `createInput()`
- HUD with `steps/s`, `frames/s`, and frame time
- Canvas scaling for `devicePixelRatio`
- Wrap-around arena edges

## Why the loop is stable

The simulation updates at a constant rate:

- step = 1 / 60 = 0.016666... s
- maximum simulation rate = 60 steps/s
- rendering happens at the browser refresh rate, usually 60 FPS or 120 FPS

The loop accumulates elapsed time and executes the simulation in a while loop while the accumulator is greater than or equal to the step:

```js
accumulator += delta;
while (accumulator >= step) {
  update(step);
  accumulator -= step;
}
const alpha = accumulator / step;
render(alpha, frameTime);
```

This design prevents the physics from drifting when the monitor refresh rate changes.

## What `createLoop()` is doing

The central idea is: the simulation should run in a fixed logical time, but the browser only tells us when a frame is about to be painted. That is why the loop uses an accumulator.

```js
export function createLoop({ update, render, step = 1 / 60 }) {
  let accumulator = 0;
  let previousFrameTime = 0;

  function tick(timestamp) {
    if (!previousFrameTime) {
      previousFrameTime = timestamp;
    }

    const delta = Math.min((timestamp - previousFrameTime) / 1000, 0.25);
    previousFrameTime = timestamp;

    accumulator += delta;

    while (accumulator >= step) {
      update(step);
      accumulator -= step;
    }

    const alpha = accumulator / step;
    render(alpha, delta * 1000);

    requestAnimationFrame(tick);
  }
}
```

### Why `accumulator` matters

`requestAnimationFrame` gives us a timestamp at each paint. The difference between the current timestamp and the previous one is the real elapsed time since the last frame.

If the browser runs at 60Hz, then `delta` is roughly `0.0167` seconds. If it runs at 144Hz, it is smaller. In both cases, the simulation should still advance by a fixed step of `1/60` seconds, not by the monitor cadence.

So we do this:

- accumulate all time that passed since the last simulation step,
- while there is enough accumulated time, run `update(step)`,
- keep the remainder as a fractional time for interpolation.

That is how the game stays deterministic and stable despite different displays.

### Why interpolation is needed

The render step runs between simulation steps. For example, if the physics update occurred at `t = 0.000` and the next one is at `t = 0.0167`, but the browser paints at `t = 0.012`, we need to draw the ship in a position between the previous and the next state.

This is what the `alpha` value does:

```js
const x = ship.prevX + (ship.x - ship.prevX) * alpha;
```

It is a linear interpolation between the last simulated state and the current one. The result is smoother motion and less jitter.

### Why not just `setInterval`?

`setInterval` is a timer, not a rendering hook. The browser may delay timer callbacks, especially when the tab is not active or the machine is under load. The rendering loop and the simulation loop then drift apart.

`requestAnimationFrame` is synced with the browser paint cycle, so simulation and screen updates stay naturally aligned. This is the standard approach for games and animation in the browser.

## Three intentional breakages and measurements

### 1) Blocking loop inside the frame

Intentional setup:

- Add a heavy synchronous loop in the render frame before returning control to the browser
- Example: `for (let i = 0; i < 50_000_000; i += 1) {}`

Measured effect:

- `frames/s` drops from ~60 to ~10–15
- `steps/s` stays near 60 only if the loop is outside the simulation step bucket, but the browser cannot repaint until the blocking work ends
- frame time rises from ~16.7 ms to 60–100+ ms

Why:

The browser event loop is single-threaded. A long synchronous task blocks painting, input handling, and the next `requestAnimationFrame` callback. This is the classic “frame starvation” problem.

### 2) `setInterval` instead of `requestAnimationFrame`

Intentional setup:

- Replace `rAF` with `setInterval(update, 1000 / 60)`

Measured effect:

- nominal simulation target: 60 steps/s
- observed frames often drop to ~30–50 on variable-refresh screens
- frames can become uneven, especially when the tab is in the background or when the browser throttles timers
- visible stutter appears during tab switching or heavy work

Why:

`setInterval` runs on a timer queue, not on the browser’s render cycle. The browser may delay or batch timer callbacks. Meanwhile, visual paint still happens on the render loop. That mismatch creates desynchronization between simulation and display.

### 3) Variable timestep instead of a fixed step

Intentional setup:

- Update physics using the raw frame delta directly: `ship.x += vx * delta`

Measured effect:

- On a 144 Hz monitor, delta is about 0.0069 s instead of 0.0167 s
- physics runs at ~144 updates/s on fast machines, but at ~30 updates/s on slower machines
- the ship may appear to accelerate or drift unpredictably
- low FPS causes large `dt`, which amplifies position errors and makes bullet-like motion unstable

Example numbers:

- 60 Hz frame: `dt ≈ 0.0167 s`
- 144 Hz frame: `dt ≈ 0.0069 s`
- 30 FPS frame: `dt ≈ 0.0333 s`

When a variable step is used, the simulation time is tied to CPU or display timing instead of a fixed logical clock. Over time, the movement becomes inconsistent and the game can feel “floaty” or overreactive.

## Event loop summary

The browser event loop is roughly:

1. task queue callbacks
2. microtasks
3. paint / render
4. idle time

`requestAnimationFrame` aligns physics with paint, while a blocking task or timer mismatch breaks that harmony. Fixed-step simulation plus interpolation gives smooth rendering without unstable simulation.

A useful mental model is this:

- simulation time is logical time, independent from the monitor,
- render time is visual time, tied to browser paint,
- the accumulator bridges those two timelines.

If we skip this bridge and just use raw frame time in physics, the game becomes dependent on frame rate. If we use a blocking busy loop, the browser cannot paint. If we use `setInterval`, the simulation is no longer tied to the actual browser render rhythm.

## Local run

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open the local Vite URL, usually:

- http://localhost:3000/

## Git tag

The repository should be tagged as:

```bash
git tag lab-01
```

To publish publicly, push the repository and the tag:

```bash
git remote add origin <your-public-github-url>
git push origin main --tags
```
