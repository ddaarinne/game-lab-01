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

1. render task queue
2. callback task queue
3. microtasks
4. paint
5. idle time

`requestAnimationFrame` aligns physics with paint, while a blocking task or timer mismatch breaks that harmony. Fixed-step simulation plus interpolation gives smooth rendering without unstable simulation.

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
