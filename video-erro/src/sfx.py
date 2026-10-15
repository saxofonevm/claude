import numpy as np, wave
SR = 48000; DUR = 43.5
n = int(SR * DUR); t = np.arange(n) / SR
rng = np.random.default_rng(7)
L = np.zeros(n); R = np.zeros(n)

def add(sig, at, pan=0.0, g=1.0):
    i = int(at * SR); sig = sig[: n - i] * g
    L[i:i + len(sig)] += sig * (1 - pan) ; R[i:i + len(sig)] += sig * (1 + pan)

def env(d, a=0.005, r=None):
    m = int(d * SR); e = np.ones(m); k = int(a * SR); e[:k] = np.linspace(0, 1, k)
    rr = int((r or d - a) * SR); e[-rr:] *= np.linspace(1, 0, rr) ** 2; return e

def lowpass(x, k):  # cheap moving-average lowpass
    c = np.cumsum(np.concatenate([np.zeros(k), x, np.zeros(k)]))
    y = (c[k:] - c[:-k]) / k
    return y[k // 2: k // 2 + len(x)]

# --- pad: Dm9 drone, swells, drops out for the "reaction" pause ---
pad = np.zeros(n)
for f in [73.42, 110.0, 146.83, 174.61, 220.0, 329.63]:
    pad += np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 0.13 * t) * 0.8) / 6
vol = np.clip(t / 2.5, 0, 1) * 0.16
vol *= np.where((t > 8.4) & (t < 10.4), 0.0, 1.0)            # silence = reaction
vol = lowpass(vol, int(0.25 * SR))
vol *= np.clip((DUR - 0.3 - t) / 1.5, 0, 1)
vol *= 1 + 0.35 * np.clip((t - 37.5) / 2, 0, 1)                 # lift at the end
L += pad * vol; R += np.roll(pad, 240) * vol

# --- impact: sub boom + noise click ---
def impact(d=1.6):
    m = int(d * SR); tt = np.arange(m) / SR
    f = 55 * np.exp(-tt * 1.5) + 35
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.0)
    click = lowpass(rng.standard_normal(m), 6) * np.exp(-tt * 40) * 0.6
    return boom + click
for at, g in [(1.2, .9), (14.3, 1.0), (39.0, 1.0)]: add(impact(), at, g=g)

# --- whoosh: filtered noise swell into each new phrase ---
def whoosh(d=0.7):
    m = int(d * SR); x = rng.standard_normal(m); out = np.zeros(m)
    for j, k in enumerate([60, 30, 15, 8]):
        seg = slice(j * m // 4, (j + 1) * m // 4); out[seg] = lowpass(x, k)[seg]
    return out * np.sin(np.linspace(0, np.pi, m)) ** 2 * 0.9
for at in [2.9, 10.2, 16.2, 19.7, 23.2, 27.2, 30.7, 33.7, 37.2]: add(whoosh(), at, pan=rng.uniform(-.4, .4), g=.5)

# --- glitch at the error moment ---
gl = np.zeros(int(0.6 * SR))
for k in range(9):
    s = rng.integers(0, len(gl) - 2000); w = rng.integers(600, 3000)
    tone = np.sign(np.sin(2 * np.pi * rng.uniform(200, 1400) * np.arange(w) / SR))
    gl[s:s + w] += tone * 0.25 + rng.standard_normal(w) * 0.15
add(gl * np.linspace(1, .2, len(gl)), 8.5, g=.8)

# --- clock tick for "segundo seguinte" ---
def tick():
    m = int(0.08 * SR); tt = np.arange(m) / SR
    return np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 90)
add(tick(), 21.2, g=.6); add(tick(), 22.2, g=.45)

# --- soft chime notes during "ajustes finos" ---
for i, (at, f) in enumerate([(23.6, 587.3), (24.9, 659.3), (26.2, 698.5), (27.6, 880), (29.0, 1046.5)]):
    m = int(1.8 * SR); tt = np.arange(m) / SR
    add((np.sin(2*np.pi*f*tt) + .3*np.sin(4*np.pi*f*tt)) * np.exp(-tt * 2.5) * .18, at, pan=(-.3 if i % 2 else .3))

mix = np.stack([L, R], 1); mix /= max(1e-9, np.abs(mix).max()) / 0.85
with wave.open('sfx.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', DUR)
