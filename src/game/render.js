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

function interpolate(entity, alpha) {
  const prev = entity.prevPosition ?? entity.position;
  return {
    x: prev.x + (entity.position.x - prev.x) * alpha,
    y: prev.y + (entity.position.y - prev.y) * alpha,
  };
}

export function renderShip(ctx, ship, alpha) {
  const current = interpolate(ship, alpha);

  ctx.save();
  ctx.translate(current.x, current.y);
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

export function renderBullet(ctx, bullet, alpha) {
  const current = interpolate(bullet, alpha);

  ctx.beginPath();
  ctx.arc(current.x, current.y, bullet.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd166";
  ctx.fill();
}

export function renderAsteroid(ctx, asteroid, alpha) {
  const current = interpolate(asteroid, alpha);

  ctx.save();
  ctx.translate(current.x, current.y);
  ctx.rotate(asteroid.rotation);

  ctx.beginPath();
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8;
    const radius = asteroid.radius * (0.75 + (index % 2) * 0.2);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();

  ctx.fillStyle = "#8b94a8";
  ctx.fill();
  ctx.strokeStyle = "#eef3ff";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export function renderPickup(ctx, pickup, alpha) {
  const current = interpolate(pickup, alpha);
  const pulse = 1 + Math.sin(pickup.phase) * 0.15;

  ctx.save();
  ctx.translate(current.x, current.y);
  ctx.scale(pulse, pulse);

  ctx.beginPath();
  ctx.moveTo(0, -pickup.radius * 1.4);
  ctx.lineTo(pickup.radius * 1.2, 0);
  ctx.lineTo(0, pickup.radius * 1.4);
  ctx.lineTo(-pickup.radius * 1.2, 0);
  ctx.closePath();

  ctx.fillStyle = "#7affc8";
  ctx.fill();
  ctx.strokeStyle = "#dffcf0";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export function renderParticle(ctx, particle, alpha) {
  const current = interpolate(particle, alpha);

  ctx.beginPath();
  ctx.arc(current.x, current.y, particle.radius, 0, Math.PI * 2);
  ctx.fillStyle = particle.color || "#ffd166";
  ctx.fill();
}

export function renderWorld(ctx, world, alpha) {
  for (const entity of world.entities) {
    if (entity.dead) {
      continue;
    }

    switch (entity.kind) {
      case "ship":
        renderShip(ctx, entity, alpha);
        break;
      case "bullet":
        renderBullet(ctx, entity, alpha);
        break;
      case "asteroid":
        renderAsteroid(ctx, entity, alpha);
        break;
      case "pickup":
        renderPickup(ctx, entity, alpha);
        break;
      case "particle":
        renderParticle(ctx, entity, alpha);
        break;
      default:
        break;
    }
  }
}
