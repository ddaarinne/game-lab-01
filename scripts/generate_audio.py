import math
import os
import struct
import wave

outdir = os.path.join(os.getcwd(), "public", "audio")
os.makedirs(outdir, exist_ok=True)

sample_rate = 22050


def synth(freq, seconds, volume=0.35, tremolo=0):
    n = int(sample_rate * seconds)
    frames = []
    for i in range(n):
        t = i / sample_rate
        wave_value = math.sin(2 * math.pi * freq * t)
        if tremolo:
            wave_value *= (1.0 + math.sin(2 * math.pi * tremolo * t)) * 0.5
        amp = volume * wave_value
        frames.append(struct.pack("<h", int(max(-1, min(1, amp)) * 32767)))
    return b"".join(frames)

for name, freq, sec, vol in [("fired.wav", 780, 0.12, 0.35), ("hit.wav", 220, 0.18, 0.3), ("explode.wav", 90, 0.45, 0.42)]:
    data = synth(freq, sec, volume=vol, tremolo=3 if name == "fired.wav" else 0)
    with wave.open(os.path.join(outdir, name), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(data)

print("generated", sorted(os.listdir(outdir)))
