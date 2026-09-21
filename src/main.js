import { createInput } from "./engine/input.js";
import { createLoop } from "./engine/loop.js";
import { integrate } from "./game/physics.js";
import { renderShip, setupCanvas } from "./game/render.js";
import { updateHUD } from "./ui/hud.js";

const canvas = document.querySelector("#game-canvas");
const arenaWidth = 960;
const arenaHeight = 540;

const { ctx } = setupCanvas(canvas, arenaWidth, arenaHeight);
const input = createInput();

const ship = {
  x: arenaWidth / 2,
  y: arenaHeight / 2,
  prevX: arenaWidth / 2,
  prevY: arenaHeight / 2,
  vx: 0,
  vy: 0,
  angle: 0,
};

const stats = {
  frameCount: 0,
  stepCount: 0,
  lastSample: performance.now(),
  fps: 0,
  stepsPerSecond: 0,
};

function update(dt) {
  const nextShip = integrate(ship, input, dt);
  ship.prevX = ship.x;
  ship.prevY = ship.y;

  const wrapped = { ...nextShip };
  if (wrapped.x < 0) {
    wrapped.x += arenaWidth;
  } else if (wrapped.x > arenaWidth) {
    wrapped.x -= arenaWidth;
  }

  if (wrapped.y < 0) {
    wrapped.y += arenaHeight;
  } else if (wrapped.y > arenaHeight) {
    wrapped.y -= arenaHeight;
  }

  Object.assign(ship, wrapped);
  stats.stepCount += 1;
}

function render(alpha, frameTime) {
  ctx.clearRect(0, 0, arenaWidth, arenaHeight);
  ctx.fillStyle = "#0d1723";
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);

  ctx.strokeStyle = "rgba(124, 231, 255, 0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, arenaHeight / 2);
  ctx.lineTo(arenaWidth, arenaHeight / 2);
  ctx.moveTo(arenaWidth / 2, 0);
  ctx.lineTo(arenaWidth / 2, arenaHeight);
  ctx.stroke();

  renderShip(ctx, ship, alpha);

  stats.frameCount += 1;
  const now = performance.now();
  const elapsed = now - stats.lastSample;

  if (elapsed >= 500) {
    stats.fps = Math.round((stats.frameCount * 1000) / elapsed);
    stats.stepsPerSecond = Math.round((stats.stepCount * 1000) / elapsed);
    updateHUD({ steps: stats.stepsPerSecond, fps: stats.fps, frameTime });
    stats.frameCount = 0;
    stats.stepCount = 0;
    stats.lastSample = now;
  }
}

const loop = createLoop({
  update,
  render,
  step: 1 / 60,
});

loop.start();

window.addEventListener("beforeunload", () => {
  input.destroy();
  loop.stop();
});
