import { fetchJson } from "./loader.js";

export class Lobby extends EventTarget {
  constructor({ fetchUrl = "/api/rooms" } = {}) {
    super();
    this.fetchUrl = fetchUrl;
    this.refreshHandle = null;
    this.abortController = null;
    this.rooms = [];
  }

  bind() {
    this.form = document.querySelector("#lobby-form");
    this.nameInput = document.querySelector("#player-name");
    this.roomSelect = document.querySelector("#room-select");
    this.joinButton = document.querySelector("#join-button");
    this.refreshButton = document.querySelector("#refresh-rooms");
    this.statusLine = document.querySelector("#lobby-status");

    this.form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = this.nameInput.value.trim() || "Pilot";
      const room = this.roomSelect.value;
      this.dispatchEvent(new CustomEvent("join", { detail: { name, room } }));
    });

    this.refreshButton?.addEventListener("click", () => this.refresh());
  }

  show() {
    const screen = document.querySelector("#lobby-screen");
    screen?.classList.remove("hidden");
    this.startPolling();
  }

  hide() {
    const screen = document.querySelector("#lobby-screen");
    screen?.classList.add("hidden");
    this.stopPolling();
  }

  startPolling() {
    this.refresh();
    this.refreshHandle = window.setInterval(() => this.refresh(), 5000);
  }

  stopPolling() {
    if (this.refreshHandle) {
      window.clearInterval(this.refreshHandle);
      this.refreshHandle = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async refresh() {
    if (this.abortController) {
      this.abortController.abort();
    }

    const controller = new AbortController();
    this.abortController = controller;

    try {
      const payload = await fetchJson(this.fetchUrl, {
        signal: controller.signal,
      });
      const rooms = payload.rooms ?? [];
      this.rooms = rooms;
      this.renderRooms();
      this.statusLine.textContent = `Online rooms: ${rooms.length}`;
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      this.statusLine.textContent = "Rooms unavailable — retrying...";
    } finally {
      if (!controller.signal.aborted) {
        this.abortController = null;
      }
    }
  }

  renderRooms() {
    if (!this.roomSelect) {
      return;
    }

    const options = this.rooms.map(
      (room) =>
        `<option value="${room.id}">${room.label} · ${room.status}</option>`,
    );

    this.roomSelect.innerHTML =
      options.join("") || '<option value="">No rooms</option>';
    this.joinButton.disabled = !this.rooms.length;
  }
}
