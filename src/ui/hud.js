export function updateHUD({ steps, fps, frameTime, hp, score }) {
  const stepsElement = document.querySelector("#steps-value");
  const fpsElement = document.querySelector("#fps-value");
  const frameTimeElement = document.querySelector("#frame-time-value");
  const hpElement = document.querySelector("#hp-value");
  const scoreElement = document.querySelector("#score-value");

  if (stepsElement) {
    stepsElement.textContent = String(steps);
  }

  if (fpsElement) {
    fpsElement.textContent = String(fps);
  }

  if (frameTimeElement) {
    frameTimeElement.textContent = `${frameTime.toFixed(2)} ms`;
  }

  if (hpElement) {
    hpElement.textContent = String(hp);
  }

  if (scoreElement) {
    scoreElement.textContent = String(score);
  }
}
