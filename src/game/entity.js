import { Vector2 } from "../math/vector2.js";

export class Entity {
  static #nextId = 1;

  #id;

  constructor({
    position = new Vector2(),
    velocity = new Vector2(),
    radius = 10,
    kind = "entity",
    mass = 1,
  } = {}) {
    this.#id = Entity.#nextId;
    Entity.#nextId += 1;

    this.position = position;
    this.prevPosition = position;
    this.velocity = velocity;
    this.radius = radius;
    this.kind = kind;
    this.mass = mass;
    this.dead = false;
    this.age = 0;
  }

  get id() {
    return this.#id;
  }

  update(dt, world, input) {
    this.age += dt;
    this.prevPosition = this.position;
    this.position = this.position.add(this.velocity.scale(dt));

    if (world) {
      this.wrap(world.width, world.height);
    }
  }

  wrap(width, height) {
    if (this.position.x < -this.radius) {
      this.position = new Vector2(width + this.radius, this.position.y);
    } else if (this.position.x > width + this.radius) {
      this.position = new Vector2(-this.radius, this.position.y);
    }

    if (this.position.y < -this.radius) {
      this.position = new Vector2(this.position.x, height + this.radius);
    } else if (this.position.y > height + this.radius) {
      this.position = new Vector2(this.position.x, -this.radius);
    }
  }
}
