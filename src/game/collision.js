export function circleCollision(a, b) {
  if (!a || !b || a.dead || b.dead) {
    return false;
  }

  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSum = a.radius + b.radius;

  return distanceSquared <= radiusSum * radiusSum;
}
