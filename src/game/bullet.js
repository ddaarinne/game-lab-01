import { Vector2 } from "../math/vector2.js";
import { Entity } from "./entity.js";

export class Bullet extends Entity {
  constructor({
    position,
    velocity,
    owner,
    radius = 4,
    ttl = 1.4,
    damage = 1,
    homing = null,
    kind = "bullet",
  } = {}) {
    super({ position, velocity, radius, kind });
    this.owner = owner;
    this.ttl = ttl;
    this.damage = damage;
    this.homing = homing;
  }

  update(dt, world) {
    this.age += dt;
    this.prevPosition = this.position;

    if (this.homing && !this.dead) {
      const target = this.findTarget(world);
      if (target) {
        const desired = target.position.subtract(this.position).normalize();
        const current = this.velocity.normalize();
        const turnRate = this.homing.turnRate * dt;
        const currentAngle = Math.atan2(current.y, current.x);
        const targetAngle = Math.atan2(desired.y, desired.x);

        let delta = targetAngle - currentAngle;
        while (delta > Math.PI) {
          delta -= Math.PI * 2;
        }
        while (delta < -Math.PI) {
          delta += Math.PI * 2;
        }

        const angularStep = Math.max(-turnRate, Math.min(turnRate, delta));
        const nextVelocity = Vector2.fromAngle(currentAngle + angularStep).scale(
          this.velocity.length(),
        );
        this.velocity = nextVelocity;
      }
    }

    this.position = this.position.add(this.velocity.scale(dt));
    this.ttl -= dt;

    if (
      this.ttl <= 0 ||
      this.position.x < -50 ||
      this.position.x > world.width + 50 ||
      this.position.y < -50 ||
      this.position.y > world.height + 50
    ) {
      this.dead = true;
    }
  }

  findTarget(world) {
    if (!this.homing) {
      return null;
    }

    const candidates = world
      .ofKind(this.homing.kind)
      .filter((entity) => entity.id !== this.owner?.id)
      .filter((entity) => entity.position.distanceTo(this.position) <= this.homing.range);

    if (!candidates.length) {
      return null;
    }

    candidates.sort(
      (a, b) => a.position.distanceTo(this.position) - b.position.distanceTo(this.position),
    );
    return candidates[0];
  }
}
