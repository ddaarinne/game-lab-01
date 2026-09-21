export function integrate(ship, input, dt) {
  const turnSpeed = (Math.PI / 180) * 180;
  const acceleration = 220;
  const drag = 0.98;
  const maxSpeed = 320;

  const nextShip = {
    ...ship,
    prevX: ship.x,
    prevY: ship.y,
    vx: ship.vx * drag,
    vy: ship.vy * drag,
  };

  if (input.isPressed("ArrowLeft") || input.isPressed("KeyA")) {
    nextShip.angle -= turnSpeed * dt;
  }

  if (input.isPressed("ArrowRight") || input.isPressed("KeyD")) {
    nextShip.angle += turnSpeed * dt;
  }

  const forwardX = Math.cos(nextShip.angle);
  const forwardY = Math.sin(nextShip.angle);

  if (input.isPressed("ArrowUp") || input.isPressed("KeyW")) {
    nextShip.vx += forwardX * acceleration * dt;
    nextShip.vy += forwardY * acceleration * dt;
  }

  if (input.isPressed("ArrowDown") || input.isPressed("KeyS")) {
    nextShip.vx -= forwardX * acceleration * dt * 0.6;
    nextShip.vy -= forwardY * acceleration * dt * 0.6;
  }

  const speed = Math.hypot(nextShip.vx, nextShip.vy);
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    nextShip.vx *= scale;
    nextShip.vy *= scale;
  }

  nextShip.x += nextShip.vx * dt;
  nextShip.y += nextShip.vy * dt;

  return nextShip;
}
