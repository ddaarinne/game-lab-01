export function createInput() {
  const keys = new Set();

  const onKeyDown = (event) => {
    keys.add(event.code);
  };

  const onKeyUp = (event) => {
    keys.delete(event.code);
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return {
    isPressed(code) {
      return keys.has(code);
    },
    destroy() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    },
  };
}
