export function updateHUD({ steps, fps, frameTime }) {
  const stepsElement = document.querySelector("#steps-value");
  const fpsElement = document.querySelector("#fps-value");
  const frameTimeElement = document.querySelector("#frame-time-value");

  if (stepsElement) {
    stepsElement.textContent = String(steps);
  }

  if (fpsElement) {
    fpsElement.textContent = String(fps);
  }

  if (frameTimeElement) {
    frameTimeElement.textContent = `${frameTime.toFixed(2)} ms`;
  }
}
