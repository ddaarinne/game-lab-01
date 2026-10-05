import { createInput } from "./engine/input.js";
import { createLoop } from "./engine/loop.js";
import { Asteroid } from "./game/asteroid.js";
import { Pickup } from "./game/pickup.js";
import { renderWorld, setupCanvas } from "./game/render.js";
import { Ship } from "./game/ship.js";
import { World } from "./game/world.js";
import { Vector2 } from "./math/vector2.js";
import { updateHUD } from "./ui/hud.js";

const canvas = document.querySelector("#game-canvas");
const arenaWidth = 960;
const arenaHeight = 540;

const { ctx } = setupCanvas(canvas, arenaWidth, arenaHeight);
const input = createInput();
const world = new World(arenaWidth, arenaHeight);
const ship = new Ship({ x: arenaWidth / 2, y: arenaHeight / 2 });
world.spawn(ship);

const stats = {
  frameCount: 0,
  stepCount: 0,
  lastSample: performance.now(),
  fps: 0,
  stepsPerSecond: 0,
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function spawnAsteroids(count) {
  for (let index = 0; index < count; index += 1) {
    let position = new Vector2(
      randomBetween(40, arenaWidth - 40),
      randomBetween(40, arenaHeight - 40),
    );

    while (position.distanceTo(ship.position) < 180) {
      position = new Vector2(
        randomBetween(40, arenaWidth - 40),
        randomBetween(40, arenaHeight - 40),
      );
    }

    const radius = randomBetween(18, 34);
    const asteroid = new Asteroid({
      position,
      radius,
      velocity: new Vector2(randomBetween(-55, 55), randomBetween(-55, 55)),
      scoreValue: 20,
    });

    world.spawn(asteroid);
  }
}

function spawnPickup() {
  const pickup = new Pickup({
    position: new Vector2(
      randomBetween(120, arenaWidth - 120),
      randomBetween(90, arenaHeight - 90),
    ),
    value: 50,
  });

  world.spawn(pickup);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !event.repeat) {
    ship.fire(world);
  }
});

spawnAsteroids(6);
spawnPickup();

function update(dt) {
  world.step(dt, input);
  stats.stepCount += 1;
}

function render(alpha, frameTime) {
  ctx.clearRect(0, 0, arenaWidth, arenaHeight);
  ctx.fillStyle = "#0d1723";
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);

  ctx.strokeStyle = "rgba(124, 231, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, arenaHeight / 2);
  ctx.lineTo(arenaWidth, arenaHeight / 2);
  ctx.moveTo(arenaWidth / 2, 0);
  ctx.lineTo(arenaWidth / 2, arenaHeight);
  ctx.stroke();

  renderWorld(ctx, world, alpha);

  stats.frameCount += 1;
  const now = performance.now();
  const elapsed = now - stats.lastSample;

  if (elapsed >= 500) {
    stats.fps = Math.round((stats.frameCount * 1000) / elapsed);
    stats.stepsPerSecond = Math.round((stats.stepCount * 1000) / elapsed);
    updateHUD({
      steps: stats.stepsPerSecond,
      fps: stats.fps,
      frameTime,
      hp: ship.hp,
      score: ship.score,
    });
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
