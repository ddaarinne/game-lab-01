import { Vector2 } from "../math/vector2.js";
import { circleCollision } from "./collision.js";
import { Particle } from "./particles.js";

export class World {
  #entities = new Map();

  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  get entities() {
    return [...this.#entities.values()];
  }

  spawn(entity) {
    this.#entities.set(entity.id, entity);
    return entity;
  }

  despawn(entity) {
    entity.dead = true;
    this.#entities.delete(entity.id);
    return entity;
  }

  ofKind(kind) {
    return this.entities.filter((entity) => entity.kind === kind && !entity.dead);
  }

  step(dt, input) {
    for (const entity of this.#entities.values()) {
      if (!entity.dead || entity.kind === "ship") {
        entity.update(dt, this, input);
      }
    }

    this.resolveCollisions();
    this.sweep();
  }

  resolveCollisions() {
    const entities = this.entities.filter((entity) => !entity.dead);

    for (let i = 0; i < entities.length; i += 1) {
      for (let j = i + 1; j < entities.length; j += 1) {
        const a = entities[i];
        const b = entities[j];

        if (circleCollision(a, b)) {
          this.handleCollision(a, b);
        }
      }
    }
  }

  handleCollision(a, b) {
    const ship = a.kind === "ship" ? a : b.kind === "ship" ? b : null;
    const bullet = a.kind === "bullet" ? a : b.kind === "bullet" ? b : null;
    const asteroid = a.kind === "asteroid" ? a : b.kind === "asteroid" ? b : null;
    const pickup = a.kind === "pickup" ? a : b.kind === "pickup" ? b : null;

    if (ship && bullet && bullet.owner !== ship) {
      ship.takeDamage(bullet.damage);
      bullet.dead = true;
      this.spawnExplosion(bullet.position, 8, "#ffcc7a");
      return;
    }

    if (bullet && asteroid) {
      asteroid.hit(bullet.damage);
      bullet.dead = true;
      this.spawnExplosion(bullet.position, 10, "#ffd166");
      if (asteroid.dead) {
        this.spawnExplosion(asteroid.position, 22, "#ff8b5e");
      }
      return;
    }

    if (ship && asteroid) {
      ship.takeDamage(1);
      asteroid.hit(1);
      this.spawnExplosion(asteroid.position, 16, "#ff8f70");
      return;
    }

    if (ship && pickup) {
      ship.score += pickup.value;
      pickup.dead = true;
      this.spawnExplosion(pickup.position, 16, "#7affc8");
      return;
    }
  }

  spawnExplosion(position, count = 16, color = "#ffb870") {
    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count + Math.random() * 0.6;
      const speed = 30 + Math.random() * 140;
      const particle = new Particle({
        position: position.add(Vector2.fromAngle(angle).scale(4)),
        velocity: Vector2.fromAngle(angle).scale(speed),
        radius: 2 + Math.random() * 2,
        ttl: 0.35 + Math.random() * 0.4,
        color,
      });

      this.spawn(particle);
    }
  }

  sweep() {
    for (const [id, entity] of this.#entities.entries()) {
      if (entity.dead) {
        if (entity.kind === "ship" && entity.respawnTimer > 0) {
          continue;
        }

        this.#entities.delete(id);
      }
    }
  }
}
