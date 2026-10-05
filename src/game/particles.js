import { Vector2 } from "../math/vector2.js";
import { Entity } from "./entity.js";

export class Particle extends Entity {
  constructor({ position, velocity, radius = 2, ttl = 0.5, color = "#ffb870" } = {}) {
    super({ position, velocity, radius, kind: "particle" });
    this.ttl = ttl;
    this.color = color;
  }

  update(dt) {
    this.age += dt;
    this.prevPosition = this.position;
    this.position = this.position.add(this.velocity.scale(dt));
    this.ttl -= dt;
    this.velocity = this.velocity.scale(0.98);

    if (this.ttl <= 0) {
      this.dead = true;
    }
  }
}
