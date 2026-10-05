import { Vector2 } from "../math/vector2.js";
import { Bullet } from "./bullet.js";
import { Entity } from "./entity.js";

export class Ship extends Entity {
  #hp = 3;

  constructor({ x = 0, y = 0, radius = 16 } = {}) {
    super({
      position: new Vector2(x, y),
      velocity: new Vector2(),
      radius,
      kind: "ship",
    });
    this.angle = 0;
    this.fireCooldown = 0;
    this.respawnTimer = 0;
    this.score = 0;
    this.maxHp = 3;
    this.spawnPosition = new Vector2(x, y);
  }

  get hp() {
    return this.#hp;
  }

  set hp(value) {
    this.#hp = Math.max(0, value);
  }

  get forward() {
    return Vector2.fromAngle(this.angle);
  }

  get muzzlePosition() {
    return this.position.add(this.forward.scale(this.radius + 12));
  }

  fire(world) {
    if (this.dead || this.fireCooldown > 0 || !world) {
      return null;
    }

    const bullet = new Bullet({
      position: this.muzzlePosition,
      velocity: this.forward.scale(440).add(this.velocity),
      owner: this,
      radius: 4,
      ttl: 1.6,
      damage: 1,
      homing: {
        kind: "asteroid",
        range: 200,
        turnRate: 1.9,
      },
    });

    this.fireCooldown = 0.22;
    world.spawn(bullet);
    return bullet;
  }

  takeDamage(amount) {
    if (this.dead) {
      return;
    }

    this.hp = this.hp - amount;
    if (this.hp <= 0) {
      this.dead = true;
      this.velocity = new Vector2();
      this.respawnTimer = 2;
    }
  }

  update(dt, world, input) {
    if (this.dead) {
      this.fireCooldown = Math.max(0, this.fireCooldown - dt);
      this.respawnTimer -= dt;

      if (this.respawnTimer <= 0) {
        this.dead = false;
        this.hp = this.maxHp;
        this.position = this.spawnPosition;
        this.velocity = new Vector2();
        this.angle = 0;
        this.respawnTimer = 0;
      }
      return;
    }

    this.fireCooldown = Math.max(0, this.fireCooldown - dt);

    const turnSpeed = Math.PI * 2.1;
    const acceleration = 220;
    const drag = 0.985;
    const maxSpeed = 310;

    if (input.isPressed("ArrowLeft") || input.isPressed("KeyA")) {
      this.angle -= turnSpeed * dt;
    }

    if (input.isPressed("ArrowRight") || input.isPressed("KeyD")) {
      this.angle += turnSpeed * dt;
    }

    if (input.isPressed("ArrowUp") || input.isPressed("KeyW")) {
      this.velocity = this.velocity.add(this.forward.scale(acceleration * dt));
    }

    if (input.isPressed("ArrowDown") || input.isPressed("KeyS")) {
      this.velocity = this.velocity.add(this.forward.scale(-acceleration * dt * 0.75));
    }

    this.velocity = this.velocity.scale(drag);
    const speed = this.velocity.length();
    if (speed > maxSpeed) {
      this.velocity = this.velocity.normalize().scale(maxSpeed);
    }

    this.prevPosition = this.position;
    this.position = this.position.add(this.velocity.scale(dt));
    this.wrap(world.width, world.height);
  }
}
