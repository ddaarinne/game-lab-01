function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getRetryDelay(attempt, baseDelay = 250) {
  const jitter = Math.random() * 120;
  return baseDelay * 2 ** attempt + jitter;
}

export async function fetchJson(url, { signal, retries = 3 } = {}) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, { signal });

      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`HTTP ${response.status} for ${url}`);
        }

        if (attempt >= retries) {
          throw new Error(
            `Failed to fetch ${url} after ${retries + 1} attempts`,
          );
        }
      } else {
        return await response.json();
      }
    } catch (error) {
      if (signal?.aborted || error.name === "AbortError") {
        throw error;
      }

      if (attempt >= retries) {
        throw error;
      }

      const delay = getRetryDelay(attempt);
      attempt += 1;
      await sleep(delay);
    }
  }

  throw new Error(`Failed to fetch ${url}`);
}

export async function loadJson(url, options) {
  return fetchJson(url, options);
}

export async function loadImage(url, { signal, retries = 3 } = {}) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Image not found: ${url}`);
        }

        if (attempt >= retries) {
          throw new Error(`Failed to load image: ${url}`);
        }
      } else {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        const image = new Image();
        image.src = imageUrl;
        await image.decode();
        return image;
      }
    } catch (error) {
      if (signal?.aborted || error.name === "AbortError") {
        throw error;
      }

      if (attempt >= retries) {
        throw error;
      }

      const delay = getRetryDelay(attempt);
      attempt += 1;
      await sleep(delay);
    }
  }

  throw new Error(`Failed to fetch image ${url}`);
}

export async function loadAudio(
  url,
  { signal, retries = 3, audioContext } = {},
) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Audio not found: ${url}`);
        }

        if (attempt >= retries) {
          throw new Error(`Failed to load audio: ${url}`);
        }
      } else {
        const arrayBuffer = await response.arrayBuffer();
        const decoded = await audioContext.decodeAudioData(
          arrayBuffer.slice(0),
        );
        return decoded;
      }
    } catch (error) {
      if (signal?.aborted || error.name === "AbortError") {
        throw error;
      }

      if (attempt >= retries) {
        throw error;
      }

      const delay = getRetryDelay(attempt);
      attempt += 1;
      await sleep(delay);
    }
  }

  throw new Error(`Failed to decode audio ${url}`);
}

export async function loadAll({ signal, onProgress, audioContext } = {}) {
  const manifest = await loadJson("/manifest.json", { signal, retries: 3 });
  const tasks = [
    ...manifest.images.map((item) => ({ ...item, kind: "image" })),
    ...manifest.audio.map((item) => ({ ...item, kind: "audio" })),
  ];

  const result = {
    images: {},
    audio: {},
  };

  for (let index = 0; index < tasks.length; index += 1) {
    const item = tasks[index];
    const asset =
      item.kind === "image"
        ? await loadImage(item.url, { signal, retries: 3 })
        : await loadAudio(item.url, { signal, retries: 3, audioContext });

    if (item.kind === "image") {
      result.images[item.name] = asset;
    } else {
      result.audio[item.name] = asset;
    }

    if (onProgress) {
      onProgress(index + 1, tasks.length);
    }
  }

  return result;
}
