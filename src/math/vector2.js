export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  subtract(other) {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  scale(value) {
    return new Vector2(this.x * value, this.y * value);
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const length = this.length();
    if (length === 0) {
      return new Vector2();
    }

    return new Vector2(this.x / length, this.y / length);
  }

  distanceTo(other) {
    return this.subtract(other).length();
  }

  rotate(angle) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);

    return new Vector2(this.x * cosine - this.y * sine, this.x * sine + this.y * cosine);
  }

  static fromAngle(angle) {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }
}
