import { Vector2 } from "../math/vector2.js";
import { Entity } from "./entity.js";

export class Asteroid extends Entity {
  constructor({ position, radius = 22, velocity = new Vector2(), scoreValue = 25 } = {}) {
    super({ position, velocity, radius, kind: "asteroid", mass: radius });
    this.scoreValue = scoreValue;
    this.hp = 2;
    this.rotation = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 2.5;
  }

  update(dt, world) {
    this.age += dt;
    this.prevPosition = this.position;
    this.position = this.position.add(this.velocity.scale(dt));
    this.rotation += this.spin * dt;

    if (world) {
      this.wrap(world.width, world.height);
    }
  }

  hit(amount = 1) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.dead = true;
    }
  }
}
