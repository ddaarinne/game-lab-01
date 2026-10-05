import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "public", "audio");
fs.mkdirSync(outDir, { recursive: true });

const sampleRate = 22050;

function synthTone({ frequency, durationSeconds, volume = 0.35, tremolo = 0 }) {
  const frameCount = Math.floor(sampleRate * durationSeconds);
  const buffer = Buffer.alloc(frameCount * 2);

  for (let i = 0; i < frameCount; i += 1) {
    const t = i / sampleRate;
    let sample = Math.sin(2 * Math.PI * frequency * t);

    if (tremolo > 0) {
      const tremoloGain = 0.5 + 0.5 * Math.sin(2 * Math.PI * tremolo * t);
      sample *= tremoloGain;
    }

    const amplitude = Math.max(-1, Math.min(1, sample * volume));
    const intSample = Math.round(amplitude * 32767);
    buffer.writeInt16LE(intSample, i * 2);
  }

  return buffer;
}

function buildWav({ sampleData, channels = 1, sampleRateValue = sampleRate }) {
  const blockAlign = channels * 2;
  const byteRate = sampleRateValue * blockAlign;
  const dataSize = sampleData.length;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0, 4, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8, 4, "ascii");
  buffer.write("fmt ", 12, 4, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRateValue, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, 4, "ascii");
  buffer.writeUInt32LE(dataSize, 40);

  sampleData.copy(buffer, 44);
  return buffer;
}

const assets = [
  {
    name: "fired.wav",
    tone: { frequency: 780, durationSeconds: 0.12, volume: 0.35, tremolo: 3 },
  },
  {
    name: "hit.wav",
    tone: { frequency: 220, durationSeconds: 0.18, volume: 0.3 },
  },
  {
    name: "explode.wav",
    tone: { frequency: 90, durationSeconds: 0.45, volume: 0.42 },
  },
];

for (const asset of assets) {
  const pcm = synthTone(asset.tone);
  const wav = buildWav({ sampleData: pcm });
  const outPath = path.join(outDir, asset.name);
  fs.writeFileSync(outPath, wav);
  console.log(`generated ${asset.name}`);
}

console.log(`saved to ${outDir}`);
