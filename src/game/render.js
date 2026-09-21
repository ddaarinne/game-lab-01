export function setupCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, dpr };
}

export function renderShip(ctx, ship, alpha) {
  const x = ship.prevX + (ship.x - ship.prevX) * alpha;
  const y = ship.prevY + (ship.y - ship.prevY) * alpha;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ship.angle);

  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(-12, -10);
  ctx.lineTo(-8, 0);
  ctx.lineTo(-12, 10);
  ctx.closePath();

  ctx.fillStyle = "#7ce7ff";
  ctx.fill();

  ctx.strokeStyle = "#dff7ff";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-18, 0);
  ctx.strokeStyle = "#7affc8";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}
