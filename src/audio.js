export class AudioManager {
  constructor() {
    this.context = null;
    this.buffers = {};
    this.ready = false;
  }

  async init() {
    if (!this.context) {
      this.context = new AudioContext();
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.ready = true;
  }

  setAssets(assets) {
    this.buffers = assets?.audio ?? {};
  }

  play(name) {
    if (!this.context || !this.buffers[name]) {
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = this.buffers[name];

    const gainNode = this.context.createGain();
    gainNode.gain.value = 0.2;

    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    source.start();
  }
}
