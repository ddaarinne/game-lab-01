export function createLoop({ update, render, step = 1 / 60 }) {
  let accumulator = 0;
  let previousFrameTime = 0;
  let isRunning = false;
  let animationId = 0;

  function tick(timestamp) {
    if (!isRunning) {
      return;
    }

    if (!previousFrameTime) {
      previousFrameTime = timestamp;
    }

    let delta = (timestamp - previousFrameTime) / 1000;
    previousFrameTime = timestamp;

    if (delta > 0.25) {
      delta = 0.25;
    }

    accumulator += delta;

    let steps = 0;
    while (accumulator >= step) {
      update(step);
      accumulator -= step;
      steps += 1;
    }

    const alpha = accumulator / step;
    render(alpha, delta * 1000);

    animationId = window.requestAnimationFrame(tick);
  }

  function start() {
    if (isRunning) {
      return;
    }

    isRunning = true;
    previousFrameTime = 0;
    accumulator = 0;
    animationId = window.requestAnimationFrame(tick);
  }

  function stop() {
    isRunning = false;
    if (animationId) {
      window.cancelAnimationFrame(animationId);
      animationId = 0;
    }
  }

  return {
    start,
    stop,
    render(alpha, frameTime) {
      const alphaValue = Number.isFinite(alpha) ? alpha : 0;
      const frameTimeValue = Number.isFinite(frameTime) ? frameTime : 0;
      render(alphaValue, frameTimeValue);
    },
  };
}
