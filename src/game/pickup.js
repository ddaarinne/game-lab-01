import { Vector2 } from "../math/vector2.js";
import { Entity } from "./entity.js";

export class Pickup extends Entity {
  constructor({ position, radius = 8, value = 25 } = {}) {
    super({ position, velocity: new Vector2(), radius, kind: "pickup" });
    this.value = value;
    this.phase = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.age += dt;
    this.phase += dt * 2.5;
    this.prevPosition = this.position;
  }
}
