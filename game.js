/* Playfair Fun & Games: Bachelorette invite "Protect the Bride" (sample). Vanilla canvas, no third-party requests. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let config = {
    hostName: "The Maid of Honour", brideName: "Jess", sample: true,
    landingLine: "The Maid of Honour is sending you an invite. Pass the level to find out what it is!",
    landingSubline: "", howToPlay: [],
    eventName: "Jess's Last Fling Before the Ring", date: "", time: "", location: "", extraNote: "",
    rsvpEndpoint: "local", rsvpStorageKey: "playfair-bachelorette-sample-rsvp",
    madeBy: "Playfair Fun & Games", tagline: "You're Invited to Play", failsBeforeAssist: 3, privacyNote: "",
  };
  const screens = {};
  ["loading", "landing", "howto", "game", "reveal"].forEach((n) => (screens[n] = $("screen-" + n)));
  const INK = "#1a0a16";
  const BN = () => config.brideName || "Jess";

  /* ================= AUDIO ================= */
  let actx = null, master = null, muted = false, noiseBuf = null;
  function unlockAudio() {
    try {
      if (!actx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        actx = new AC();
        master = actx.createGain(); master.gain.value = 0.55; master.connect(actx.destination);
        noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (actx.state === "suspended") actx.resume();
      decodeVoices();
      const b = actx.createBuffer(1, 1, 22050), s = actx.createBufferSource();
      s.buffer = b; s.connect(master); s.start(0);
    } catch (e) {}
  }
  function tone(f, d, type, v, f2, delay) {
    if (!actx || muted) return;
    const t = actx.currentTime + (delay || 0);
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.2, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.05);
  }
  function noise(d, v, freq, q, delay, f2, type) {
    if (!actx || muted) return;
    const t = actx.currentTime + (delay || 0);
    const s = actx.createBufferSource(); s.buffer = noiseBuf;
    const f = actx.createBiquadFilter(); f.type = type || "bandpass"; f.frequency.setValueAtTime(freq || 1000, t); f.Q.value = q || 1;
    if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + d);
    const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.2, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
  }
  function trombone() {
    if (!actx || muted) return;
    [[392, 0.42], [370, 0.42], [349, 0.42], [330, 1.1]].forEach(([f, d], i) => {
      const t = actx.currentTime + 0.1 + i * 0.45;
      const o = actx.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(f, t);
      if (i === 3) { const l = actx.createOscillator(), lg = actx.createGain(); l.frequency.value = 6; lg.gain.value = 9; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + d); o.frequency.linearRampToValueAtTime(f * 0.94, t + d); }
      const fl = actx.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = 900; fl.Q.value = 3;
      const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.05); g.gain.setValueAtTime(0.14, t + d * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(fl); fl.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.05);
    });
  }
  const sfx = {
    tap: () => tone(660, 0.08, "triangle", 0.15, 880),
    slap: () => { noise(0.06, 0.9, 3200, 0.6, 0, null, "highpass"); noise(0.09, 0.55, 1400, 0.8); tone(170, 0.1, "sine", 0.35, 55); noise(0.25, 0.06, 5000, 1, 0.03); },
    bigSlap: () => { noise(0.08, 1.0, 2600, 0.5, 0, null, "highpass"); noise(0.14, 0.7, 1000, 0.7); tone(140, 0.16, "sine", 0.45, 40); [1568, 2093].forEach((f, i) => tone(f, 0.12, "triangle", 0.06, null, 0.05 + i * 0.05)); },
    whiff: () => noise(0.14, 0.12, 500, 1.2, 0, 2400),
    spin: () => { tone(500, 0.5, "triangle", 0.09, 1600); [880, 1175, 1568].forEach((f, i) => tone(f, 0.12, "triangle", 0.07, null, 0.15 + i * 0.06)); },
    hurt: () => tone(240, 0.18, "square", 0.08, 110),
    grab: () => { tone(880, 0.12, "square", 0.08); tone(660, 0.12, "square", 0.08, null, 0.14); tone(880, 0.12, "square", 0.08, null, 0.28); },
    warn: () => tone(1046, 0.08, "square", 0.05),
    rose: () => tone(900, 0.12, "sine", 0.1, 520),
    marg: () => { noise(0.5, 0.12, 900, 3, 0, 2600); tone(330, 0.3, "sine", 0.1, 520, 0.45); },
    pop: () => { tone(900, 0.05, "square", 0.25, 200); noise(0.06, 0.5, 2000, 0.8); noise(1.1, 0.12, 7000, 0.6, 0.05, 3000); [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.15, "triangle", 0.08, null, 0.2 + i * 0.07)); },
    spray: () => noise(0.09, 0.07, 6000, 0.7),
    door: () => noise(0.25, 0.05, 300, 1),
    cheer: () => { noise(1.4, 0.16, 1800, 0.4, 0, 1200); [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, "triangle", 0.12, null, i * 0.09)); },
    ding: () => { tone(1319, 0.7, "sine", 0.15); tone(1047, 0.9, "sine", 0.13, null, 0.25); },
    rope: () => { tone(300, 0.2, "triangle", 0.12, 600); tone(600, 0.3, "triangle", 0.1, 1200, 0.15); },
    boss: () => { tone(110, 0.6, "sawtooth", 0.12, 55); tone(165, 0.6, "sawtooth", 0.08, 82); },
    facepalm: () => { noise(0.07, 0.6, 1800, 0.7); tone(150, 0.12, "sine", 0.3, 60); },
  };
  // ===== house music: a 16-bar, 124 BPM four-on-the-floor loop synthesised on the device (no files, royalty-free) =====
  const BPM = 124, BEAT = 60 / BPM, MUSIC_VOL = 0.22;
  let musicBuf = null, musicSrc = null, musicGain = null, musicT0 = 0, musicLevel = 1, musicStarting = false;
  let houseData = null;
  function synthHouse() {
    if (houseData) return houseData;
    const SR = 24000, bars = 16, beats = bars * 4, B = BEAT * SR, N = Math.round(beats * B), d = new Float32Array(N), sc = new Float32Array(N);
    let seed = 12345; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    const add = (i, v) => { d[i % N] += v; }, addS = (i, v) => { sc[i % N] += v; };
    const TAU = Math.PI * 2;
    // kick on every beat
    for (let b = 0; b < beats; b++) {
      const s0 = Math.round(b * B); let ph = 0;
      for (let j = 0, L = 0.3 * SR; j < L; j++) { const t = j / SR, f = 47 + 115 * Math.exp(-t / 0.032); ph += TAU * f / SR; add(s0 + j, Math.sin(ph) * Math.exp(-t / 0.17) * 0.95 + (j < 50 ? rnd() * 0.3 * (1 - j / 50) : 0)); }
    }
    // hats (high-passed noise)
    const hat = (s0, dec, vol) => { let prev = 0; for (let j = 0, L = dec * SR * 4; j < L; j++) { const n = rnd(), h = n - prev; prev = n; add(s0 + j, h * vol * Math.exp(-j / (dec * SR))); } };
    for (let b = 0; b < beats; b++) {
      const s0 = b * B; hat(Math.round(s0 + B / 2), 0.055, 0.2);
      hat(Math.round(s0 + B / 4), 0.012, 0.06); hat(Math.round(s0 + 3 * B / 4), 0.012, 0.075);
    }
    // clap on 2 and 4
    for (let b = 1; b < beats; b += 2) {
      const s0 = Math.round(b * B); let lp1 = 0, lp2 = 0;
      for (let j = 0, L = 0.22 * SR; j < L; j++) {
        const t = j / SR, n = rnd(); lp1 += (n - lp1) * 0.55; lp2 += (n - lp2) * 0.12; const bp = lp1 - lp2;
        const env = (t < 0.03 ? (Math.exp(-((t % 0.01) / 0.004))) : 0) * 0.8 + Math.exp(-t / 0.07) * (t > 0.02 ? 1 : 0.3);
        add(s0 + j, bp * env * 0.55);
      }
    }
    // chords (Am7, Fmaj7, Cmaj7, G6), two bars each, played twice
    const CH = [[220, 261.63, 329.63, 392], [174.61, 220, 261.63, 329.63], [261.63, 329.63, 392, 246.94], [196, 246.94, 293.66, 329.63]];
    const ROOT = [55, 43.65, 65.41, 49];
    for (let bar = 0; bar < bars; bar++) {
      const ci = (bar >> 1) % 4, cut = 700 + 1500 * (0.5 - 0.5 * Math.cos(TAU * bar / bars)), a = 1 - Math.exp(-TAU * cut / SR);
      // stabs
      const pos = bar % 2 ? [1.5, 2.75, 3.5] : [0.5, 1.5, 3.5];
      for (const pb of pos) {
        const s0 = Math.round((bar * 4 + pb) * B);
        CH[ci].forEach((f, vi) => { let p1 = vi * 0.13, p2 = vi * 0.37, lp = 0;
          for (let j = 0, L = 0.26 * SR; j < L; j++) { const t = j / SR; p1 = (p1 + f / SR) % 1; p2 = (p2 + f * 1.006 / SR) % 1; const saw = (p1 * 2 - 1) + (p2 * 2 - 1); lp += (saw - lp) * a * (0.6 + 0.8 * Math.exp(-t / 0.05)); addS(s0 + j, lp * 0.045 * Math.exp(-t / 0.09)); } });
      }
      // off-beat bass
      for (let k = 0; k < 4; k++) {
        const s0 = Math.round((bar * 4 + k + 0.5) * B), f = ROOT[ci] * (k === 3 && bar % 2 ? 2 : 1);
        let p = 0, q = 0, lp = 0;
        for (let j = 0, L = 0.21 * SR; j < L; j++) { const t = j / SR; p = (p + f / SR) % 1; q += TAU * f / SR; lp += ((p * 2 - 1) - lp) * 0.09; const env = Math.min(1, j / 60) * Math.exp(-t / 0.16); addS(s0 + j, (lp * 0.35 + Math.sin(q) * 0.42) * env); }
      }
    }
    // riser into the loop point
    { const s0 = Math.round((beats - 4) * B), L = Math.round(4 * B); let lp = 0; for (let j = 0; j < L; j++) { const x = j / L; lp += (rnd() - lp) * (0.02 + 0.5 * x * x); add(s0 + j, lp * 0.12 * x * x); } }
    // sidechain pump + mix + soft clip
    let peak = 0;
    for (let i = 0; i < N; i++) { const tb = (i % B) / SR; d[i] += sc[i] * (1 - 0.7 * Math.exp(-tb / 0.075)); d[i] = Math.tanh(d[i] * 1.1); peak = Math.max(peak, Math.abs(d[i])); }
    const k = 0.9 / (peak || 1);
    for (let i = 0; i < N; i++) d[i] *= k;
    return (houseData = { d, SR });
  }
  function buildHouseLoop() {
    const h = synthHouse(), buf = actx.createBuffer(1, h.d.length, h.SR);
    if (buf.copyToChannel) buf.copyToChannel(h.d, 0); else buf.getChannelData(0).set(h.d);
    return buf;
  }
  // pre-render the loop while the guest reads the landing screen
  setTimeout(() => { try { synthHouse(); } catch (e) {} }, 1200);
  function applyMusicLevel() { if (musicGain && actx) musicGain.gain.setTargetAtTime(muted ? 0 : MUSIC_VOL * musicLevel, actx.currentTime, 0.3); }
  function setMusicLevel(l) { if (l === musicLevel) return; musicLevel = l; applyMusicLevel(); }
  function startMusic() {
    if (!actx || musicSrc || musicStarting) return;
    musicStarting = true;
    setTimeout(() => {
      try {
        if (!musicBuf) musicBuf = buildHouseLoop();
        musicGain = actx.createGain(); musicGain.gain.value = 0; musicGain.connect(master);
        const src = actx.createBufferSource(); src.buffer = musicBuf; src.loop = true; src.connect(musicGain);
        musicT0 = actx.currentTime + 0.05; src.start(musicT0); musicSrc = src; applyMusicLevel();
      } catch (e) {}
      musicStarting = false;
    }, 30);
  }
  // beats since the music started (falls back to a free-running clock), used to sync dancers and lights
  function musicBeat() {
    if (actx && musicSrc) return Math.max(0, (actx.currentTime - ((actx.outputLatency || 0) + (actx.baseLatency || 0)) - musicT0) / BEAT);
    return performance.now() / 1000 / BEAT;
  }
  function musicTick() { if (actx && !musicSrc) startMusic(); }

  /* ================= VOICE CLIPS (offline Kokoro TTS) ================= */
  const HUNK_LINES = [["pu_baby", "Heyyy, baby."], ["pu_sign", "What's your sign?"], ["pu_around", "You from around here?"], ["pu_friend", "Who's your friend?"],
    ["pu_often", "Come here often?"], ["pu_gorgeous", "Hey, gorgeous."], ["pu_veil", "Nice veil."], ["pu_dance", "One dance?"], ["pu_sugar", "Lookin' good, sugar."],
    ["pu_call", "Call me."], ["hunk_dance", "Wanna dance, darling?"], ["hunk_floor", "Bride on the floor!"], ["hunk_last", "I'm your last chance, baby!"]];
  const OW_LINES = [["hunk_ow", "Ow! My face!"], ["hunk_ouch", "Ouch! Worth it!"]];
  const MOH_SLAP = [["moh_romeo", "Not today, Romeo!"], ["moh_hands", "Hands off the bride!"], ["moh_coming", "You had it coming!"]];
  const MOH_BUBBLY = ["moh_bubbly", "Pop the bubbly!"], MOH_HYDRA = ["moh_hydra", "Ahh, hydration!"];
  const BOSS_LINE = ["hunk_sexy", "Did somebody order Mr. Sexy?"], BRIDE_HELP = ["bride_help", "Help! Bridesmaid!"], BRIDE_WOO = ["bride_woo", "Whoo! Girls night!"];
  const VOICE_NAMES = [...HUNK_LINES, ...OW_LINES, ...MOH_SLAP, MOH_BUBBLY, MOH_HYDRA, BOSS_LINE, BRIDE_HELP, BRIDE_WOO].map((l) => l[0]);
  const vraw = {}, vbuf = {}, vch = { hunk: null, moh: null, bride: null };
  const vcd = { hunk: 2.0, ow: 0, moh: 2.0, lastHunk: "", lastMoh: "" };
  VOICE_NAMES.forEach((n) => { vraw[n] = fetch("./audio/" + n + ".mp3").then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null); });
  let voicesDecoding = false;
  function decodeVoices() {
    if (voicesDecoding || !actx) return; voicesDecoding = true;
    VOICE_NAMES.forEach((n) => vraw[n].then((ab) => { if (!ab) return; try { const pr = actx.decodeAudioData(ab, (b) => (vbuf[n] = b), () => {}); if (pr && pr.then) pr.then((b) => (vbuf[n] = b)).catch(() => {}); } catch (e) {} }));
  }
  function playVoice(ch, name, rate, vol, force) {
    if (!actx || muted || !vbuf[name]) return false;
    const cur = vch[ch];
    if (cur && actx.currentTime < cur.end) { if (!force || (force === 2 && cur.pri === 2)) return false; try { cur.src.stop(); } catch (e) {} }
    const src = actx.createBufferSource(), g = actx.createGain();
    src.buffer = vbuf[name]; src.playbackRate.value = rate || 1; g.gain.value = vol || 1.4;
    src.connect(g); g.connect(master); src.start();
    vch[ch] = { src, pri: force === 2 ? 2 : 1, end: actx.currentTime + vbuf[name].duration / (rate || 1) };
    window.__voiceLog = (window.__voiceLog || []).concat(name);
    return true;
  }
  const pickLine = (arr, last) => { let l; for (let i = 0; i < 4; i++) { l = arr[(Math.random() * arr.length) | 0]; if (l[0] !== last) break; } return l; };
  function hunkRate(e) { if (!e.vp) e.vp = e.type === "boss" ? 0.9 : e.type === "dasher" ? rand(1.04, 1.1) : rand(0.92, 1.02); return e.vp; }
  function voiceTick(dt) {
    vcd.hunk -= dt; vcd.ow -= dt; vcd.moh -= dt;
    const s = state; if (!s || s.phase !== "play" || vcd.hunk > 0) return;
    let best = null, bd = 1e9;
    s.hunks.forEach((e) => { if (e.state === "spun") return; const d = Math.hypot(e.x - s.p.x, e.y - s.p.y); if (d < bd) { bd = d; best = e; } });
    if (!best || bd > 9 * T) return;
    const l = pickLine(HUNK_LINES, vcd.lastHunk);
    if (playVoice("hunk", l[0], hunkRate(best), 1.35)) { vcd.lastHunk = l[0]; best.say = l[1]; best.sayT = 2.0; vcd.hunk = rand(2.6, 4.2); }
    else { best.say = l[1]; best.sayT = 1.8; vcd.lastHunk = l[0]; vcd.hunk = rand(2.6, 4.2); }
  }
  function voiceOw(e) {
    if (vcd.ow > 0 || Math.random() > 0.55) return;
    const l = pickLine(OW_LINES, "");
    playVoice("hunk", l[0], hunkRate(e), 1.25, true); e.say = l[1]; e.sayT = 1.2; vcd.ow = 2.2; vcd.hunk = Math.max(vcd.hunk, 1.4);
  }
  function mohSay(line, force) { playVoice("moh", line[0], 1, 1.6, force ? 2 : 0); vcd.moh = force ? 4 : rand(4.5, 7); state.mohSay = line[1]; state.mohSayT = 1.8; }
  function voiceMohSlap() { if (vcd.moh > 0 || Math.random() > 0.5) return; const l = pickLine(MOH_SLAP, vcd.lastMoh); vcd.lastMoh = l[0]; mohSay(l, false); }
  function brideSay(line, txt) { playVoice("bride", line[0], 1, 1.4, true); state.bride.say = txt || line[1]; state.bride.sayT = 1.8; }

  /* ================= MAP: neon nightclub ================= */
  const T = 48;
  const MAP = [
    "########################",
    "########################",
    "########################",
    "#vvvv#o..o..o...sssssk##",
    "#vvvvr..........ssssss##",
    "#vvvvr................##",
    "#vvvvr................##",
    "#vvvv#t..t..t.........##",
    "################......=#",
    "################.....i=#",
    "################......=#",
    "################.....i=#",
    "################......=#",
    "################......=#",
    "###k...................#",
    "###....................#",
    "###...dddddddddddd.....#",
    "###...dddddddddddd.....#",
    "###...dddddddddddd.....#",
    "###...dddddddddddd.....#",
    "###...dddddddddddd.....#",
    "###...dddddddddddd.....#",
    "###k.................k.#",
    "##########....##########",
    "##########....##########",
    "##########....##########",
    "########################",
  ];
  const MW = 24, MH = MAP.length;
  const F = 0, W = 1, DANCE = 2, STAGE = 3, VIPF = 4, ROPE = 5, BAR = 6, SOFA = 7, TABLE = 8, SPEAK = 9, STOOL = 10;
  const CHM = { "#": W, ".": F, d: DANCE, s: STAGE, v: VIPF, r: ROPE, "=": BAR, o: SOFA, t: TABLE, k: SPEAK, i: STOOL };
  const grid = new Uint8Array(MW * MH);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) grid[y * MW + x] = CHM[MAP[y][x]] !== undefined ? CHM[MAP[y][x]] : W;
  const gAt = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH ? W : grid[y * MW + x]);
  const isWallV = (v) => v === W || v === BAR;
  const walkV = (v) => v === F || v === DANCE || v === STAGE || v === VIPF || (v === ROPE && !!(state && state.ropeOpen));
  function solidTile(x, y) { return !walkV(gAt(x, y)); }
  const openV = (v) => !isWallV(v);
  // spawn curtains (wall x, wall y, face): face = side of the wall the floor is on
  const doors = [[2, 17, "E"], [2, 20, "E"], [5, 23, "N"], [17, 23, "N"], [22, 16, "W"], [22, 19, "W"], [6, 13, "S"], [11, 13, "S"],
    [15, 9, "E"], [15, 12, "E"], [8, 2, "S"], [13, 2, "S"], [8, 8, "N"], [11, 8, "N"], [9, 24, "E"], [14, 24, "W"]].map(([x, y, face], i) => {
    const d = { E: [1, 0], W: [-1, 0], S: [0, 1], N: [0, -1] }[face];
    return { x, y, face, sx: (x + d[0]) * T + T / 2, sy: (y + d[1]) * T + T / 2, open: 0, i };
  });
  const WP = [
    { x: 11.5, y: 21.2 }, { x: 11.5, y: 18.5, hold: 7, label: "Dance floor" }, { x: 18.8, y: 17.0 },
    { x: 18.8, y: 10.5, hold: 5, label: "Shots at the bar" }, { x: 18.5, y: 4.3, hold: 5, label: "Karaoke" },
    { x: 9.2, y: 5.0, rope: true }, { x: 2.8, y: 5.0, vip: true },
  ];
  const CPS = [
    { b: [11.5, 21.2], wp: 1, p: [11.5, 23.9], a: -Math.PI / 2 },
    { b: [11.5, 18.5], wp: 2, p: [11.0, 21.0], a: -1.2 },
    { b: [18.8, 10.5], wp: 4, p: [18.8, 13.3], a: -Math.PI / 2 },
    { b: [18.5, 4.3], wp: 5, p: [18.7, 7.2], a: -Math.PI / 2 },
  ];
  const HT = {
    hunk: { hp: 2, speed: 96, r: 15, rate: 12, dmg: 8, scale: 1 },
    dasher: { hp: 1, speed: 166, r: 14, rate: 9, dmg: 6, scale: 0.96 },
    talker: { hp: 5, speed: 72, r: 16, rate: 9, dmg: 5, scale: 1.04 },
    grabber: { hp: 3, speed: 106, r: 16, rate: 26, dmg: 10, scale: 1.08 },
    boss: { hp: 30, speed: 60, r: 24, rate: 22, dmg: 14, scale: 1.42 },
  };
  const SKIN = ["#f2c7a5", "#d9a074", "#a8693f", "#7a4a2a", "#f5d6bd"];
  const SAYS = ["Hey baby.", "One dance?", "Nice veil.", "Call me.", "Come here often?"];
  const SUPER_TIME = 5;

  /* ================= STATE ================= */
  const canvas = $("stage"), ctx = canvas.getContext("2d");
  let cssW = 390, cssH = 700, dpr = 1, vignette = null;
  let state = null, raf = 0, last = 0, fails = 0, easy = false, running = false, playedIntro = false;
  const isTouch = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  const cam = { x: 0, y: 0, z: 38, ang: 0, pitch: 0 };

  function newState(cpi) {
    const cp = CPS[cpi || 0];
    return {
      phase: "play", t: 0, paused: false, cpi: cpi || 0,
      p: { x: cp.p[0] * T, y: cp.p[1] * T, r: 13, hp: 100, ang: cp.a, inv: 1.2, slapCD: 0, slapT: 0, slapHit: false, slapSide: 1, superT: 0, foamT: 0, sprayT: 0,
        walk: 0, moving: false, kx: 0, ky: 0, hurtT: 0 },
      bride: { x: cp.b[0] * T, y: cp.b[1] * T, wp: cp.wp, hold: 0, holdMax: 1, state: "dance", carrier: null, danger: 0, dph: 0, say: "", sayT: 0, waiting: false, warnT: 0 },
      hunks: [], foams: [], roses: [], parts: [], pops: [], pickups: [], spawnT: 2.2, slapped: 0, boss: null, ropeOpen: false, ropeAnim: 0,
      shake: 0, hintT: 6, superFlash: 0, fail: null, win: null, intro: null, mohSay: "", mohSayT: 0,
      flow: new Int16Array(MW * MH), flowTile: -1, bossSpawned: false,
    };
  }
  function placePickups(s) {
    const add = (type, x, y) => s.pickups.push({ type, x: x * T, y: y * T, bob: Math.random() * 6 });
    const cpY = CPS[s.cpi].b[1];
    [[7.5, 20.5], [16.5, 15.4], [20.5, 13.2], [17.2, 9.6], [20.5, 6.5], [11.0, 5.9], [7.4, 4.4]].forEach(([x, y]) => add("marg", x, y));
    [[13.5, 15.0], [16.7, 8.4], [14.5, 6.4]].forEach(([x, y]) => add("bubbly", x, y));
    if (s.cpi > 0) s.pickups = s.pickups.filter((k) => !(k.y > (cpY + 3) * T && s.cpi >= 2));
  }

  /* ================= INPUT ================= */
  const keys = {};
  const sticks = { move: null };
  let mouse = { x: 0, y: 0, down: false, active: false };
  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code) && !screens.game.hidden) e.preventDefault();
    if (state && (state.phase === "intro" || (state.phase === "fail" && state.fail.t > 1.6))) skipCut();
  });
  window.addEventListener("keyup", (e) => (keys[e.code] = false));
  function canvasPt(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  canvas.addEventListener("pointerdown", (e) => {
    unlockAudio();
    if (state && (state.phase === "intro" || state.phase === "fail")) { if (state.phase === "intro" || state.fail.t > 1.6) skipCut(); return; }
    fpPointerDown(e, canvasPt(e));
  });
  canvas.addEventListener("pointermove", (e) => fpPointerMove(e, canvasPt(e)));
  const endPtr = (e) => fpPointerUp(e);
  canvas.addEventListener("pointerup", endPtr);
  canvas.addEventListener("pointercancel", endPtr);
  canvas.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("gesturestart", (e) => e.preventDefault());

  /* ================= HELPERS ================= */
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sstep = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  function resolveWalls(e, r) {
    const x0 = Math.floor((e.x - r) / T), x1 = Math.floor((e.x + r) / T), y0 = Math.floor((e.y - r) / T), y1 = Math.floor((e.y + r) / T);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (!solidTile(tx, ty)) continue;
      const nx = clamp(e.x, tx * T, tx * T + T), ny = clamp(e.y, ty * T, ty * T + T);
      let dx = e.x - nx, dy = e.y - ny, d = Math.hypot(dx, dy);
      if (d < r) {
        if (d < 0.001) { dx = e.x - (tx * T + T / 2); dy = e.y - (ty * T + T / 2); d = Math.hypot(dx, dy) || 1; e.x += (dx / d) * r; e.y += (dy / d) * r; }
        else { e.x += (dx / d) * (r - d); e.y += (dy / d) * (r - d); }
      }
    }
  }
  function moveBody(e, dx, dy, r) {
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (r * 0.5)));
    for (let i = 0; i < steps; i++) { e.x += dx / steps; e.y += dy / steps; resolveWalls(e, r); }
  }
  function lineOfSight(ax, ay, bx, by) {
    const d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d / 16);
    for (let i = 1; i < n; i++) { const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n; if (isWallV(gAt(Math.floor(x / T), Math.floor(y / T)))) return false; }
    return true;
  }
  function computeFlow() {
    const b = state.bride, pt = Math.floor(b.y / T) * MW + Math.floor(b.x / T);
    if (pt === state.flowTile) return;
    state.flowTile = pt;
    const f = state.flow; f.fill(-1);
    if (pt < 0 || pt >= MW * MH) return;
    const q = new Int16Array(MW * MH); let h = 0, tl = 0;
    f[pt] = 0; q[tl++] = pt;
    while (h < tl) {
      const i = q[h++], x = i % MW, y = (i / MW) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
        const j = ny * MW + nx;
        if (f[j] !== -1 || !walkV(gAt(nx, ny))) continue;
        f[j] = f[i] + 1; q[tl++] = j;
      }
    }
  }
  function gGet(x, y) { if (x < 0 || y < 0 || x >= MW || y >= MH) return -1; return state.flow[y * MW + x]; }
  function flowDist(x, y) { return gGet(Math.floor(x / T), Math.floor(y / T)); }
  function pop(x, y, text, color, size, life) { state.pops.push({ x, y, text, color: color || "#fff", size: size || 16, life: life || 0.9, max: life || 0.9 }); }
  function burst(x, y, kind, n, colors, spd, z) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), s = rand(0.3, 1) * (spd || 160);
      state.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.5, 1.1), max: 1.1,
        kind, color: colors[i % colors.length], rot: rand(0, 6), vr: rand(-8, 8), size: rand(3, 6), z: (z || 40) + rand(-8, 8), vz: rand(-20, 140) });
    }
  }
  function objText() {
    const s = state, b = s.bride;
    if (s.phase === "win") return "She's safe! Into the VIP!";
    if (b.carrier) return "SLAP HIM! He's taking " + BN() + "!";
    if (b.hold > 0) return "\u2728 " + (WP[b.wp].label || "Party time") + "! Guard her " + Math.ceil(b.hold) + "s";
    if (s.ropeOpen) return "Rope's down! Into the VIP!";
    if (s.boss) return "Slap Mr. Sexy off the velvet rope!";
    return ["", "Get " + BN() + " to the dance floor \uD83D\uDC83", "Follow " + BN() + " to the bar \uD83C\uDF78", "Follow " + BN() + " to the bar \uD83C\uDF78", "On to the stage \uD83C\uDFA4", "To the VIP rope!", "Into the VIP!"][b.wp] || "";
  }
  let lastObj = "";
  function setObj() { const t = objText(); if (t !== lastObj) { lastObj = t; $("hud-obj").textContent = t; } }

  /* ================= GAMEPLAY ================= */
  function diffMul() { return (1 + state.bride.wp * 0.05 + Math.min(state.t, 150) * 0.001) * (easy ? 0.78 : 1); }
  function mkHunk(type, x, y, door) {
    const tp = HT[type];
    const hp = tp.hp * (easy && type === "boss" ? 0.5 : 1);
    const nvar = { hunk: 2, dasher: 2, talker: 1, grabber: 2, boss: 1 }[type];
    return { type, x, y, vx: 0, vy: 0, hp, maxHp: hp, r: tp.r, state: "chase", t: 0, flash: 0, walk: rand(0, 6), say: Math.random() < 0.4 ? SAYS[(Math.random() * SAYS.length) | 0] : "",
      sayT: 1.4, vi: (Math.random() * nvar) | 0, door, stun: 0, slaps: 0, spin: 0, alpha: 1, zig: rand(0, 6), da: rand(0, 6.28), roseT: 2, mv0: (Math.random() * 5) | 0, off: Math.random() < 0.5 ? 0 : 2 };
  }
  function spawnHunk(type, near) {
    computeFlow();
    const p = state.p;
    let c = doors.filter((d) => { const fd = flowDist(d.sx, d.sy), pd = Math.hypot(d.sx - p.x, d.sy - p.y); return fd >= 3 && fd <= 13 && pd > 150; });
    if (near) { const c2 = c.filter((d) => flowDist(d.sx, d.sy) <= 8); if (c2.length) c = c2; }
    if (!c.length) return null;
    const d = c[(Math.random() * c.length) | 0];
    const e = mkHunk(type, d.sx, d.sy, d);
    d.open = 1; sfx.door();
    state.hunks.push(e);
    return e;
  }
  function spawnBoss() {
    const e = mkHunk("boss", 6.9 * T, 5.0 * T, doors[10]);
    e.say = "Did somebody order Mr. Sexy?"; e.sayT = 2.6; e.roseT = 2.5;
    state.boss = e; state.bossSpawned = true; state.hunks.push(e);
    sfx.boss(); playVoice("hunk", BOSS_LINE[0], 0.95, 1.6, 2); vcd.hunk = 3;
    pop(6.9 * T, 5 * T, "MR. SEXY!", "#ffcf5a", 24, 2);
  }
  function pickType() {
    const w = state.bride.wp, r = Math.random(), hold = state.bride.hold > 0;
    if (w <= 1) return hold ? (r < 0.5 ? "hunk" : r < 0.78 ? "dasher" : r < 0.9 ? "talker" : "grabber") : (r < 0.65 ? "hunk" : "dasher");
    if (w <= 3) return r < 0.35 ? "hunk" : r < 0.6 ? "dasher" : r < 0.8 ? "grabber" : "talker";
    if (w === 4) return r < 0.3 ? "hunk" : r < 0.55 ? "dasher" : r < 0.8 ? "grabber" : "talker";
    return r < 0.55 ? "hunk" : "dasher";
  }
  function hurt(amount, fromX, fromY) {
    const p = state.p;
    if (state.phase !== "play") return;
    p.hp -= amount * (easy ? 0.5 : 1);
    p.hurtT = 0.35; state.shake = Math.max(state.shake, 6); sfx.hurt();
    if (fromX !== undefined) { const dx = p.x - fromX, dy = p.y - fromY, d = Math.hypot(dx, dy) || 1; p.kx = (dx / d) * 340; p.ky = (dy / d) * 340; }
    if (p.hp <= 0) failRun("moh");
  }
  function failRun(reason) {
    const s = state; if (s.phase !== "play") return;
    s.phase = "fail"; s.fail = { t: 0, reason }; fails++;
    s.p.hp = Math.max(0, s.p.hp); sticks.move = null; fpS.fire = null; fpS.look = null;
    trombone();
    if (fails >= (config.failsBeforeAssist || 3)) { easy = true; $("assist-bar").hidden = false; }
    $("hud-obj").textContent = reason === "moh" ? "The Maid of Honour went down…" : BN() + " got swept away…"; lastObj = "";
  }
  function respawn() {
    const cpi = state.cpi;
    state = newState(cpi); placePickups(state); state.hintT = 2.5;
    pop(state.p.x + Math.cos(state.p.ang) * 80, state.p.y + Math.sin(state.p.ang) * 80, easy ? "Easy mode on!" : "Again! Protect her!", "#ffcf5a", 20, 1.6);
    setObj();
  }
  function skipCut() {
    const s = state; if (!s) return;
    if (s.phase === "intro") endIntro();
    else if (s.phase === "fail" && s.fail.t > 1.6) respawn();
  }
  function hitHunk(e, dmg, kind) {
    const s = state, p = s.p, fr = p.superT > 0;
    if (e.state === "spun") return;
    e.hp -= dmg; e.flash = 0.15;
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
    if (kind === "slap") {
      e.slaps++; fr ? sfx.bigSlap() : sfx.slap(); s.shake = Math.max(s.shake, fr ? 9 : 6); p.slapHit = true; s.slapFlash = 0.09;
      const words = ["SLAP!", "CRACK!", "THWACK!", "SMACK!"];
      pop(e.x, e.y - 10, fr ? "MEGA SLAP!" : words[(Math.random() * words.length) | 0], fr ? "#ff8fd0" : "#fff", fr ? 20 : 17, 0.7);
      burst(e.x - dx / d * 8, e.y - dy / d * 8, "star", fr ? 10 : 6, ["#fff6c0", "#ffffff", "#ff8fd0"], 170, 58 * HT[e.type].scale);
      voiceMohSlap();
    } else { e.slaps = Math.max(e.slaps, 0); burst(e.x, e.y, "foam", 3, ["#fff6e0", "#ffd6ec"], 90, 44); }
    const kb = e.type === "boss" ? (kind === "slap" ? 110 : 40) : kind === "slap" ? 320 : 150;
    e.vx = (dx / d) * kb; e.vy = (dy / d) * kb; e.stun = e.type === "boss" ? 0.12 : kind === "slap" ? 0.45 : 0.2;
    if (e.state === "carry") { const b = s.bride; b.carrier = null; e.state = "chase"; pop(b.x, b.y - 10, "Let her GO!", "#ffcf5a", 18, 1.1); burst(b.x, b.y, "heart", 8, ["#ff5db4", "#ffd6ec"], 120, 50); }
    if (e.state === "dance") e.state = "chase";
    if (e.hp <= 0) spinAway(e);
  }
  function spinAway(e) {
    const s = state, p = s.p;
    if (s.bride.carrier === e) s.bride.carrier = null;
    e.state = "spun"; e.t = 0; e.slaps = Math.max(1, e.slaps);
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
    e.vx = (dx / d) * 360; e.vy = (dy / d) * 360;
    sfx.spin(); s.slapped++; voiceOw(e);
    burst(e.x, e.y, "glitter", e.type === "boss" ? 34 : 12, ["#ffcf5a", "#ffffff", "#ff8fd0", "#7fe7ff"], 240, 50);
    if (e.type === "boss") {
      s.boss = null; s.ropeOpen = true; s.ropeAnim = 1; s.flowTile = -1; sfx.rope(); sfx.cheer();
      pop(5.5 * T, 5 * T, "ROPE'S DOWN!", "#ffcf5a", 24, 2.4);
      s.hunks.forEach((o) => { if (o !== e && o.state !== "spun") spinAway(o); });
      mohSay(MOH_SLAP[2], true);
    } else if (Math.random() < 0.14) s.pickups.push({ type: "marg", x: e.x, y: e.y, bob: 0 });
    else if (Math.random() < 0.04 && !s.pickups.some((k) => k.type === "bubbly")) s.pickups.push({ type: "bubbly", x: e.x, y: e.y, bob: 0 });
  }
  function slapTargets(range, cone) {
    const p = state.p, ca = Math.cos(p.ang), sa = Math.sin(p.ang);
    let best = null, bs = 1e9;
    for (const e of state.hunks) {
      if (e.state === "spun") continue;
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
      if (d > range + e.r) continue;
      const dot = (dx * ca + dy * sa) / d;
      if (dot < cone && d > e.r + 16) continue;
      if (!lineOfSight(p.x, p.y, e.x, e.y)) continue;
      const sc = d * (1.7 - dot) - (e.state === "carry" ? 60 : 0);
      if (sc < bs) { bs = sc; best = e; }
    }
    return best;
  }
  function doSlap() {
    const p = state.p, fr = p.superT > 0;
    p.slapCD = (fr ? 0.15 : 0.3) * (easy ? 0.85 : 1); p.slapT = fr ? 0.13 : 0.2; p.slapSide = -p.slapSide; p.slapHit = false;
    const t = slapTargets(fr ? 112 : 98, 0.42);
    if (!t) { sfx.whiff(); return; }
    hitHunk(t, fr ? 2 : 1, "slap");
  }
  function updateFoam(dt, firing) {
    const s = state, p = s.p;
    if (p.superT > 0 && firing) {
      p.foamT -= dt; p.sprayT -= dt;
      while (p.foamT <= 0) {
        p.foamT += 0.045;
        const a = p.ang + rand(-0.09, 0.09), sp = rand(420, 500);
        s.foams.push({ x: p.x + Math.cos(p.ang) * 10, y: p.y + Math.sin(p.ang) * 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.6, t: 0, z: EYE - 12 + rand(-3, 3), hit: new Set(), sz: rand(0.8, 1.3) });
      }
      if (p.sprayT <= 0) { p.sprayT = 0.14; sfx.spray(); }
    }
    for (let i = s.foams.length - 1; i >= 0; i--) {
      const f = s.foams[i]; f.x += f.vx * dt; f.y += f.vy * dt; f.life -= dt; f.t += dt; f.z += 10 * dt;
      let dead = f.life <= 0 || isWallV(gAt(Math.floor(f.x / T), Math.floor(f.y / T)));
      if (!dead) for (const e of s.hunks) {
        if (e.state === "spun" || f.hit.has(e)) continue;
        if (Math.hypot(e.x - f.x, e.y - f.y) < e.r + 12) { f.hit.add(e); hitHunk(e, e.type === "boss" ? 0.3 : 0.4, "foam"); if (f.hit.size > 1) { dead = true; break; } }
      }
      if (dead) { if (f.life > 0) burst(f.x, f.y, "foam", 2, ["#fff6e0"], 60, f.z); s.foams.splice(i, 1); }
    }
  }

  function update(dt) {
    const s = state, p = s.p;
    s.t += dt;
    musicTick(dt);
    doors.forEach((d) => (d.open = Math.max(0, d.open - dt * 1.4)));
    s.shake = Math.max(0, s.shake - dt * 30);
    s.superFlash = Math.max(0, s.superFlash - dt);
    s.slapFlash = Math.max(0, (s.slapFlash || 0) - dt);
    if (s.ropeAnim > 0) s.ropeAnim = Math.max(0, s.ropeAnim - dt * 0.8);
    if (s.phase === "intro") { updateIntro(dt); updateFx(dt); return; }
    if (s.phase === "fail") { s.fail.t += dt; failSounds(s.fail.t - dt, s.fail.t); if (s.fail.t > 5.2) respawn(); return; }
    if (s.phase === "win") { updateWin(dt); updateFx(dt); return; }
    voiceTick(dt); if (s.mohSayT > 0) s.mohSayT -= dt;
    if (s.hintT > 0) s.hintT -= dt;

    // movement
    let fw = 0, st = 0, turn = 0;
    if (keys.KeyW || keys.ArrowUp) fw += 1; if (keys.KeyS || keys.ArrowDown) fw -= 1;
    if (keys.KeyA) st -= 1; if (keys.KeyD) st += 1;
    if (keys.ArrowLeft || keys.KeyQ) turn -= 1; if (keys.ArrowRight || keys.KeyE) turn += 1;
    if (sticks.move) { fw = -(sticks.move.y - sticks.move.oy) / 56; st = (sticks.move.x - sticks.move.ox) / 56; }
    p.ang += turn * 2.6 * dt;
    const c = Math.cos(p.ang), sn = Math.sin(p.ang);
    let mx = c * fw - sn * st, my = sn * fw + c * st;
    let ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; ml = 1; }
    if (ml < 0.12) { mx = my = 0; ml = 0; }
    const speed = 182;
    moveBody(p, mx * speed * dt + p.kx * dt, my * speed * dt + p.ky * dt, p.r);
    p.kx *= Math.pow(0.002, dt); p.ky *= Math.pow(0.002, dt);
    p.moving = ml > 0; if (p.moving) p.walk += dt * 11 * ml;
    fpS.bob = p.moving ? Math.sin(p.walk) * 2.6 : 0;

    // slap
    const firing = !!fpS.fire || (mouse.down && !isTouch) || !!keys.Space;
    if (firing) { const t = slapTargets(280, 0.72); if (t) { let da = Math.atan2(t.y - p.y, t.x - p.x) - p.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); p.ang += clamp(da, -2.6 * dt, 2.6 * dt); } }
    p.slapCD -= dt; p.slapT = Math.max(0, p.slapT - dt); p.inv -= dt; p.hurtT -= dt;
    if (firing && p.slapCD <= 0) doSlap();
    if (p.superT > 0) { p.superT = Math.max(0, p.superT - dt); if (p.superT === 0) pop(p.x + c * 60, p.y + sn * 60, "Bubbly's gone!", "#ffd6ec", 14, 1.1); }
    updateFoam(dt, firing);

    computeFlow();
    updateBride(dt);
    if (s.phase !== "play") { updateFx(dt); return; }
    updateHunks(dt);
    if (s.phase !== "play") { updateFx(dt); return; }
    updateRoses(dt);

    // spawns
    const b = s.bride, hold = b.hold > 0;
    s.spawnT -= dt;
    const alive = s.hunks.filter((e) => e.state !== "spun" && e.type !== "boss").length;
    const maxA = Math.round(([0, 4, 4, 5, 5, 3, 0][b.wp] + (hold ? 2 : 0)) * (easy ? 0.6 : 1));
    if (s.spawnT <= 0 && !s.ropeOpen) {
      if (alive < maxA) spawnHunk(pickType());
      s.spawnT = ([1.8, 1.7, 1.55, 1.45, 1.35, 2.0, 9][b.wp] || 1.6) * (hold ? 0.72 : 1) * (easy ? 1.6 : 1);
    }
    // pickups
    for (let i = s.pickups.length - 1; i >= 0; i--) {
      const k = s.pickups[i]; k.bob += dt * 4;
      if (Math.hypot(k.x - p.x, k.y - p.y) < 30) {
        s.pickups.splice(i, 1);
        const fx = p.x + c * 50, fy = p.y + sn * 50;
        if (k.type === "marg") {
          p.hp = Math.min(100, p.hp + 35); sfx.marg(); mohSay(MOH_HYDRA, true);
          pop(fx, fy, "+35 MARGARITA", "#b8ff6a", 16, 1.0);
        } else {
          p.superT = SUPER_TIME; s.superFlash = 0.5; sfx.pop(); mohSay(MOH_BUBBLY, true);
          pop(fx, fy, "POP! SLAP FRENZY 5s", "#ff8fd0", 18, 1.3);
          burst(fx, fy, "foam", 16, ["#fff6e0", "#ffd6ec", "#ffffff"], 200, 40);
        }
      }
    }
    // danger warning beeps
    if (b.danger > 65) { b.warnT -= dt; if (b.warnT <= 0) { sfx.warn(); b.warnT = b.danger > 85 ? 0.22 : 0.4; } }
    setObj();
    updateFx(dt);
  }
  function updateBride(dt) {
    const s = state, b = s.bride, p = s.p;
    b.dph += dt * (b.carrier ? 16 : 7.5); b.sayT -= dt;
    if (b.carrier) { b.state = "grabbed"; return; }
    const wp = WP[b.wp]; if (!wp) return;
    if (b.hold > 0) {
      b.state = "dance";
      b.hold -= dt * (s.hunks.some((e) => e.state === "dance") ? 0.5 : 1);
      if (b.hold <= 0) {
        b.hold = 0; b.wp++;
        s.cpi = b.wp === 2 ? 1 : b.wp === 4 ? 2 : b.wp === 5 ? 3 : s.cpi;
        pop(b.x, b.y - 10, "Checkpoint!", "#7fe7ff", 16, 1.2);
        if (b.wp === 5 && !s.bossSpawned) spawnBoss();
      }
      return;
    }
    if (wp.rope && !s.ropeOpen && Math.hypot(b.x - wp.x * T, b.y - wp.y * T) < 8) { b.state = "dance"; return; }
    const pd = Math.hypot(p.x - b.x, p.y - b.y);
    if (!b.waiting && pd > 4.6 * T) { b.waiting = true; b.say = "Wait up, girl!"; b.sayT = 1.8; }
    if (b.waiting && pd < 3.0 * T) b.waiting = false;
    if (b.waiting) { b.state = "dance"; return; }
    const tx = wp.x * T, ty = wp.y * T, dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy);
    const slow = s.hunks.some((e) => e.state === "dance") ? 0.35 : 1;
    const sp = 66 * slow * (wp.vip ? 1.5 : 1);
    if (d < 6) {
      if (wp.vip) { startWin(); return; }
      if (wp.hold) {
        b.hold = b.holdMax = wp.hold * (easy ? 0.7 : 1);
        brideSay(BRIDE_WOO, b.wp === 1 ? "Whoo! Girls night!" : b.wp === 3 ? "Shots! Shots!" : "Karaoke time!");
        burst(b.x, b.y, "confetti", 20, ["#ff5db4", "#7fe7ff", "#ffcf5a", "#b98cff"], 200, 60);
        for (let i = 0; i < (easy ? 1 : 2); i++) spawnHunk(pickType(), true);
      } else b.wp++;
      return;
    }
    b.state = "walk";
    moveBody(b, (dx / d) * Math.min(sp * dt, d), (dy / d) * Math.min(sp * dt, d), 12);
  }
  function updateHunks(dt) {
    const s = state, p = s.p, b = s.bride, dm = diffMul();
    let rate = 0;
    for (const e of s.hunks) {
      const tp = HT[e.type];
      e.t += dt; e.flash -= dt; e.sayT -= dt;
      if (e.state === "spun") { e.x += e.vx * dt; e.y += e.vy * dt; e.vx *= Math.pow(0.3, dt); e.vy *= Math.pow(0.3, dt); e.spin += dt * 16; e.alpha = Math.max(0, 1 - e.t / 1.15); continue; }
      if (e.stun > 0) { e.stun -= dt; moveBody(e, e.vx * dt, e.vy * dt, e.r * 0.8); e.vx *= Math.pow(0.02, dt); e.vy *= Math.pow(0.02, dt); continue; }
      if (e.state === "dance") {
        if (b.carrier && b.carrier !== e) { e.state = "chase"; continue; }
        e.da += dt * 1.2; const tx = b.x + Math.cos(e.da) * 26, ty = b.y + Math.sin(e.da) * 26;
        e.x += (tx - e.x) * Math.min(1, dt * 6); e.y += (ty - e.y) * Math.min(1, dt * 6); resolveWalls(e, e.r * 0.7);
        e.walk += dt * 9; rate += tp.rate;
        if (e.sayT < -1.5 && Math.random() < dt * 0.6) { e.say = ["Let's dance!", "Shake it!", "Woo!"][(Math.random() * 3) | 0]; e.sayT = 1.2; }
        continue;
      }
      if (e.state === "carry") {
        const dd = e.door, tx = dd.sx, ty = dd.sy, dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy) || 1;
        const sp = (e.type === "boss" ? 34 : 48) * (easy ? 0.75 : 1);
        moveBody(e, dx / d * sp * dt, dy / d * sp * dt, e.r * 0.8);
        b.x = e.x + Math.cos(e.walk) * 2; b.y = e.y; e.walk += dt * 10;
        rate += tp.rate;
        if (d < 14) { b.danger = 100; failRun("carried"); return; }
        continue;
      }
      // chase bride via flow field
      const dx = b.x - e.x, dy = b.y - e.y, d = Math.hypot(dx, dy) || 1;
      let gx = dx / d, gy = dy / d;
      if (d > 90 || !lineOfSight(e.x, e.y, b.x, b.y)) {
        const ex = Math.floor(e.x / T), ey = Math.floor(e.y / T), here = gGet(ex, ey);
        let best = here, bx = ex, by = ey;
        for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const v = gGet(ex + ox, ey + oy); if (v >= 0 && (best < 0 || v < best)) { best = v; bx = ex + ox; by = ey + oy; } }
        if (bx !== ex || by !== ey) { const tx = bx * T + T / 2 - e.x, ty = by * T + T / 2 - e.y, tl = Math.hypot(tx, ty) || 1; gx = tx / tl; gy = ty / tl; }
      }
      const sp = tp.speed * dm;
      if (e.type === "dasher") { const z = Math.sin(e.t * 5 + e.zig) * 0.5; const nx = -gy, ny = gx; gx += nx * z; gy += ny * z; const l = Math.hypot(gx, gy); gx /= l; gy /= l; }
      if (e.type === "talker" && e.sayT > 0.6) { gx *= 0.3; gy *= 0.3; }
      e.vx += (gx * sp - e.vx) * Math.min(1, dt * 6); e.vy += (gy * sp - e.vy) * Math.min(1, dt * 6);
      for (const o of s.hunks) {
        if (o === e || o.state !== "chase") continue;
        const ox = e.x - o.x, oy = e.y - o.y, od = Math.hypot(ox, oy);
        if (od > 0 && od < e.r + o.r) { e.x += (ox / od) * (e.r + o.r - od) * 0.5; e.y += (oy / od) * (e.r + o.r - od) * 0.5; }
      }
      moveBody(e, e.vx * dt, e.vy * dt, e.r * 0.8);
      e.walk += dt * (e.type === "dasher" ? 13 : 10);
      // body block by the MOH
      const px = e.x - p.x, py = e.y - p.y, pdd = Math.hypot(px, py) || 1;
      if (pdd < e.r + p.r) {
        e.x = p.x + px / pdd * (e.r + p.r); e.y = p.y + py / pdd * (e.r + p.r); resolveWalls(e, e.r * 0.8);
        if (p.inv <= 0) { hurt(tp.dmg, e.x, e.y); p.inv = 0.8; e.vx = px / pdd * 160; e.vy = py / pdd * 160; e.stun = 0.25; e.say = e.type === "boss" ? "Easy, tiger!" : "Hey, I'm not here for YOU!"; e.sayT = 1.0; if (s.phase !== "play") return; }
      }
      // boss roses
      if (e.type === "boss") {
        e.roseT -= dt;
        if (e.roseT <= 0 && pdd < 460 && lineOfSight(e.x, e.y, p.x, p.y)) {
          const n = e.hp < e.maxHp * 0.5 ? 3 : 1, base = Math.atan2(p.y - e.y, p.x - e.x);
          for (let i = 0; i < n; i++) { const a = base + (i - (n - 1) / 2) * 0.26; s.roses.push({ x: e.x, y: e.y, vx: Math.cos(a) * 230, vy: Math.sin(a) * 230, life: 2.4, t: 0 }); }
          sfx.rose(); e.roseT = easy ? 2.6 : 1.7; e.say = ["For you, darling!", "Catch!", "*wink*"][(Math.random() * 3) | 0]; e.sayT = 0.9;
        }
        if (!e.half && e.hp < e.maxHp * 0.5) { e.half = true; s.pickups.push({ type: "bubbly", x: 12.5 * T, y: 5.6 * T, bob: 0 }); pop(12.5 * T, 5.6 * T, "Champagne!", "#ff8fd0", 16, 1.4); for (let i = 0; i < (easy ? 1 : 2); i++) spawnHunk("hunk", true); }
      }
      // reach the bride
      if (d < e.r + 14 && s.phase === "play") {
        if ((e.type === "grabber" || e.type === "boss") && !b.carrier) {
          e.state = "carry"; b.carrier = e; e.say = e.type === "boss" ? "She's coming with me!" : "Gotcha, princess!"; e.sayT = 1.6; sfx.grab(); brideSay(BRIDE_HELP);
          if (e.type === "boss" || !e.door) e.door = doors[11];
        } else { e.state = "dance"; e.da = Math.atan2(e.y - b.y, e.x - b.x); e.say = ["Let's dance!", "One dance?", "Bride on the floor!"][(Math.random() * 3) | 0]; e.sayT = 1.3; }
      }
    }
    s.hunks = s.hunks.filter((e) => !(e.state === "spun" && e.t > 1.15));
    if (rate > 0) b.danger = Math.min(100, b.danger + rate * dt * (easy ? 0.55 : 1));
    else b.danger = Math.max(0, b.danger - 7 * dt);
    if (b.danger >= 100) failRun("stolen");
  }
  function updateRoses(dt) {
    const s = state, p = s.p;
    for (let i = s.roses.length - 1; i >= 0; i--) {
      const k = s.roses[i]; k.x += k.vx * dt; k.y += k.vy * dt; k.life -= dt; k.t += dt;
      let dead = k.life <= 0 || isWallV(gAt(Math.floor(k.x / T), Math.floor(k.y / T)));
      if (!dead && Math.hypot(k.x - p.x, k.y - p.y) < 22) {
        dead = true; if (p.inv <= 0) { hurt(9); p.inv = 0.4; pop(p.x + Math.cos(p.ang) * 50, p.y + Math.sin(p.ang) * 50, "*SWOON*", "#ff5d8f", 16, 0.7); }
      }
      if (dead) s.roses.splice(i, 1);
    }
  }
  function updateFx(dt) {
    const s = state;
    for (let i = s.parts.length - 1; i >= 0; i--) {
      const q = s.parts[i]; q.life -= dt;
      if (q.life <= 0) { s.parts.splice(i, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
      q.vz -= (q.kind === "confetti" ? 60 : 200) * dt; q.z = Math.max(1, q.z + q.vz * dt);
      q.vx *= Math.pow(0.08, dt); q.vy *= Math.pow(0.08, dt);
    }
    for (let i = s.pops.length - 1; i >= 0; i--) { const q = s.pops[i]; q.life -= dt; if (q.life <= 0) s.pops.splice(i, 1); }
  }

  /* ================= WIN (in-world part) ================= */
  function startWin() {
    const s = state;
    if (s.phase !== "play") return;
    s.phase = "win"; s.win = { t: 0, scene: false, wiped: false };
    sticks.move = null; fpS.fire = null;
    $("assist-bar").hidden = true;
    sfx.cheer(); brideSay(BRIDE_WOO, "VIP, baby!");
    burst(s.bride.x, s.bride.y, "confetti", 40, ["#ff5db4", "#7fe7ff", "#ffcf5a", "#b98cff", "#ffffff"], 260, 70);
    setObj();
  }
  function updateWin(dt) {
    const s = state, w = s.win, p = s.p, b = s.bride;
    w.t += dt;
    b.dph += dt * 9;
    if (b.x > 2.6 * T) b.x -= 60 * dt;
    const ta = Math.atan2(b.y - p.y, b.x - p.x); let da = ta - p.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); p.ang += da * Math.min(1, dt * 4);
    if (w.t < 1.4 && Math.random() < dt * 8) burst(b.x + rand(-30, 30), b.y + rand(-30, 30), "confetti", 6, ["#ff5db4", "#7fe7ff", "#ffcf5a", "#b98cff"], 150, 90);
    if (w.t > 1.5 && !w.scene) { w.scene = true; w.g = 0; sfx.pop(); setTimeout(() => sfx.cheer(), 250); }
    if (w.scene) { w.g += dt; if (w.g > 4.3 && !w.wiped) { w.wiped = true; wipeToReveal(); } }
  }
  function wipeToReveal() {
    const wipe = $("wipe");
    wipe.className = ""; void wipe.offsetWidth; wipe.className = "cover";
    setTimeout(() => {
      stopLoop(); showScreen("reveal");
      wipe.className = "out";
      setTimeout(() => (wipe.className = ""), 700);
    }, 620);
  }

  /* ================= FIRST-PERSON: TEXTURES ================= */
  const WALL_H = 110, EYE = 38, FOVH = 1.2, TANF = Math.tan(FOVH / 2), TEX = 128, TEXK = TEX / T, LMS = 6;
  const FOGC = [20, 8, 30], FOG0 = 70, FOG1 = 640;
  const TIERS = [0.8, 0.6, 0.45];
  const qp = /[?&]q=(\d)/.exec(location.search);
  const fpS = { tier: qp ? +qp[1] : (isTouch ? 1 : 0), lockTier: !!qp, IW: 0, IH: 0, buf: null, img: null, cv: null, cx: null, z: null,
    tex: null, ft: 0, fn: 0, look: null, fire: null, bob: 0, hor: 0, proj: 0 };
  const mkC = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function mix(h1, h2, a) {
    const p = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const A = p(h1), B = p(h2); return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * a)).join(",") + ")";
  }
  function noiseFx(g, w, h, a) { const id = g.getImageData(0, 0, w, h), d = id.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * a; d[i] += n; d[i + 1] += n; d[i + 2] += n; } g.putImageData(id, 0, 0); }
  function makeTex(w, h, draw, emis) {
    const c = mkC(w, h), g = c.getContext("2d"); draw(g, w, h);
    const id = g.getImageData(0, 0, w, h);
    for (let i = 3; i < id.data.length; i += 4) id.data[i] = 255;
    if (emis) { const m = mkC(w, h), mg = m.getContext("2d"); emis(mg, w, h); const md = mg.getImageData(0, 0, w, h).data; for (let i = 3; i < md.length; i += 4) if (md[i] > 90) id.data[i] = 254; }
    return { w, h, d: new Uint32Array(id.data.buffer) };
  }
  function neonText(g, text, x, y, size, col, glow) {
    g.save(); g.font = "900 " + size + "px 'Avenir Next', 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    if (glow) { g.shadowColor = col; g.shadowBlur = 10; }
    g.lineWidth = 3; g.strokeStyle = col; g.strokeText(text, x, y); g.fillStyle = "#fff"; g.fillText(text, x, y); g.restore();
  }
  function wallBase(g, w, h, hue) {
    g.fillStyle = hue || "#2a1238"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#120618"; g.fillRect(0, 0, w, 6);
    for (let x = 0; x < w; x += 32) {
      const pg = g.createLinearGradient(x, 0, x + 32, 0); pg.addColorStop(0, "rgba(0,0,0,.28)"); pg.addColorStop(0.5, "rgba(255,255,255,.05)"); pg.addColorStop(1, "rgba(0,0,0,.28)");
      g.fillStyle = pg; g.fillRect(x + 2, 52, 28, 60);
      g.fillStyle = "rgba(255,160,230,.13)"; for (let yy = 58; yy < 110; yy += 10) for (let xx = x + 6 + ((yy / 10) % 2) * 5; xx < x + 30; xx += 10) { g.beginPath(); g.arc(xx, yy, 1.4, 0, 7); g.fill(); }
    }
    g.fillStyle = "#0e0414"; g.fillRect(0, 112, w, 16);
    g.fillStyle = "#ff3fae"; g.fillRect(0, 46, w, 3);
    g.fillStyle = "#3fe6ff"; g.fillRect(0, 113, w, 2);
  }
  const wallEmis = (g, w) => { g.fillStyle = "#fff"; g.fillRect(0, 46, w, 3); g.fillRect(0, 113, w, 2); };
  function texWall() { return makeTex(TEX, TEX, (g, w, h) => { wallBase(g, w, h); noiseFx(g, w, h, 8); }, wallEmis); }
  const SIGNS = [["LAST FLING", "#ff4fc0", 15], ["GIRLS NIGHT", "#3fe6ff", 15], ["XOXO", "#b98cff", 24], ["BRIDE", "#ffcf5a", 22], ["\u2665", "#ff3f7a", 34], ["SLAY", "#7dff9a", 24]];
  function texSign(i) {
    const [txt, col, sz] = SIGNS[i % SIGNS.length];
    const draw = (g, glow) => { g.save(); neonText(g, txt, 64, 26, sz, col, glow); g.restore(); };
    return makeTex(TEX, TEX, (g, w, h) => {
      wallBase(g, w, h); noiseFx(g, w, h, 8);
      const rg = g.createRadialGradient(64, 26, 4, 64, 26, 60); rg.addColorStop(0, "rgba(255,255,255,.18)"); rg.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = rg; g.fillRect(0, 0, w, 50);
      draw(g, true);
    }, (g, w) => { wallEmis(g, w); g.font = "900 " + sz + "px 'Avenir Next', 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 3; g.strokeStyle = "#fff"; g.strokeText(txt, 64, 26); g.fillStyle = "#fff"; g.fillText(txt, 64, 26); });
  }
  function texMirror() {
    return makeTex(TEX, TEX, (g, w, h) => {
      wallBase(g, w, h);
      const mg = g.createLinearGradient(0, 8, w, 100); mg.addColorStop(0, "#5a3a7a"); mg.addColorStop(0.45, "#c9a8e8"); mg.addColorStop(0.55, "#7a5a9a"); mg.addColorStop(1, "#3a1a5a");
      g.fillStyle = "#ffcf5a"; rr(g, 18, 8, 92, 100, 8); g.fill(); g.fillStyle = mg; rr(g, 22, 12, 84, 92, 6); g.fill();
      g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(34, 30); g.lineTo(54, 18); g.moveTo(36, 44); g.lineTo(70, 22); g.stroke();
      for (let i = 0; i < 10; i++) { g.fillStyle = "#fff6c0"; g.beginPath(); g.arc(22 + i * 9.3, 9, 2.2, 0, 7); g.fill(); }
      noiseFx(g, w, h, 6);
    }, (g, w) => { wallEmis(g, w); for (let i = 0; i < 10; i++) { g.fillStyle = "#fff"; g.beginPath(); g.arc(22 + i * 9.3, 9, 2.2, 0, 7); g.fill(); } });
  }
  const BOTTLE_COLS = ["#3fe6ff", "#ff4fc0", "#ffcf5a", "#7dff9a", "#b98cff", "#ff7a3d"];
  function texBar() {
    const bottles = [];
    for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) bottles.push({ x: 8 + i * 13.5 + (row % 2) * 4, y: 20 + row * 26, c: BOTTLE_COLS[(i * 5 + row * 2) % 6], hgt: 15 + ((i * 7 + row) % 4) * 2 });
    const bdraw = (g, emisOnly) => bottles.forEach((b) => {
      g.fillStyle = emisOnly ? "#fff" : b.c;
      rr(g, b.x - 3.5, b.y + 22 - b.hgt, 7, b.hgt, 2.5); g.fill(); g.fillRect(b.x - 1.2, b.y + 22 - b.hgt - 6, 2.4, 7);
    });
    return makeTex(TEX, TEX, (g, w, h) => {
      const mg = g.createLinearGradient(0, 0, 0, 92); mg.addColorStop(0, "#1a0a2a"); mg.addColorStop(1, "#4a1a6a");
      g.fillStyle = mg; g.fillRect(0, 0, w, 92);
      for (let row = 0; row < 3; row++) { g.fillStyle = "#ffcf5a"; g.fillRect(0, 42 + row * 26, w, 3); g.fillStyle = "rgba(255,207,90,.25)"; g.fillRect(0, 38 + row * 26, w, 4); }
      bdraw(g, false);
      g.fillStyle = "rgba(255,255,255,.55)"; bottles.forEach((b) => g.fillRect(b.x - 2.3, b.y + 24 - b.hgt, 1.2, b.hgt - 4));
      const cg = g.createLinearGradient(0, 92, 0, 128); cg.addColorStop(0, "#4a2414"); cg.addColorStop(1, "#1e0c06");
      g.fillStyle = cg; g.fillRect(0, 92, w, 36);
      g.fillStyle = "#ffcf5a"; g.fillRect(0, 90, w, 4); g.fillStyle = "#ff3fae"; g.fillRect(0, 98, w, 2);
      for (let x = 0; x < w; x += 16) { g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(x, 102, 1, 26); }
      g.fillStyle = "#d4af37"; g.fillRect(0, 118, w, 3);
      noiseFx(g, w, h, 6);
    }, (g, w) => { bdraw(g, true); g.fillStyle = "#fff"; g.fillRect(0, 98, w, 2); for (let row = 0; row < 3; row++) g.fillRect(0, 42 + row * 26, w, 3); });
  }
  function texCurtain(open) {
    return makeTex(TEX, TEX, (g, w, h) => {
      wallBase(g, w, h); noiseFx(g, w, h, 7);
      g.fillStyle = "#0a0208"; g.fillRect(22, 14, 84, 114);
      g.fillStyle = "#ffcf5a"; g.fillRect(20, 12, 88, 4);
      if (open) {
        const ig = g.createLinearGradient(0, 16, 0, 128); ig.addColorStop(0, "#ff9ad8"); ig.addColorStop(1, "#b0207a");
        g.fillStyle = ig; g.fillRect(40, 16, 48, 112);
        g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.moveTo(52, 16); g.lineTo(76, 16); g.lineTo(88, 128); g.lineTo(40, 128); g.closePath(); g.fill();
      }
      const fold = (x0, x1) => { for (let x = x0; x < x1; x += 6) { const cg = g.createLinearGradient(x, 0, x + 6, 0); cg.addColorStop(0, "#5a0818"); cg.addColorStop(0.5, "#d0203a"); cg.addColorStop(1, "#5a0818"); g.fillStyle = cg; g.fillRect(x, 16, 6, 112); } };
      if (open) { fold(22, 40); fold(88, 106); } else fold(22, 106);
      g.fillStyle = "#ffcf5a"; g.beginPath(); g.arc(open ? 38 : 30, 76, 4, 0, 7); g.arc(open ? 90 : 98, 76, 4, 0, 7); g.fill();
    }, open ? (g) => { g.fillStyle = "#fff"; g.fillRect(40, 16, 48, 112); } : null);
  }
  function texStageWall() {
    return makeTex(TEX, TEX, (g, w, h) => {
      g.fillStyle = "#0c0410"; g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 8) { g.fillStyle = "rgba(120,40,140,.18)"; g.fillRect(x, 0, 4, h); }
      g.save(); g.translate(64, 52); g.scale(1.25, 1.25);
      g.strokeStyle = "#ff3f9a"; g.lineWidth = 4; g.shadowColor = "#ff3f9a"; g.shadowBlur = 8;
      g.beginPath(); g.moveTo(0, 26); g.bezierCurveTo(-34, 4, -30, -26, -10, -24); g.bezierCurveTo(-4, -24, 0, -18, 0, -12); g.bezierCurveTo(0, -18, 4, -24, 10, -24); g.bezierCurveTo(30, -26, 34, 4, 0, 26); g.stroke(); g.restore();
      neonText(g, "LOVE", 64, 108, 16, "#3fe6ff", true);
    }, (g) => {
      g.save(); g.translate(64, 52); g.scale(1.25, 1.25); g.strokeStyle = "#fff"; g.lineWidth = 4;
      g.beginPath(); g.moveTo(0, 26); g.bezierCurveTo(-34, 4, -30, -26, -10, -24); g.bezierCurveTo(-4, -24, 0, -18, 0, -12); g.bezierCurveTo(0, -18, 4, -24, 10, -24); g.bezierCurveTo(30, -26, 34, 4, 0, 26); g.stroke(); g.restore();
      g.font = "900 16px 'Avenir Next', 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#fff"; g.fillText("LOVE", 64, 108);
    });
  }
  function texVip(sign) {
    return makeTex(TEX, TEX, (g, w, h) => {
      g.fillStyle = "#120a06"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(212,175,55,.55)"; g.lineWidth = 1.5;
      for (let x = 0; x < w; x += 32) for (let y = 40; y < 128; y += 32) { for (let r = 6; r <= 16; r += 5) { g.beginPath(); g.arc(x + 16, y + 16, r, Math.PI, 0); g.stroke(); } }
      g.fillStyle = "#d4af37"; g.fillRect(0, 6, w, 3); g.fillRect(0, 120, w, 3);
      if (sign) neonText(g, "VIP", 64, 26, 26, "#ffcf5a", true);
      noiseFx(g, w, h, 6);
    }, sign ? (g) => { g.font = "900 26px 'Avenir Next', 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 3; g.strokeStyle = "#fff"; g.strokeText("VIP", 64, 26); g.fillStyle = "#fff"; g.fillText("VIP", 64, 26); } : null);
  }
  function texClubFloor() {
    return makeTex(TEX, TEX, (g, w, h) => {
      for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
        const tg = g.createLinearGradient(x * 64, y * 64, x * 64 + 64, y * 64 + 64); tg.addColorStop(0, (x + y) % 2 ? "#1c0e26" : "#24122e"); tg.addColorStop(1, (x + y) % 2 ? "#140a1c" : "#1a0c22");
        g.fillStyle = tg; g.fillRect(x * 64, y * 64, 64, 64);
        g.fillStyle = "rgba(255,255,255,.07)"; g.fillRect(x * 64 + 4, y * 64 + 4, 30, 3);
      }
      g.fillStyle = "#08030c"; g.fillRect(0, 0, w, 2); g.fillRect(0, 63, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(63, 0, 2, h);
      for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(255,200,255," + rand(0.1, 0.4) + ")"; g.fillRect(rand(0, w), rand(0, h), 1.3, 1.3); }
      noiseFx(g, w, h, 8);
    });
  }
  function texStageFloor() {
    return makeTex(TEX, TEX, (g, w, h) => {
      for (let y = 0; y < h; y += 16) { const c = ["#3a1a2a", "#44203a", "#3a1830"][(y / 16) % 3]; g.fillStyle = c; g.fillRect(0, y, w, 16); g.fillStyle = "#1a0810"; g.fillRect(0, y, w, 1.5); const o = ((y / 16) * 47) % 128; g.fillRect(o, y, 1.5, 16); }
      noiseFx(g, w, h, 14);
    });
  }
  function texVipFloor() {
    return makeTex(TEX, TEX, (g, w, h) => {
      g.fillStyle = "#5a0a1e"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "#d4af37"; g.lineWidth = 2;
      const dia = (x, y, r) => { g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath(); };
      dia(64, 64, 58); g.stroke(); dia(64, 64, 30); g.stroke();
      g.fillStyle = "#d4af37"; [[0, 0], [128, 0], [0, 128], [128, 128], [64, 64]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); });
      noiseFx(g, w, h, 18);
    });
  }
  function texCeil() {
    return makeTex(64, 64, (g, w, h) => {
      g.fillStyle = "#0c0618"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#1a1028"; g.fillRect(0, 30, w, 4); g.fillRect(30, 0, 4, h);
      for (let i = 0; i < 6; i++) { g.fillStyle = "#fff"; g.fillRect((i * 23) % 60 + 2, (i * 37) % 60 + 2, 2, 2); }
    }, (g) => { for (let i = 0; i < 6; i++) { g.fillStyle = "#fff"; g.fillRect((i * 23) % 60 + 2, (i * 37) % 60 + 2, 2, 2); } });
  }

  /* ---- sprites (pre-rendered, outlined) ---- */
  const SPR = 1.5;
  function outlined(w, h, draw, ow) {
    const a = mkC(w * SPR, h * SPR), ag = a.getContext("2d"); ag.scale(SPR, SPR); ag.lineJoin = "round"; ag.lineCap = "round"; draw(ag);
    const sil = mkC(a.width, a.height), sg = sil.getContext("2d"); sg.drawImage(a, 0, 0); sg.globalCompositeOperation = "source-in"; sg.fillStyle = "#12040e"; sg.fillRect(0, 0, sil.width, sil.height);
    const out = mkC(a.width, a.height), og = out.getContext("2d"); const o = (ow || 2.2) * SPR;
    for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6; og.drawImage(sil, Math.cos(an) * o, Math.sin(an) * o); }
    og.drawImage(a, 0, 0); return out;
  }
  function limb(g, x0, y0, x1, y1, x2, y2, col, w) {
    g.strokeStyle = INK; g.lineWidth = w + 4; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke();
    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke();
  }
  const HC = {
    hunk: [{ pants: "#1b1b24", stripe: "#ffffff", hair: "#2a1a10", tie: "#111111" }, { pants: "#1b1b24", stripe: "#ff5db4", hair: "#e8c15a", tie: "#d01060" }],
    dasher: [{ pants: "#d0213a", stripe: "#ffffff", hair: "#3a2010", tie: "#111111", band: "#ffffff" }, { pants: "#1f6fe0", stripe: "#ffffff", hair: "#c07a2a", tie: "#111111", band: "#ffcf5a" }],
    talker: [{ pants: "#f4f0ea", stripe: "#d4af37", hair: "#141010", tie: "#d01040", shades: true, rose: true }],
    grabber: [{ pants: "#c9a35a", stripe: "#f4ff3a", hair: "#3a2010", tie: "#111111", helmet: true }, { pants: "#c9a35a", stripe: "#f4ff3a", hair: "#141010", tie: "#111111", helmet: true }],
    boss: [{ pants: "#e8b83a", stripe: "#fff6c0", hair: "#141010", tie: "#ffcf5a", shades: true, sash: true }],
  };
  const HSK = { hunk: [SKIN[0], SKIN[2]], dasher: [SKIN[1], SKIN[3]], talker: [SKIN[2]], grabber: [SKIN[4], SKIN[1]], boss: [SKIN[1]] };
  // dance moves: 4 frames per move = 2 beats (frames 0 and 2 land on the beat)
  const ON_HIP_L = (a) => a(36, 22, 90, 42, 100), ON_HIP_R = (a) => a(84, 98, 90, 78, 100);
  const GROOVE = [
    { name: "sway", hip: [-7, 0, 7, 0], lean: [0.06, 0, -0.06, 0],
      arms: (a, f) => { a(36, 20, 86, 28, f === 0 ? 46 : 60); a(84, 100, 86, 92, f === 2 ? 46 : 60); } },
    { name: "roll", hip: [0, 4, 0, -4], lean: [0, 0.05, 0, -0.05], dip: [6, 3, 0, 3],
      arms: (a, f) => { a(36, 16, 42, 44, 22); a(84, 98, 86, 70, 70 + [0, 9, 18, 9][f]); } },
    { name: "point", hip: [4, 0, -4, 0], lean: [-0.05, 0, 0.05, 0],
      arms: (a, f) => { const o = f % 2 ? 6 : 0; if (f < 2) { a(84, 104, 58 + o, 116, 40 + o, false, true); ON_HIP_L(a); } else { a(36, 16, 58 + o, 4, 40 + o, false, true); ON_HIP_R(a); } } },
    { name: "shimmy", hip: [2, -2, 2, -2], lean: [0.13, -0.13, 0.13, -0.13], legs: [[4, 0], [0, 4], [4, 0], [0, 4]],
      arms: (a, f) => { const j = f % 2 ? 5 : -5; a(36, 14, 78, 4, 92 + j); a(84, 106, 78, 116, 92 - j); } },
    { name: "disco", hip: [5, 5, -3, -3], lean: [-0.07, -0.07, 0.05, 0.05],
      arms: (a, f) => { if (f < 2) a(84, 100, 46, 110, 12 + (f ? 6 : 0), false, true); else a(84, 78, 98, 40, 118 - (f === 3 ? 6 : 0), false, true); ON_HIP_L(a); } },
  ];
  function drawHunk(g, type, vi, ph, mode, mv) {
    const st = HC[type][vi], skin = HSK[type][vi], gv = mode === "groove", f = gv ? ph & 3 : 0, GP = gv ? GROOVE[mv || 0] : null;
    let sw = Math.sin(ph), bob = Math.abs(Math.cos(ph)) * 2.5;
    const hip = gv ? GP.hip[f] : 0, lean = gv ? GP.lean[f] : 0;
    if (gv) { sw = 0; bob = -(GP.dip ? GP.dip[f] : f % 2 === 0 ? 3.5 : 0); }
    const dark = mix(skin, "#000000", 0.28), light = mix(skin, "#ffffff", 0.3);
    g.translate(0, 4);
    const leg = (hx, lift, side) => {
      const fx = hx + side * 3 + lift * 0.15, fy = 176 - lift, tx = hx + hip, ty = 110 - bob;
      limb(g, tx, ty, hx + side * 4 + hip * 0.5 + (gv ? side * 3 : 0), 145 - lift * 0.5 - bob * 0.5, fx, fy - 6, st.pants, 17);
      g.strokeStyle = st.stripe; g.lineWidth = 2.5; g.beginPath(); g.moveTo(tx + side * 8, ty + 4); g.quadraticCurveTo(hx + side * 11, 145 - lift * 0.5, fx + side * 7, fy - 10); g.stroke();
      if (type !== "grabber") { g.fillStyle = "#fff"; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(hx + side * (8.5 + k * 0.4), 122 + k * 13 - lift * 0.15 * k, 1.5, 0, 7); g.fill(); } }
      g.fillStyle = type === "boss" ? "#ffcf5a" : "#111"; g.beginPath(); g.ellipse(fx + side * 3, fy, 11, 5.5, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.ellipse(fx + side * 3 - 3, fy - 2, 4, 1.4, 0, 0, 7); g.fill();
    };
    const lift = mode === "walk" ? sw * 9 : mode === "dance" ? Math.max(0, sw) * 12 : mode === "spun" ? 14 : 0;
    if (gv) { const L = GP.legs ? GP.legs[f] : [f === 0 ? 8 : 0, f === 2 ? 8 : 0]; leg(51, L[0], -1); leg(69, L[1], 1); }
    else { leg(51, Math.max(0, lift), -1); leg(69, mode === "spun" ? 4 : Math.max(0, -lift), 1); }
    g.save(); g.translate(hip, -bob); if (lean) { g.translate(60, 106); g.rotate(lean); g.translate(-60, -106); }
    // waistband
    g.fillStyle = type === "boss" ? "#ffcf5a" : mix(st.pants, "#000000", 0.3); rr(g, 40, 102, 40, 14, 5); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke();
    if (type === "boss") { g.fillStyle = "#fff6c0"; rr(g, 54, 103, 12, 12, 3); g.fill(); g.stroke(); g.fillStyle = INK; g.font = "900 9px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("S", 60, 109.5); }
    // torso
    const torso = () => { g.beginPath(); g.moveTo(33, 66); g.quadraticCurveTo(60, 55, 87, 66); g.quadraticCurveTo(92, 80, 83, 92); g.quadraticCurveTo(76, 100, 75, 106); g.lineTo(45, 106); g.quadraticCurveTo(44, 100, 37, 92); g.quadraticCurveTo(28, 80, 33, 66); g.closePath(); };
    torso(); const tg = g.createLinearGradient(30, 60, 90, 100); tg.addColorStop(0, light); tg.addColorStop(0.45, skin); tg.addColorStop(1, dark);
    g.fillStyle = tg; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    g.strokeStyle = dark; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(41, 79); g.quadraticCurveTo(51, 89, 59, 82); g.moveTo(61, 82); g.quadraticCurveTo(69, 89, 79, 79); g.stroke();
    g.beginPath(); g.moveTo(60, 85); g.lineTo(60, 104); g.stroke();
    [92, 98.5, 104].forEach((y) => { g.beginPath(); g.moveTo(52, y); g.quadraticCurveTo(55.5, y + 1.6, 58.5, y); g.moveTo(61.5, y); g.quadraticCurveTo(64.5, y + 1.6, 68, y); g.stroke(); });
    g.fillStyle = "rgba(255,255,255,.32)"; g.beginPath(); g.ellipse(48, 76, 6, 3, -0.4, 0, 7); g.fill();
    if (type === "boss") { g.fillStyle = "rgba(255,255,255,.45)"; [[70, 76, 4], [52, 96, 2.5], [66, 100, 2.5], [40, 70, 3]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, r, r * 0.5, -0.4, 0, 7); g.fill(); }); }
    if (st.helmet) { // suspenders
      g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(44, 66); g.lineTo(48, 104); g.moveTo(76, 66); g.lineTo(72, 104); g.stroke();
      g.strokeStyle = "#e8d23a"; g.lineWidth = 4.5; g.stroke();
    }
    if (st.sash) {
      g.save(); g.beginPath(); g.moveTo(36, 66); g.lineTo(46, 64); g.lineTo(82, 104); g.lineTo(72, 106); g.closePath(); g.fillStyle = "#ff3f9a"; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
      g.translate(59, 85); g.rotate(0.86); g.fillStyle = "#fff"; g.font = "900 7.5px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("MR. SEXY", 0, 0.5); g.restore();
      g.strokeStyle = "#ffcf5a"; g.lineWidth = 2; g.beginPath(); g.moveTo(50, 62); g.quadraticCurveTo(60, 78, 70, 62); g.stroke();
      g.fillStyle = "#ffcf5a"; g.beginPath(); g.arc(60, 75, 5, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
    }
    // arms
    const arm = (sx, ex, ey, hx, hy, big, pt) => {
      limb(g, sx, 69, ex, ey, hx, hy, skin, big ? 13 : 11);
      g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.ellipse((sx + ex) / 2, (69 + ey) / 2 - 2, 3.5, 2, 0, 0, 7); g.fill();
      const ang = Math.atan2(hy - ey, hx - ex);
      g.save(); g.translate(hx - Math.cos(ang) * 7, hy - Math.sin(ang) * 7); g.rotate(ang); g.fillStyle = "#fff"; rr(g, -3, -6.5, 6, 13, 2); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.restore();
      if (pt) { g.save(); g.translate(hx, hy); g.rotate(ang); g.fillStyle = skin; g.strokeStyle = INK; g.lineWidth = 2; rr(g, 2, -2.6, 13, 5.2, 2.6); g.fill(); g.stroke(); g.restore(); }
      g.fillStyle = skin; g.beginPath(); g.arc(hx, hy, 7, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke();
    };
    if (gv) GP.arms(arm, f);
    else if (mode === "walk") { arm(36, 22, 86 - sw * 6, 26 + sw * 4, 64 - sw * 8, true); arm(84, 98, 86 + sw * 6, 94 - sw * 4, 64 + sw * 8, true); }
    else if (mode === "dance") { arm(36, 20, 52, 30 + sw * 8, 24); arm(84, 100, 52, 90 + sw * 8, 24); }
    else if (mode === "spun") { arm(36, 16, 60, 6, 44); arm(84, 104, 76, 114, 88); }
    else if (mode === "carry") { arm(36, 28, 90, 44, 84, true); arm(84, 92, 90, 76, 84, true); }
    // neck + collar + bow tie
    g.fillStyle = skin; rr(g, 53, 46, 14, 16, 5); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.moveTo(53, 58); g.lineTo(49, 65); g.lineTo(59, 63); g.closePath(); g.moveTo(67, 58); g.lineTo(71, 65); g.lineTo(61, 63); g.closePath(); g.fill(); g.lineWidth = 1.8; g.stroke();
    g.fillStyle = st.tie; g.beginPath(); g.moveTo(60, 63); g.lineTo(49, 57.5); g.lineTo(49, 68.5); g.closePath(); g.moveTo(60, 63); g.lineTo(71, 57.5); g.lineTo(71, 68.5); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    g.beginPath(); g.arc(60, 63, 3.2, 0, 7); g.fill(); g.stroke();
    // head
    g.fillStyle = skin; g.strokeStyle = INK; g.lineWidth = 2.5;
    g.beginPath(); g.arc(43.5, 37, 5, 0, 7); g.arc(76.5, 37, 5, 0, 7); g.fill(); g.stroke();
    rr(g, 44, 16, 32, 40, 13); const fg = g.createLinearGradient(44, 0, 76, 0); fg.addColorStop(0, light); fg.addColorStop(0.6, skin); fg.addColorStop(1, dark); g.fillStyle = fg; g.fill(); g.lineWidth = 3; g.stroke();
    g.strokeStyle = dark; g.lineWidth = 1.6; g.beginPath(); g.moveTo(60, 51); g.lineTo(60, 54.5); g.stroke();
    // hair / headgear
    g.fillStyle = st.hair; g.strokeStyle = INK; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(43, 30); g.quadraticCurveTo(38, 6, 62, 5); g.quadraticCurveTo(86, 5, 78, 30); g.quadraticCurveTo(75, 17, 62, 19); g.quadraticCurveTo(50, 18, 43, 30); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(50, 11); g.quadraticCurveTo(62, 6, 72, 11); g.stroke();
    if (st.band) { g.fillStyle = st.band; rr(g, 43, 21, 34, 6, 2); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); }
    if (st.helmet) {
      g.fillStyle = "#d0202a"; g.strokeStyle = INK; g.lineWidth = 2.5;
      g.beginPath(); g.ellipse(60, 22, 26, 6, 0, 0, 7); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(42, 22); g.quadraticCurveTo(42, 0, 60, 0); g.quadraticCurveTo(78, 0, 78, 22); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#ffcf5a"; g.beginPath(); g.moveTo(60, 6); g.lineTo(66, 12); g.lineTo(60, 19); g.lineTo(54, 12); g.closePath(); g.fill(); g.stroke();
    }
    // face
    if (mode === "spun") {
      g.strokeStyle = INK; g.lineWidth = 2.5; [53, 67].forEach((x) => { g.beginPath(); g.moveTo(x - 3.5, 30.5); g.lineTo(x + 3.5, 37.5); g.moveTo(x + 3.5, 30.5); g.lineTo(x - 3.5, 37.5); g.stroke(); });
      g.fillStyle = "#5a0a1a"; g.beginPath(); g.ellipse(60, 46, 4.5, 5.5, 0, 0, 7); g.fill(); g.stroke();
    } else {
      if (st.shades) {
        g.fillStyle = "#0a0a12"; rr(g, 45, 29, 13, 9, 3); g.fill(); rr(g, 62, 29, 13, 9, 3); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(58, 32); g.lineTo(62, 32); g.stroke();
        g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(47, 30.5, 4, 2); g.fillRect(64, 30.5, 4, 2);
      } else {
        const wink = (mode === "dance" && sw > 0.3) || (gv && f === 1 && mv !== 1);
        [53, 67].forEach((x, i) => {
          if (wink && i === 1) { g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.arc(x, 35, 3.5, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return; }
          g.fillStyle = "#fff"; g.beginPath(); g.ellipse(x, 34.5, 4, 3.6, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
          g.fillStyle = "#2a1a10"; g.beginPath(); g.arc(x + 0.6, 35, 2.2, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(x + 1.3, 34, 0.8, 0, 7); g.fill();
        });
      }
      g.strokeStyle = st.hair === "#e8c15a" ? "#9a7020" : "#1a0e08"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(48, 27.5); g.quadraticCurveTo(53, 24, 57, 27); g.moveTo(63, 26); g.quadraticCurveTo(67, 22, 72, 25); g.stroke();
      g.fillStyle = "#fff"; g.strokeStyle = INK; g.lineWidth = 2;
      g.beginPath(); g.moveTo(50, 43); g.quadraticCurveTo(60, 47, 70, 42); g.quadraticCurveTo(66, 51.5, 60, 51.5); g.quadraticCurveTo(53, 51.5, 50, 43); g.closePath(); g.fill(); g.stroke();
      g.lineWidth = 1; g.beginPath(); g.moveTo(51, 45.5); g.quadraticCurveTo(60, 48.5, 69, 45); g.stroke();
      if (st.rose) {
        g.strokeStyle = "#1f8a3a"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(66, 46); g.lineTo(86, 40); g.stroke();
        g.fillStyle = "#e0103a"; g.beginPath(); g.arc(89, 39, 6, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
        g.strokeStyle = "#8a0820"; g.lineWidth = 1.2; g.beginPath(); g.arc(89, 39, 3, 0, 5); g.stroke();
      }
    }
    g.restore();
  }

  /* ---- background clubbers (clothed, decorative) ---- */
  const CLUBLOOK = [
    { skin: SKIN[1], hair: "#2a1a10", top: "#ffcf5a", bottom: "#ffcf5a", dress: true, long: true, sparkle: true },
    { skin: SKIN[3], hair: "#141010", top: "#2ad0c0", bottom: "#2a3a6a", cap: "#ff3f9a" },
    { skin: SKIN[0], hair: "#c0503a", top: "#9a4aff", bottom: "#1a1a24", bun: true, sticks: true },
    { skin: SKIN[4], hair: "#3a2010", top: "#f4f4f8", bottom: "#3a3a48", curly: true },
  ];
  function drawClubber(g, look, f) {
    const L = CLUBLOOK[look], hip = [-5, 0, 5, 0][f], dip = f % 2 === 0 ? 4 : 0, dark = mix(L.skin, "#000000", 0.25);
    g.translate(0, 8);
    // legs
    [[51, -1], [69, 1]].forEach(([hx, side], i) => { const lift = (f === 0 && i === 0) || (f === 2 && i === 1) ? 7 : 0;
      limb(g, hx + hip, 112 + dip, hx + side * 3 + hip * 0.4, 146 - lift * 0.5, hx + side * 2, 172 - lift, L.dress ? L.skin : L.bottom, L.dress ? 9 : 15);
      g.fillStyle = L.dress ? "#ff3f9a" : "#f4f4f8"; g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.ellipse(hx + side * 4, 176 - lift, 9, 5, 0, 0, 7); g.fill(); g.stroke(); });
    g.save(); g.translate(hip, dip);
    // arms
    const up = [[1, 1], [0.5, 0.5], [1, 0], [0.5, 0.5]][f];
    const arm = (sx, side, u) => { const hx = sx + side * (22 - u * 14), hy = 92 - u * 74, ex = sx + side * 18, ey = 74 - u * 22;
      limb(g, sx, 70, ex, ey, hx, hy, L.skin, 9); g.fillStyle = L.skin; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.arc(hx, hy, 6, 0, 7); g.fill(); g.stroke();
      if (L.sticks) { g.save(); g.translate(hx, hy); g.rotate(side * 0.5); g.fillStyle = side < 0 ? "#7cff5a" : "#4ae0ff"; rr(g, -2.5, -22, 5, 22, 2.5); g.fill(); g.restore(); } };
    arm(40, -1, up[0]); arm(80, 1, up[1]);
    // body
    g.strokeStyle = INK; g.lineWidth = 3; g.fillStyle = L.top;
    if (L.dress) { g.beginPath(); g.moveTo(44, 64); g.lineTo(76, 64); g.lineTo(84, 124); g.quadraticCurveTo(60, 130, 36, 124); g.closePath(); g.fill(); g.stroke(); }
    else { rr(g, 38, 62, 44, 50, 12); g.fill(); g.stroke(); g.fillStyle = L.bottom; rr(g, 40, 104, 40, 14, 5); g.fill(); g.stroke(); }
    if (L.sparkle) { g.fillStyle = "rgba(255,255,255,.75)"; [[50, 80], [66, 92], [56, 108], [72, 114], [62, 72]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 1.8, 0, 7); g.fill(); }); }
    // head
    g.fillStyle = L.skin; rr(g, 54, 52, 12, 12, 4); g.fill(); g.stroke();
    if (L.long) { g.fillStyle = L.hair; g.beginPath(); g.ellipse(60, 46, 21, 26, 0, 0, 7); g.fill(); g.lineWidth = 2.5; g.stroke(); }
    g.fillStyle = L.skin; g.lineWidth = 2.5; g.beginPath(); g.ellipse(60, 38, 15, 17, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = L.hair; g.beginPath();
    if (L.curly) { for (let i = 0; i < 7; i++) { g.moveTo(47 + i * 4.5 + 5, 24); g.arc(47 + i * 4.5, 24 + Math.sin(i) * 2, 5, 0, 7); } g.fill(); }
    else { g.moveTo(45, 36); g.quadraticCurveTo(44, 18, 60, 19); g.quadraticCurveTo(76, 18, 75, 36); g.quadraticCurveTo(70, 25, 60, 26); g.quadraticCurveTo(50, 26, 45, 36); g.closePath(); g.fill(); g.stroke(); }
    if (L.bun) { g.beginPath(); g.arc(60, 14, 8, 0, 7); g.fill(); g.stroke(); }
    if (L.cap) { g.fillStyle = L.cap; g.beginPath(); g.moveTo(44, 28); g.quadraticCurveTo(45, 14, 60, 14); g.quadraticCurveTo(75, 14, 76, 28); g.closePath(); g.fill(); g.stroke(); rr(g, 58, 24, 26, 5, 2.5); g.fill(); g.stroke(); }
    g.strokeStyle = INK; g.lineWidth = 2; [53, 67].forEach((x) => { g.beginPath(); g.arc(x, 38, 3, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); });
    g.fillStyle = "#fff"; g.beginPath(); g.moveTo(53, 44); g.quadraticCurveTo(60, 48, 67, 44); g.quadraticCurveTo(64, 51, 60, 51); g.quadraticCurveTo(56, 51, 53, 44); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,90,140,.35)"; g.beginPath(); g.arc(49, 44, 3, 0, 7); g.arc(71, 44, 3, 0, 7); g.fill();
    g.restore();
  }
  function drawBride(g, ph, mode) {
    const sw = Math.sin(ph), bob = Math.abs(Math.cos(ph)) * 3, skin = "#f6d2b8", hair = "#7a4422";
    g.translate(0, 4 - bob * 0.5);
    // veil
    g.fillStyle = "rgba(255,255,255,.62)"; g.strokeStyle = "rgba(26,10,22,.55)"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(46, 20); g.quadraticCurveTo(24 - sw * 6, 80, 22 - sw * 8, 140); g.quadraticCurveTo(60, 150, 98 - sw * 8, 140); g.quadraticCurveTo(96 - sw * 6, 80, 74, 20); g.closePath(); g.fill(); g.stroke();
    // skirt
    const hs = sw * 5;
    const skirt = () => { g.beginPath(); g.moveTo(45, 96); g.quadraticCurveTo(26 + hs * 0.5, 126, 14 + hs, 174); g.lineTo(106 + hs, 174); g.quadraticCurveTo(94 + hs * 0.5, 126, 75, 96); g.closePath(); };
    skirt(); const sg = g.createLinearGradient(14, 96, 106, 174); sg.addColorStop(0, "#ffffff"); sg.addColorStop(0.6, "#f6f0ff"); sg.addColorStop(1, "#d8ccf0"); g.fillStyle = sg; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    g.strokeStyle = "rgba(150,130,190,.5)"; g.lineWidth = 1.5; for (const x of [36, 52, 68, 84]) { g.beginPath(); g.moveTo(54 + (x - 60) * 0.25, 100); g.quadraticCurveTo(x + hs * 0.5, 140, x + hs, 172); g.stroke(); }
    g.fillStyle = "#fff"; g.strokeStyle = INK; g.lineWidth = 2; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(19 + hs + i * 11.7, 174, 6.5, 0, Math.PI); g.fill(); g.stroke(); }
    // shoulders + bodice
    g.fillStyle = skin; g.beginPath(); g.ellipse(60, 68, 17, 8, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke();
    const bod = () => { g.beginPath(); g.moveTo(45, 68); g.quadraticCurveTo(51, 63, 56, 66); g.quadraticCurveTo(60, 71, 64, 66); g.quadraticCurveTo(69, 63, 75, 68); g.lineTo(76, 98); g.quadraticCurveTo(60, 102, 44, 98); g.closePath(); };
    bod(); g.fillStyle = "#ffffff"; g.fill(); g.strokeStyle = INK; g.lineWidth = 2.8; g.stroke();
    g.fillStyle = "rgba(200,180,240,.6)"; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(48 + i * 6, 96, 1.5, 0, 7); g.fill(); }
    // sash
    g.save(); g.beginPath(); g.moveTo(44, 66); g.lineTo(52, 64); g.lineTo(78, 100); g.lineTo(70, 102); g.closePath(); g.fillStyle = "#ff3f9a"; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    g.translate(61, 83); g.rotate(0.95); g.fillStyle = "#fff"; g.font = "900 8px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("BRIDE", 0, 0.5); g.restore();
    // arms
    const arm = (sx, ex, ey, hx, hy) => { limb(g, sx, 70, ex, ey, hx, hy, skin, 6.5); g.fillStyle = skin; g.beginPath(); g.arc(hx, hy, 5, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); };
    if (mode === "grabbed") { arm(46, 26, 44 + sw * 6, 20 + sw * 6, 22); arm(74, 96, 44 - sw * 6, 100 - sw * 6, 22); }
    else if (mode === "walk") { arm(46, 36, 88, 52, 100); arm(74, 84, 88, 66, 100); }
    else { const up = sw > 0; arm(46, 28, up ? 50 : 70, up ? 30 : 24, up ? 24 : 54); arm(74, 92, up ? 70 : 50, up ? 96 : 90, up ? 54 : 24); }
    if (mode === "walk") { // bouquet
      [[54, 98, "#ff5db4"], [62, 96, "#ffffff"], [58, 92, "#ff9ad8"], [66, 100, "#ffcf5a"], [50, 93, "#ffffff"]].forEach(([x, y, c]) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke(); });
      g.strokeStyle = "#2f8a46"; g.lineWidth = 3; g.beginPath(); g.moveTo(58, 104); g.lineTo(58, 116); g.stroke();
    }
    // head
    g.fillStyle = skin; rr(g, 55, 48, 10, 14, 4); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    g.fillStyle = hair; g.strokeStyle = INK; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(60, 34, 19, 20, 0, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.arc(60, 13, 8, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(42, 44, 5, 9, 0.3, 0, 7); g.ellipse(78, 44, 5, 9, -0.3, 0, 7); g.fill(); g.stroke();
    g.fillStyle = skin; g.beginPath(); g.ellipse(60, 38, 14.5, 16.5, 0, 0, 7); g.fill(); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = hair; g.beginPath(); g.moveTo(45, 34); g.quadraticCurveTo(48, 20, 62, 21); g.quadraticCurveTo(74, 22, 75, 34); g.quadraticCurveTo(66, 26, 58, 28); g.quadraticCurveTo(51, 29, 45, 34); g.closePath(); g.fill(); g.stroke();
    // tiara
    g.fillStyle = "#ffe08a"; g.strokeStyle = INK; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(47, 23); g.lineTo(50, 15); g.lineTo(54, 20); g.lineTo(60, 10); g.lineTo(66, 20); g.lineTo(70, 15); g.lineTo(73, 23); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#7fe7ff"; g.beginPath(); g.arc(60, 16, 2.2, 0, 7); g.fill(); g.fillStyle = "#ff5db4"; g.beginPath(); g.arc(51, 19, 1.4, 0, 7); g.arc(69, 19, 1.4, 0, 7); g.fill();
    // face
    const scared = mode === "grabbed";
    [54, 66].forEach((x) => {
      g.fillStyle = "#fff"; g.beginPath(); g.ellipse(x, 38, 3.6, scared ? 4.6 : 4, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.4; g.stroke();
      g.fillStyle = "#3a6a2a"; g.beginPath(); g.arc(x + 0.4, 38.6, 2.2, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(x + 1.1, 37.5, 0.8, 0, 7); g.fill();
      g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); const sd = x < 60 ? -1 : 1; g.moveTo(x + sd * 3, 34.6); g.lineTo(x + sd * 5.5, 32.5); g.moveTo(x + sd * 1, 34); g.lineTo(x + sd * 2, 31.5); g.stroke();
      g.strokeStyle = "#5a2a14"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - 3.5, scared ? 30 : 31.5); g.quadraticCurveTo(x, scared ? 27.5 : 29.5, x + 3.5, scared ? 30 : 31.5); g.stroke();
    });
    g.fillStyle = "rgba(255,90,140,.35)"; g.beginPath(); g.arc(49.5, 44, 3.4, 0, 7); g.arc(70.5, 44, 3.4, 0, 7); g.fill();
    g.fillStyle = "#e0205a"; g.strokeStyle = INK; g.lineWidth = 1.3; g.beginPath();
    if (scared) g.ellipse(60, 47.5, 3.4, 4, 0, 0, 7); else { g.moveTo(54.5, 45.5); g.quadraticCurveTo(60, 51.5, 65.5, 45.5); g.quadraticCurveTo(60, 47.5, 54.5, 45.5); }
    g.fill(); g.stroke();
    if (scared) { g.fillStyle = "#9fe0ff"; g.beginPath(); g.ellipse(78, 28, 2.2, 3.4, 0.3, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); }
  }
  function propSprite(kind) {
    if (kind === "sofa") return outlined(120, 80, (g) => {
      const vg = g.createLinearGradient(0, 8, 0, 76); vg.addColorStop(0, "#ff6ac0"); vg.addColorStop(1, "#a0106a");
      g.fillStyle = vg; rr(g, 12, 8, 96, 46, 18); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = "rgba(60,0,40,.6)"; for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(26 + i * 17 + r * 8, 20 + r * 14, 2.2, 0, 7); g.fill(); }
      g.fillStyle = "#e03a9a"; rr(g, 14, 46, 92, 22, 8); g.fill(); g.stroke();
      g.fillStyle = vg; rr(g, 2, 30, 18, 40, 9); g.fill(); g.stroke(); rr(g, 100, 30, 18, 40, 9); g.fill(); g.stroke();
      g.fillStyle = "#ffcf5a"; g.fillRect(14, 68, 6, 10); g.fillRect(100, 68, 6, 10);
    });
    if (kind === "table") return outlined(70, 90, (g) => {
      g.fillStyle = "#ffcf5a"; g.fillRect(32, 40, 6, 46); g.beginPath(); g.ellipse(35, 86, 16, 4, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
      g.fillStyle = "#1a0a20"; g.beginPath(); g.ellipse(35, 40, 32, 9, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = "#3fe6ff"; g.beginPath(); g.moveTo(14, 18); g.lineTo(28, 18); g.lineTo(21, 30); g.closePath(); g.fill(); g.stroke(); g.fillRect(20, 30, 2, 8);
      g.fillStyle = "#ff4fc0"; rr(g, 42, 20, 10, 18, 3); g.fill(); g.stroke();
      g.fillStyle = "#ffcf5a"; g.beginPath(); g.ellipse(36, 30, 3, 6, 0, 0, 7); g.fill();
    });
    if (kind === "speaker") return outlined(70, 120, (g) => {
      g.fillStyle = "#16121c"; rr(g, 6, 4, 58, 112, 6); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke();
      [[35, 34, 18], [35, 82, 22]].forEach(([x, y, r]) => { g.fillStyle = "#2c2634"; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#0c0a10"; g.beginPath(); g.arc(x, y, r * 0.55, 0, 7); g.fill(); g.fillStyle = "#555"; g.beginPath(); g.arc(x, y, r * 0.2, 0, 7); g.fill(); });
      g.strokeStyle = "#ff3fae"; g.lineWidth = 2; g.beginPath(); g.arc(35, 82, 24, 0, 7); g.stroke();
    });
    if (kind === "stool") return outlined(40, 70, (g) => {
      g.strokeStyle = "#c8ccd8"; g.lineWidth = 4; g.beginPath(); g.moveTo(20, 14); g.lineTo(20, 64); g.moveTo(8, 64); g.lineTo(32, 64); g.moveTo(10, 44); g.lineTo(30, 44); g.stroke();
      g.fillStyle = "#e0205a"; g.beginPath(); g.ellipse(20, 12, 16, 7, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    });
    if (kind === "rope") return outlined(100, 64, (g) => {
      g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(10, 20); g.quadraticCurveTo(50, 46, 90, 20); g.stroke();
      g.strokeStyle = "#c0102a"; g.lineWidth = 6; g.stroke(); g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(14, 20); g.quadraticCurveTo(50, 43, 86, 20); g.stroke();
      [10, 90].forEach((x) => { const bg = g.createLinearGradient(x - 4, 0, x + 4, 0); bg.addColorStop(0, "#8a6a1a"); bg.addColorStop(0.5, "#fff0a8"); bg.addColorStop(1, "#8a6a1a"); g.fillStyle = bg; g.fillRect(x - 3, 14, 6, 44); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x - 3, 14, 6, 44); g.beginPath(); g.arc(x, 12, 6, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(x, 60, 11, 4, 0, 0, 7); g.fill(); g.stroke(); });
    });
    if (kind === "disco") return outlined(80, 80, (g) => {
      const bg = g.createRadialGradient(30, 30, 4, 40, 40, 36); bg.addColorStop(0, "#ffffff"); bg.addColorStop(0.5, "#b8c0d8"); bg.addColorStop(1, "#4a4a6a");
      g.fillStyle = bg; g.beginPath(); g.arc(40, 42, 34, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
      g.save(); g.beginPath(); g.arc(40, 42, 34, 0, 7); g.clip();
      for (let y = 8; y < 80; y += 7) for (let x = 4; x < 80; x += 7) { g.fillStyle = ["rgba(255,255,255,.75)", "rgba(120,140,200,.5)", "rgba(255,120,220,.55)", "rgba(80,230,255,.55)"][(x * 3 + y * 7) % 4]; g.fillRect(x, y, 6, 6); }
      g.restore(); g.fillStyle = "#888"; g.fillRect(38, 0, 4, 9);
    }, 1.4);
    if (kind === "marg") return outlined(46, 58, (g) => {
      g.strokeStyle = "#e8f6ff"; g.lineWidth = 3; g.beginPath(); g.moveTo(23, 30); g.lineTo(23, 50); g.stroke(); g.strokeStyle = INK; g.lineWidth = 1.5;
      g.fillStyle = "#e8f6ff"; g.beginPath(); g.ellipse(23, 52, 11, 3.5, 0, 0, 7); g.fill(); g.stroke();
      const lg = g.createLinearGradient(0, 10, 0, 30); lg.addColorStop(0, "#c8ff5a"); lg.addColorStop(1, "#5ac81e");
      g.fillStyle = lg; g.beginPath(); g.moveTo(4, 12); g.lineTo(42, 12); g.lineTo(26, 30); g.lineTo(20, 30); g.closePath(); g.fill(); g.lineWidth = 2.2; g.stroke();
      g.fillStyle = "#fff"; for (let i = 0; i < 10; i++) { g.beginPath(); g.arc(5 + i * 4, 12, 1.6, 0, 7); g.fill(); }
      g.fillStyle = "#7ad82a"; g.beginPath(); g.arc(40, 12, 7, Math.PI * 0.9, Math.PI * 2.1); g.closePath(); g.fill(); g.stroke(); g.fillStyle = "#d8ff9a"; g.beginPath(); g.arc(40, 12, 4.5, Math.PI * 0.95, Math.PI * 2.05); g.closePath(); g.fill();
      g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(10, 15, 10, 2);
    });
    if (kind === "bubbly") return outlined(36, 76, (g) => {
      const bg = g.createLinearGradient(6, 0, 30, 0); bg.addColorStop(0, "#b0105a"); bg.addColorStop(0.45, "#ff7ac8"); bg.addColorStop(1, "#a0084a");
      g.fillStyle = bg; g.beginPath(); g.moveTo(14, 6); g.lineTo(22, 6); g.lineTo(22, 22); g.quadraticCurveTo(31, 28, 31, 40); g.lineTo(31, 70); g.quadraticCurveTo(18, 74, 5, 70); g.lineTo(5, 40); g.quadraticCurveTo(5, 28, 14, 22); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2.2; g.stroke();
      g.fillStyle = "#ffcf5a"; g.beginPath(); g.moveTo(13, 2); g.lineTo(23, 2); g.lineTo(23, 22); g.lineTo(13, 22); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#fff6e8"; rr(g, 7, 42, 22, 16, 3); g.fill(); g.stroke(); g.fillStyle = "#c0106a"; g.font = "900 6px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("BUBBLY", 18, 50.5);
      g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(9, 30, 3, 34);
    });
  }
  function glowSprite(r, g2, b) {
    const c = mkC(64, 64), g = c.getContext("2d"), rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, "rgba(" + r + "," + g2 + "," + b + ",0.9)"); rg.addColorStop(0.35, "rgba(" + r + "," + g2 + "," + b + ",0.35)"); rg.addColorStop(1, "rgba(" + r + "," + g2 + "," + b + ",0)");
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64); return c;
  }
  function heart(c, x, y, s) { c.beginPath(); c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.6, y - s * 0.1, x - s * 0.9, y - s * 1.3, x, y - s * 0.45); c.bezierCurveTo(x + s * 0.9, y - s * 1.3, x + s * 1.6, y - s * 0.1, x, y + s * 0.9); c.closePath(); }
  function handprint(c, x, y, s, rot) {
    c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(s, s);
    c.fillStyle = "rgba(230,20,40,.78)";
    c.beginPath(); c.ellipse(0, 2, 4.2, 4.6, 0, 0, 7); c.fill();
    [[-3.6, -4.5, -0.3], [-1.2, -6.2, -0.1], [1.4, -6, 0.1], [3.6, -4.4, 0.3]].forEach(([fx, fy, r]) => { c.save(); c.translate(fx, fy); c.rotate(r); c.beginPath(); c.ellipse(0, 0, 1.2, 3.2, 0, 0, 7); c.fill(); c.restore(); });
    c.save(); c.translate(-5.2, 2); c.rotate(-0.9); c.beginPath(); c.ellipse(0, 0, 1.2, 2.8, 0, 0, 7); c.fill(); c.restore();
    c.restore();
  }

  /* ================= FIRST-PERSON: WORLD DATA ================= */
  const FACE = { E: 0, W: 1, S: 2, N: 3 };
  let faceTex = null, faceDoor = null, LM = null, LMW = 0, LMH = 0, LMN = 0, tileF = null, vShade = null;
  let fpLights = [], fpProps = [], mmCanvas = null, danceTiles = [];
  const MMS = 0.15;
  const DPAL = [[255, 60, 180], [60, 230, 255], [185, 120, 255], [255, 210, 80], [120, 255, 150], [255, 110, 70]];
  function fpWorldInit() {
    if (fpS.tex) return;
    const tx = fpS.tex = { wall: texWall(), signs: SIGNS.map((_, i) => texSign(i)), mirror: texMirror(), bar: texBar(), curtain: texCurtain(false), curtainOpen: texCurtain(true),
      stage: texStageWall(), vip: texVip(false), vipSign: texVip(true), club: texClubFloor(), stageF: texStageFloor(), vipF: texVipFloor(), ceil: texCeil() };
    faceTex = new Array(MW * MH * 4).fill(null); faceDoor = new Array(MW * MH * 4).fill(null);
    doors.forEach((d) => { const k = (d.y * MW + d.x) * 4 + FACE[d.face]; faceTex[k] = tx.curtain; faceDoor[k] = d; });
    const dirs = [["E", 1, 0], ["W", -1, 0], ["S", 0, 1], ["N", 0, -1]];
    let si = 0;
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const v = gAt(x, y); if (!isWallV(v)) continue;
      for (const [f, dx, dy] of dirs) {
        const nv = gAt(x + dx, y + dy); if (isWallV(nv)) continue;
        const k = (y * MW + x) * 4 + FACE[f];
        if (faceTex[k]) continue;
        if (v === BAR) { faceTex[k] = tx.bar; continue; }
        if (nv === VIPF || (nv === ROPE)) { faceTex[k] = (x === 0 && y === 5) ? tx.vipSign : tx.vip; continue; }
        if (nv === STAGE || (y === 2 && x >= 16) || (x === 22 && y <= 4)) { faceTex[k] = tx.stage; continue; }
        if (x === 5 && (y === 3 || y === 7)) { faceTex[k] = tx.vipSign; continue; }
        const r = (x * 7 + y * 13) % 5;
        faceTex[k] = r === 0 ? tx.signs[si++ % tx.signs.length] : r === 3 ? tx.mirror : tx.wall;
      }
    }
    tileF = new Uint8Array(MW * MH);
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const v = gAt(x, y);
      tileF[y * MW + x] = v === DANCE ? 3 : (v === STAGE || (v === SPEAK && y < 5)) ? 1 : v === VIPF ? 2 : 0;
      if (v === DANCE) danceTiles.push(y * MW + x);
    }
    // lights: x,y (tiles), color, radius (px), intensity
    const L = (x, y, c, r, i) => fpLights.push({ x: x * T, y: y * T, c, r, i });
    for (let y = 16.5, n = 0; y < 22; y += 2.5) for (let x = 6.5; x < 18; x += 3, n++) L(x, y, [[1, 0.3, 0.8], [0.3, 0.9, 1], [0.75, 0.45, 1]][n % 3], 150, 0.6);
    for (let y = 8.6; y < 14; y += 1.6) L(21.4, y, [1, 0.68, 0.3], 105, 0.55);
    L(18.5, 3.8, [1, 0.35, 0.75], 200, 1.0); L(16.4, 4.2, [0.3, 0.9, 1], 120, 0.5); L(20.8, 3.5, [0.8, 0.4, 1], 110, 0.5);
    L(2.6, 4.0, [1, 0.82, 0.45], 150, 0.85); L(2.6, 6.4, [1, 0.82, 0.45], 140, 0.7);
    L(8.5, 5.5, [0.7, 0.35, 1], 140, 0.5); L(12.5, 5.0, [1, 0.35, 0.8], 130, 0.45);
    L(11.5, 24.6, [0.4, 0.55, 1], 130, 0.6); L(4, 15, [0.3, 0.9, 1], 110, 0.4); L(20, 15, [1, 0.3, 0.8], 110, 0.4); L(4, 22, [1, 0.3, 0.8], 110, 0.4); L(20, 22, [0.3, 0.9, 1], 110, 0.4);
    doors.forEach((d) => L(d.sx / T, d.sy / T, [1, 0.45, 0.8], 60, 0.25));
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const v = gAt(x, y), cx = x * T + T / 2, cy = y * T + T / 2;
      if (v === SOFA) fpProps.push({ kind: "sofa", x: cx, y: cy - 8 }); if (v === TABLE) fpProps.push({ kind: "table", x: cx, y: cy + 6 });
      if (v === SPEAK) fpProps.push({ kind: "speaker", x: cx, y: cy }); if (v === STOOL) fpProps.push({ kind: "stool", x: cx, y: cy });
      if (v === ROPE) fpProps.push({ kind: "rope", x: cx + 2, y: cy });
    }
    fpProps.push({ kind: "disco", x: 11.5 * T, y: 18.5 * T });
    vShade = new Uint16Array(TEX);
    for (let v = 0; v < TEX; v++) { let k = 1; if (v < 10) k = 0.7 + 0.3 * (v / 10); if (v > 108) k = 1 - 0.4 * ((v - 108) / 20); vShade[v] = Math.round(k * 256); }
    // baked RGB lightmap with AO (packed 10:10:10)
    LMW = MW * T / LMS; LMH = MH * T / LMS; LMN = LMW * LMH; LM = new Uint32Array(LMN);
    const pack = (r, g, b) => (Math.min(1023, r | 0)) | (Math.min(1023, g | 0) << 10) | (Math.min(1023, b | 0) << 20);
    for (let j = 0; j < LMH; j++) for (let i = 0; i < LMW; i++) {
      const wx = (i + 0.5) * LMS, wy = (j + 0.5) * LMS, tx0 = Math.floor(wx / T), ty0 = Math.floor(wy / T);
      if (isWallV(gAt(tx0, ty0))) { LM[j * LMW + i] = pack(150, 120, 170); continue; }
      let r = 62, g = 40, b = 88;
      for (const l of fpLights) {
        const dx = wx - l.x, dy = wy - l.y, d2 = dx * dx + dy * dy;
        if (d2 > l.r * l.r) continue;
        if (!lineOfSight(wx, wy, l.x, l.y)) continue;
        const k = 1 - Math.sqrt(d2) / l.r, a = l.i * 250 * k * k; r += a * l.c[0]; g += a * l.c[1]; b += a * l.c[2];
      }
      let dmin = 99;
      for (let yy = ty0 - 1; yy <= ty0 + 1; yy++) for (let xx = tx0 - 1; xx <= tx0 + 1; xx++) {
        if (!isWallV(gAt(xx, yy))) continue;
        const nx = clamp(wx, xx * T, xx * T + T), ny = clamp(wy, yy * T, yy * T + T), d = Math.hypot(wx - nx, wy - ny);
        if (d < dmin) dmin = d;
      }
      let ao = Math.min(1, dmin / 22); ao = ao * ao * (3 - 2 * ao); const m = 0.55 + 0.45 * ao;
      LM[j * LMW + i] = pack(r * m, g * m, b * m);
    }
    // sprites
    if (!fpS.spr || !fpS.spr.bride) {
    fpS.spr = {};
    Object.keys(HC).forEach((type) => HC[type].forEach((_, vi) => {
      const groove = GROOVE.map((_, mv) => [0, 1, 2, 3].map((f) => outlined(120, 190, (g) => drawHunk(g, type, vi, f, "groove", mv))));
      fpS.spr["h_" + type + vi] = { groove, carry: outlined(120, 190, (g) => drawHunk(g, type, vi, 0, "carry")), spun: outlined(120, 190, (g) => drawHunk(g, type, vi, 0, "spun")) };
    }));
    fpS.spr.club = CLUBLOOK.map((_, look) => [0, 1, 2, 3].map((f) => outlined(120, 190, (g) => drawClubber(g, look, f))));
    fpS.spr.bride = { dance: [0, 1, 2, 3].map((i) => outlined(120, 190, (g) => drawBride(g, i * Math.PI / 2 + 0.6, "dance"))), walk: [0, 1].map((i) => outlined(120, 190, (g) => drawBride(g, i * Math.PI, "walk"))),
      grabbed: [0, 1].map((i) => outlined(120, 190, (g) => drawBride(g, i * Math.PI + Math.PI / 2, "grabbed"))) };
    ["sofa", "table", "speaker", "stool", "rope", "disco", "marg", "bubbly"].forEach((k) => (fpS.spr[k] = propSprite(k)));
    }
    fpS.glowPink = glowSprite(255, 70, 180); fpS.glowCyan = glowSprite(70, 220, 255); fpS.glowPurple = glowSprite(170, 100, 255); fpS.glowGold = glowSprite(255, 200, 90); fpS.glowWhite = glowSprite(255, 240, 250); fpS.glowGreen = glowSprite(150, 255, 90);
    // minimap
    mmCanvas = mkC(MW * T * MMS * 2, MH * T * MMS * 2);
    const mg = mmCanvas.getContext("2d"); mg.scale(MMS * 2, MMS * 2);
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const v = gAt(x, y);
      if (isWallV(v)) continue;
      mg.fillStyle = v === VIPF ? "#8a6a1a" : v === DANCE ? "#6a2a8a" : v === STAGE ? "#8a2a5a" : v === ROPE ? "#c0102a" : walkV(v) || v === F ? "#3a1a4a" : "#5a2a5a"; mg.fillRect(x * T - 0.5, y * T - 0.5, T + 1, T + 1);
    }
  }
  function fpBuild() {
    fpWorldInit();
    const q = TIERS[clamp(fpS.tier, 0, 2)];
    fpS.IW = Math.max(110, Math.round(Math.min(cssW * q, 440)));
    fpS.IH = Math.max(150, Math.round(fpS.IW * cssH / cssW));
    fpS.cv = mkC(fpS.IW, fpS.IH); fpS.cx = fpS.cv.getContext("2d");
    fpS.img = fpS.cx.createImageData(fpS.IW, fpS.IH); fpS.buf = new Uint32Array(fpS.img.data.buffer); fpS.z = new Float32Array(fpS.IW);
  }
  const danceCol = new Uint32Array(MW * MH);
  // background clubbers: [x, y, look, frame offset]
  const CLUBBERS = [[6.8, 16.9, 0, 0], [7.5, 19.7, 1, 2], [9.1, 21.5, 2, 0], [15.9, 21.3, 3, 2], [16.9, 19.6, 0, 2], [13.9, 21.6, 1, 0], [9.0, 16.6, 3, 0],
    [20.5, 9.3, 2, 2], [17.1, 12.6, 1, 0], [20.6, 6.4, 0, 0], [16.7, 6.7, 3, 2], [4.3, 14.6, 2, 0], [21.0, 15.0, 1, 2], [5.0, 20.0, 3, 2], [4.6, 17.3, 1, 0], [19.8, 20.3, 2, 2], [13.2, 15.3, 0, 2], [9.3, 20.5, 2, 2], [14.5, 20.9, 3, 0], [9.9, 17.0, 1, 0], [13.5, 16.8, 0, 2]];
  function fpRenderWorld() {
    const s = state, IW = fpS.IW, IH = fpS.IH, buf = fpS.buf, zb = fpS.z;
    const ca = Math.cos(cam.ang), sa = Math.sin(cam.ang), plx = -sa * TANF, ply = ca * TANF, cz = cam.z;
    const proj = (IW / 2) / TANF, hor = Math.round(IH * (0.5 - cam.pitch));
    fpS.hor = hor; fpS.proj = proj;
    // animated dance floor palette
    const beat = Math.floor(musicBeat());
    for (const i of danceTiles) {
      const x = i % MW, y = (i / MW) | 0, ph = (x + y + beat) % 6, on = ((x * 3 + y * 5 + beat) % 4) !== 0;
      const c = DPAL[(ph + (x & 1) * 2) % 6], m = on ? 1 : 0.28;
      danceCol[i] = 0xff000000 | (((c[2] * m) | 0) << 16) | (((c[1] * m) | 0) << 8) | ((c[0] * m) | 0);
    }
    const fr = FOGC[0], fgc = FOGC[1], fb = FOGC[2], fogPix = 0xff000000 | (fb << 16) | (fgc << 8) | fr;
    const rx0 = ca - plx, ry0 = sa - ply, rx1 = ca + plx, ry1 = sa + ply, px = cam.x, py = cam.y;
    const MWT = MW * T, MHT = MH * T;
    const club = fpS.tex.club.d, stageF = fpS.tex.stageF.d, vipF = fpS.tex.vipF.d, cl = fpS.tex.ceil.d;
    for (let y = 0; y < IH; y++) {
      const floor = y > hor;
      if (y === hor) { buf.fill(fogPix, y * IW, y * IW + IW); continue; }
      const rd = floor ? cz * proj / (y - hor) : (WALL_H - cz) * proj / (hor - y);
      let f = (rd - FOG0) / (FOG1 - FOG0); f = f < 0 ? 0 : f > 1 ? 1 : f;
      const row = y * IW;
      if (f > 0.985) { buf.fill(fogPix, row, row + IW); continue; }
      const fi = (f * 256) | 0, fo = 256 - fi, fR = fr * fi >> 8, fG = fgc * fi >> 8, fB = fb * fi >> 8;
      const sx = rd * (rx1 - rx0) / IW, sy = rd * (ry1 - ry0) / IW;
      let wx = px + rd * rx0, wy = py + rd * ry0;
      for (let x = 0; x < IW; x++, wx += sx, wy += sy) {
        if (wx < 0 || wy < 0 || wx >= MWT || wy >= MHT) { buf[row + x] = fogPix; continue; }
        const tx = (wx / T) | 0, ty = (wy / T) | 0, ux = wx - tx * T, uy = wy - ty * T;
        let c, kr, kg, kb;
        if (floor) {
          const tf = tileF[ty * MW + tx];
          if (tf === 3) {
            if (ux < 2.5 || uy < 2.5 || ux > 45.5 || uy > 45.5) { c = 0xff140812; kr = kg = kb = 200; }
            else { c = danceCol[ty * MW + tx]; const inner = ux > 9 && ux < 39 && uy > 9 && uy < 39; kr = kg = kb = inner ? 300 : 230; }
            kr = kr * fo >> 8; kg = kr; kb = kr;
          } else {
            const tt = tf === 1 ? stageF : tf === 2 ? vipF : club;
            c = tt[(((uy * TEXK) | 0) & 127) * 128 + (((ux * TEXK) | 0) & 127)];
            const L = LM[((wy / LMS) | 0) * LMW + ((wx / LMS) | 0)];
            kr = (L & 1023) * fo >> 8; kg = ((L >> 10) & 1023) * fo >> 8; kb = ((L >> 20) & 1023) * fo >> 8;
          }
        } else {
          c = cl[(((uy * 1.3334) | 0) & 63) * 64 + (((ux * 1.3334) | 0) & 63)];
          if ((c >>> 24) === 254) { kr = kg = kb = 300 * fo >> 8; }
          else { const L = LM[((wy / LMS) | 0) * LMW + ((wx / LMS) | 0)]; kr = (L & 1023) * 150 * fo >> 16; kg = ((L >> 10) & 1023) * 150 * fo >> 16; kb = ((L >> 20) & 1023) * 150 * fo >> 16; }
        }
        let r = ((c & 255) * kr >> 8) + fR, g = (((c >> 8) & 255) * kg >> 8) + fG, b = (((c >> 16) & 255) * kb >> 8) + fB;
        buf[row + x] = 0xff000000 | ((b > 255 ? 255 : b) << 16) | ((g > 255 ? 255 : g) << 8) | (r > 255 ? 255 : r);
      }
    }
    const fx0 = px / T, fy0 = py / T;
    for (let x = 0; x < IW; x++) {
      const camx = 2 * x / IW - 1, rdx = ca + plx * camx, rdy = sa + ply * camx;
      let mx = Math.floor(fx0), my = Math.floor(fy0);
      const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy);
      let stx, sty, sdx, sdy, side = 0, v = 0, n = 0;
      if (rdx < 0) { stx = -1; sdx = (fx0 - mx) * ddx; } else { stx = 1; sdx = (mx + 1 - fx0) * ddx; }
      if (rdy < 0) { sty = -1; sdy = (fy0 - my) * ddy; } else { sty = 1; sdy = (my + 1 - fy0) * ddy; }
      while (n++ < 80) {
        if (sdx < sdy) { sdx += ddx; mx += stx; side = 0; } else { sdy += ddy; my += sty; side = 1; }
        v = gAt(mx, my); if (v === W || v === BAR) break;
      }
      const pdt = side === 0 ? sdx - ddx : sdy - ddy;
      const pd = Math.max(0.5, pdt * T);
      zb[x] = pd;
      const hx = px + pdt * T * rdx, hy = py + pdt * T * rdy;
      let u = (side === 0 ? hy : hx) / T; u -= Math.floor(u);
      if (side === 0 && rdx < 0) u = 1 - u;
      if (side === 1 && rdy > 0) u = 1 - u;
      const face = side === 0 ? (stx < 0 ? 0 : 1) : (sty < 0 ? 2 : 3);
      const key = (my * MW + mx) * 4 + face;
      let tex = faceTex[key] || fpS.tex.wall;
      const d = faceDoor[key]; if (d && d.open > 0.25) tex = fpS.tex.curtainOpen;
      const tw = tex.w, td = tex.d, tcol = (u * 128) | 0;
      const li = ((((hy - rdy * 4) / LMS) | 0) * LMW + (((hx - rdx * 4) / LMS) | 0));
      const L0 = (li >= 0 && li < LMN) ? LM[li] : 0x0a0280a0;
      const sh = side === 0 ? 226 : 256;
      const lr = (L0 & 1023) * sh >> 8, lg = ((L0 >> 10) & 1023) * sh >> 8, lb = ((L0 >> 20) & 1023) * sh >> 8;
      let f = (pd - FOG0) / (FOG1 - FOG0); f = f < 0 ? 0 : f > 1 ? 1 : f;
      const fi = (f * 256) | 0, fo = 256 - fi, fR = fr * fi >> 8, fG = fgc * fi >> 8, fB = fb * fi >> 8;
      const lh = WALL_H * proj / pd, top = hor - (WALL_H - cz) * proj / pd;
      const y0 = Math.max(0, Math.ceil(top)), y1 = Math.min(IH, Math.ceil(top + lh));
      const vstep = 128 / lh; let tv = (y0 - top) * vstep;
      for (let y = y0; y < y1; y++, tv += vstep) {
        const vi = tv < 0 ? 0 : tv > 127 ? 127 : tv | 0;
        const c = td[vi * tw + tcol];
        let kr, kg, kb;
        if ((c >>> 24) === 254) { kr = kg = kb = 320 * fo >> 8; }
        else { const vs = vShade[vi] * fo >> 8; kr = lr * vs >> 8; kg = lg * vs >> 8; kb = lb * vs >> 8; }
        let r = ((c & 255) * kr >> 8) + fR, g = (((c >> 8) & 255) * kg >> 8) + fG, b = (((c >> 16) & 255) * kb >> 8) + fB;
        buf[y * IW + x] = 0xff000000 | ((b > 255 ? 255 : b) << 16) | ((g > 255 ? 255 : g) << 8) | (r > 255 ? 255 : r);
      }
    }
    fpS.cx.putImageData(fpS.img, 0, 0);
  }

  /* ================= FIRST-PERSON: SPRITES, HAND, HUD ================= */
  const fogAt = (d) => clamp((d - FOG0) / (FOG1 - FOG0), 0, 1);
  function fpProj(x, y) {
    const rx = x - cam.x, ry = y - cam.y, c = Math.cos(cam.ang), s = Math.sin(cam.ang);
    const fw = rx * c + ry * s, sd = -rx * s + ry * c;
    const pc = fpS.proj * cssW / fpS.IW;
    return { fw, sd, sc: pc / Math.max(fw, 0.001), sx: cssW / 2 + sd * pc / Math.max(fw, 0.001), hc: fpS.hor * cssW / fpS.IW };
  }
  function zVisible(sx, fw) { const c = Math.floor(sx * fpS.IW / cssW); return c >= 0 && c < fpS.IW && fpS.z[c] > fw; }
  function fpBlit(img, pr, zb, wW, wH, alpha, mode) {
    const w = wW * pr.sc, h = wH * pr.sc, left = pr.sx - w / 2, bottom = pr.hc + (cam.z - zb) * pr.sc;
    if (left > cssW || left + w < 0 || w < 0.5) return null;
    const k = fpS.IW / cssW, c0 = Math.max(0, Math.floor(left * k)), c1 = Math.min(fpS.IW - 1, Math.floor((left + w) * k));
    ctx.globalAlpha = alpha; if (mode) ctx.globalCompositeOperation = mode;
    let rs = -1, any = false;
    for (let c = c0; c <= c1 + 1; c++) {
      const vis = c <= c1 && fpS.z[c] > pr.fw;
      if (vis && rs < 0) rs = c;
      else if (!vis && rs >= 0) {
        const xa = Math.max(left, rs / k), xb = Math.min(left + w, c / k), sa = (xa - left) / w * img.width, sb = (xb - left) / w * img.width;
        if (sb - sa > 0.1) { ctx.drawImage(img, sa, 0, sb - sa, img.height, xa, bottom - h, xb - xa, h); any = true; }
        rs = -1;
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    return { x: pr.sx, top: bottom - h, bottom, w, h, any };
  }
  function fpBlitRot(img, pr, zb, wW, wH, rot, alpha) {
    if (!zVisible(pr.sx, pr.fw)) return;
    const w = wW * pr.sc, h = wH * pr.sc, bottom = pr.hc + (cam.z - zb) * pr.sc;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(pr.sx, bottom - h / 2); ctx.rotate(rot); ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore();
  }
  function fpGlow(img, x, y, z, size, alpha) {
    const pr = fpProj(x, y); if (pr.fw < 4 || !zVisible(pr.sx, pr.fw - 3)) return;
    const s = size * pr.sc, cy = pr.hc + (cam.z - z) * pr.sc;
    ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = alpha * (1 - fogAt(pr.fw));
    ctx.drawImage(img, pr.sx - s / 2, cy - s / 2, s, s);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
  }
  function bubble(c, x, y, text, alpha) {
    c.save(); c.globalAlpha = clamp(alpha, 0, 1); c.font = "800 12px 'Avenir Next', 'Segoe UI', sans-serif";
    const w = Math.min(cssW - 16, c.measureText(text).width + 16); x = clamp(x, w / 2 + 6, cssW - w / 2 - 6);
    c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 2; rr(c, x - w / 2, y - 24, w, 22, 11); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x - 5, y - 3); c.lineTo(x, y + 4); c.lineTo(x + 5, y - 3); c.closePath(); c.fill();
    c.fillStyle = "#b0106a"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, x, y - 12.5, cssW - 30); c.restore();
  }
  function hunkImg(o) {
    const set = fpS.spr["h_" + o.type + (o.vi || 0)] || fpS.spr["h_" + o.type + "0"];
    if (o.state === "spun") return set.spun;
    if (o.state === "carry") return set.carry;
    const mb = musicBeat() + (o.off || 0) / 2;
    return set.groove[((o.mv0 || 0) + Math.floor(mb / 8)) % GROOVE.length][Math.floor(mb * 2) & 3];
  }
  function fpRender(now) {
    const s = state, p = s.p;
    fpRenderWorld();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    const shx = s.shake ? rand(-s.shake, s.shake) : 0, shy = s.shake ? rand(-s.shake, s.shake) * 0.6 : 0;
    ctx.drawImage(fpS.cv, shx * dpr, shy * dpr, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, shx, shy);
    const hi = fpS.tier < 2;
    // moving dance-floor light spots + disco sparkle
    const mbt = musicBeat(), pulse = Math.exp(-(mbt % 1) * 3.2);
    if (hi) {
      for (let i = 0; i < 6; i++) { const a = mbt * 0.9 * (0.6 + i * 0.13) + i * 1.7, gx = 11.8 * T + Math.cos(a) * (2.4 + (i % 3)) * T, gy = 18.8 * T + Math.sin(a * 1.3) * 2.2 * T; fpGlow([fpS.glowPink, fpS.glowCyan, fpS.glowPurple][(i + Math.floor(mbt)) % 3], gx, gy, 2, 120, 0.25 + 0.35 * pulse); }
      fpGlow(fpS.glowWhite, 11.5 * T, 18.5 * T, WALL_H - 22, 70, 0.35 + 0.45 * pulse);
      fpGlow(fpS.glowPink, 18.5 * T, 3.6 * T, 60, 160, 0.35); fpGlow(fpS.glowGold, 2.6 * T, 5 * T, 60, 150, 0.35);
    }
    const list = [];
    for (const pr of fpProps) { if (pr.kind === "rope" && s.ropeOpen && s.ropeAnim <= 0) continue; list.push({ x: pr.x, y: pr.y, t: "prop", o: pr }); }
    for (const k of s.pickups) list.push({ x: k.x, y: k.y, t: "pick", o: k });
    for (const e of s.hunks) list.push({ x: e.x, y: e.y, t: "hunk", o: e });
    for (const c of CLUBBERS) list.push({ x: c[0] * T, y: c[1] * T, t: "club", o: c });
    const b = s.bride;
    if (!b.carrier) list.push({ x: b.x, y: b.y, t: "bride", o: b });
    for (const f of s.foams) list.push({ x: f.x, y: f.y, t: "foam", o: f });
    for (const k of s.roses) list.push({ x: k.x, y: k.y, t: "rose", o: k });
    list.forEach((it) => (it.pr = fpProj(it.x, it.y)));
    list.sort((a, c) => c.pr.fw - a.pr.fw);
    let brideRect = null;
    for (const it of list) {
      const pr = it.pr; if (pr.fw < 7) continue;
      const fa = 1 - fogAt(pr.fw) * 0.9, o = it.o;
      if (it.t === "prop") {
        const sp = fpS.spr[o.kind];
        const dims = { sofa: [62, 42, 0], table: [32, 42, 0], speaker: [34, 60, 0], stool: [16, 30, 0], rope: [46, 30, 0], disco: [26, 26, WALL_H - 34] }[o.kind];
        if (o.kind === "rope" && s.ropeOpen) { fpBlitRot(sp, pr, -4, dims[0], dims[1], 0, fa * s.ropeAnim); continue; }
        if (o.kind === "disco") { ctx.save(); fpBlit(sp, pr, dims[2], dims[0], dims[1], fa); ctx.restore(); continue; }
        if (zVisible(pr.sx, pr.fw)) { ctx.globalAlpha = 0.35 * fa; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(pr.sx, pr.hc + cam.z * pr.sc, dims[0] * 0.5 * pr.sc, 5 * pr.sc, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
        fpBlit(sp, pr, dims[2], dims[0], dims[1], fa);
      } else if (it.t === "pick") {
        const bob = Math.sin(o.bob) * 3, mg = o.type === "marg";
        if (hi) fpGlow(mg ? fpS.glowGreen : fpS.glowPink, o.x, o.y, 12 + bob, 50, 0.85);
        fpBlit(fpS.spr[o.type], pr, 3 + bob, mg ? 18 : 12, mg ? 22 : 26, fa);
      } else if (it.t === "hunk") {
        const tp = HT[o.type], img = hunkImg(o), hh = 74 * tp.scale, ww = hh * 120 / 190;
        if (o.state === "spun") { fpBlitRot(img, pr, 8, ww, hh, o.spin, fa * o.alpha); continue; }
        if (zVisible(pr.sx, pr.fw)) { ctx.globalAlpha = 0.4 * fa; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(pr.sx, pr.hc + cam.z * pr.sc, ww * 0.4 * pr.sc, 5 * pr.sc, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
        const shake = o.flash > 0 ? Math.sin(now * 90) * 3 : 0; pr.sx += shake;
        if (o.state === "carry") {
          const bimg = fpS.spr.bride.grabbed[Math.floor(b.dph / Math.PI) % 2];
          fpBlitRot(bimg, pr, 34 * tp.scale, 44, 66, -1.25 + Math.sin(now * 12) * 0.12, fa);
        }
        const r = fpBlit(img, pr, 0, ww, hh, fa);
        if (r && o.flash > 0) fpBlit(img, pr, 0, ww, hh, 0.55, "lighter");
        if (r && r.any) {
          if (o.slaps > 0) { const hs = r.w / 120; handprint(ctx, r.x - r.w * 0.085, r.top + r.h * 0.245, hs * 1.0, -0.3); if (o.slaps > 1) handprint(ctx, r.x + r.w * 0.085, r.top + r.h * 0.245, hs * 1.0, 0.3); }
          if (o.state === "carry") {
            ctx.save(); ctx.font = "900 " + Math.round(clamp(14 * pr.sc * 0.9, 11, 22)) + "px 'Avenir Next', sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.fillStyle = "#ff3f7a";
            ctx.strokeText("SLAP HIM!", r.x, r.top - 24); ctx.fillText("SLAP HIM!", r.x, r.top - 24); ctx.restore();
          }
          if (o.hp < o.maxHp && o.type !== "boss") { const bw = Math.max(24, r.w * 0.6); ctx.fillStyle = "rgba(0,0,0,.55)"; rr(ctx, r.x - bw / 2, r.top - 10, bw, 6, 3); ctx.fill(); ctx.fillStyle = "#ff5db4"; rr(ctx, r.x - bw / 2, r.top - 10, bw * clamp(o.hp / o.maxHp, 0, 1), 6, 3); ctx.fill(); }
          if (o.say && o.sayT > 0 && pr.fw < 460) bubble(ctx, r.x, r.top - 12, o.say, fa * Math.min(1, o.sayT * 3));
        }
      } else if (it.t === "club") {
        if (pr.fw > 760) continue;
        const img = fpS.spr.club[o[2]][Math.floor(mbt * 2 + o[3]) & 3], hh = 66, ww = hh * 120 / 190;
        if (zVisible(pr.sx, pr.fw)) { ctx.globalAlpha = 0.35 * fa; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(pr.sx, pr.hc + cam.z * pr.sc, ww * 0.35 * pr.sc, 4 * pr.sc, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
        fpBlit(img, pr, 0, ww, hh, fa * 0.92);
      } else if (it.t === "bride") {
        const set = fpS.spr.bride, img = o.state === "walk" ? set.walk[Math.floor(o.dph / Math.PI) % 2] : set.dance[Math.floor(mbt * 2) & 3];
        if (hi) fpGlow(fpS.glowWhite, o.x, o.y, 30, 90, 0.35);
        if (zVisible(pr.sx, pr.fw)) { ctx.globalAlpha = 0.4 * fa; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(pr.sx, pr.hc + cam.z * pr.sc, 18 * pr.sc, 5 * pr.sc, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
        const r = fpBlit(img, pr, 0, 66 * 120 / 190, 66, fa);
        brideRect = r && r.any ? r : null;
        if (r && o.say && o.sayT > 0) bubble(ctx, r.x, r.top - 40, o.say, Math.min(1, o.sayT * 3));
      } else if (it.t === "foam") {
        if (!zVisible(pr.sx, pr.fw)) continue;
        const cy = pr.hc + (cam.z - o.z) * pr.sc, sz = (5 + o.t * 14) * pr.sc * o.sz;
        ctx.globalAlpha = clamp(o.life * 2.2, 0, 0.9) * fa; ctx.fillStyle = o.t < 0.15 ? "#fff6e0" : "#ffe0f0";
        ctx.beginPath(); ctx.arc(pr.sx, cy, sz, 0, 7); ctx.arc(pr.sx + sz * 0.7, cy - sz * 0.4, sz * 0.7, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      } else if (it.t === "rose") {
        if (!zVisible(pr.sx, pr.fw)) continue;
        const cy = pr.hc + (cam.z - 34) * pr.sc, sz = 7 * pr.sc;
        if (hi) { ctx.globalCompositeOperation = "lighter"; ctx.drawImage(fpS.glowPink, pr.sx - sz * 3, cy - sz * 3, sz * 6, sz * 6); ctx.globalCompositeOperation = "source-over"; }
        ctx.save(); ctx.translate(pr.sx, cy); ctx.rotate(o.t * 9); ctx.fillStyle = "#e0103a"; ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, sz, 0, 7); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#8a0820"; ctx.beginPath(); ctx.arc(0, 0, sz * 0.5, 0, 5); ctx.stroke(); ctx.strokeStyle = "#1f8a3a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, sz); ctx.lineTo(0, sz * 2.6); ctx.stroke(); ctx.restore();
      }
    }
    // world particles
    for (const q of s.parts) {
      const pr = fpProj(q.x, q.y); if (pr.fw < 6 || !zVisible(pr.sx, pr.fw)) continue;
      const cy = pr.hc + (cam.z - (q.z || 30)) * pr.sc, sz = q.size * pr.sc * 0.9;
      ctx.globalAlpha = clamp(q.life / q.max * 1.4, 0, 1); ctx.fillStyle = q.color;
      if (q.kind === "confetti") { ctx.save(); ctx.translate(pr.sx, cy); ctx.rotate(q.rot); ctx.fillRect(-sz, -sz * 0.45, sz * 2, sz * 0.9); ctx.restore(); }
      else if (q.kind === "heart") { heart(ctx, pr.sx, cy, sz * 1.2); ctx.fill(); }
      else if (q.kind === "glitter" || q.kind === "star") { ctx.save(); ctx.translate(pr.sx, cy); ctx.rotate(q.rot); ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.lineTo(0, -sz * 1.5); ctx.rotate(Math.PI / 4); ctx.lineTo(0, -sz * 0.4); ctx.rotate(Math.PI / 4); } ctx.closePath(); ctx.fill(); ctx.restore(); }
      else { ctx.beginPath(); ctx.arc(pr.sx, cy, sz, 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    // pops
    for (const q of s.pops) {
      const a = clamp(q.life / q.max * 1.5, 0, 1); let x, y, size = q.size;
      const pr = fpProj(q.x, q.y); if (pr.fw < 10) continue;
      x = clamp(pr.sx, 40, cssW - 40); y = pr.hc + (cam.z - 70) * pr.sc - (1 - q.life / q.max) * 26; size = clamp(size * pr.sc * 1.6, 12, 34);
      if (pr.fw < 120) y = Math.max(y, cssH * 0.22);
      ctx.globalAlpha = a; ctx.font = "900 " + Math.round(size) + "px 'Avenir Next', 'Segoe UI', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeText(q.text, x, y); ctx.fillStyle = q.color; ctx.fillText(q.text, x, y);
    }
    ctx.globalAlpha = 1;
    if (vignette) ctx.drawImage(vignette, 0, 0, cssW, cssH);
    drawBrideMarker(now, brideRect);
  }
  function drawBrideMarker(now, rect) {
    const s = state, b = s.bride;
    const pr = fpProj(b.x, b.y), pulse = 1 + Math.sin(now * 6) * 0.1;
    const danger = b.danger / 100;
    const col = danger > 0.6 || b.carrier ? "#ff2a4a" : "#ff5db4";
    let mx, my, on = pr.fw > 8 && pr.sx > 14 && pr.sx < cssW - 14;
    if (on) { mx = pr.sx; my = rect ? rect.top - 12 : pr.hc + (cam.z - 80) * pr.sc; my = clamp(my, 70, cssH - 120); }
    const c = ctx;
    if (on) {
      const hs = clamp(13 * pr.sc * 2.2, 9, 18) * pulse;
      c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = 0.7; c.drawImage(fpS.glowPink, mx - hs * 2.5, my - hs * 2.5, hs * 5, hs * 5); c.restore();
      c.fillStyle = col; heart(c, mx, my, hs); c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 2.2; c.stroke();
      if (s.phase === "intro" || pr.fw < 260 || b.carrier) {
        c.font = "900 " + (s.phase === "intro" ? 13 : 10) + "px 'Avenir Next', sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.lineWidth = 4; c.strokeStyle = INK;
        const t = b.carrier ? "HELP ME!" : "PROTECT ME"; c.strokeText(t, mx, my - hs - 10); c.fillStyle = "#fff"; c.fillText(t, mx, my - hs - 10);
      }
    } else if (s.phase === "play") {
      let da = Math.atan2(b.y - cam.y, b.x - cam.x) - cam.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
      const right = da > 0, ex = right ? cssW - 26 : 26, ey = cssH * 0.46;
      c.save(); c.translate(ex, ey); c.globalAlpha = 0.95;
      c.fillStyle = col; heart(c, 0, 0, 13 * pulse); c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 2; c.stroke();
      c.fillStyle = "#fff"; c.beginPath(); const dir = right ? 1 : -1; c.moveTo(dir * 22, 0); c.lineTo(dir * 12, -8); c.lineTo(dir * 12, 8); c.closePath(); c.fill();
      c.font = "900 9px 'Avenir Next', sans-serif"; c.textAlign = "center"; c.lineWidth = 3; c.strokeStyle = INK; c.strokeText(BN().toUpperCase(), 0, 24); c.fillText(BN().toUpperCase(), 0, 24);
      c.restore();
    }
  }
  function drawHand(now) {
    const p = state.p, c = ctx, S = Math.min(cssW / 390, cssH / 700) * 1.05, fr = p.superT > 0;
    const mv = p.moving ? 1 : 0.25, bx0 = Math.sin(p.walk * 0.5) * 8 * mv, by0 = Math.abs(Math.cos(p.walk * 0.5)) * 8 * mv;
    const dur = fr ? 0.13 : 0.2, k = p.slapT > 0 ? 1 - p.slapT / dur : 0, sw = p.slapT > 0 ? Math.sin(k * Math.PI) : 0;
    const side = p.slapSide;
    // champagne bottle in the left hand during frenzy
    if (fr) {
      c.save(); c.translate(cssW * 0.2 + bx0 * 0.5, cssH - 30 * S + by0); c.scale(S, S); c.rotate(0.75);
      c.globalCompositeOperation = "lighter"; c.drawImage(fpS.glowPink, -70, -170, 140, 140); c.globalCompositeOperation = "source-over";
      const bg = c.createLinearGradient(-26, 0, 26, 0); bg.addColorStop(0, "#a0084a"); bg.addColorStop(0.45, "#ff7ac8"); bg.addColorStop(1, "#90083a");
      c.fillStyle = bg; c.beginPath(); c.moveTo(-10, -150); c.lineTo(10, -150); c.lineTo(10, -110); c.quadraticCurveTo(30, -95, 30, -70); c.lineTo(30, 40); c.lineTo(-30, 40); c.lineTo(-30, -70); c.quadraticCurveTo(-30, -95, -10, -110); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 5; c.stroke();
      c.fillStyle = "#ffcf5a"; c.fillRect(-11, -150, 22, 36); c.strokeRect(-11, -150, 22, 36);
      c.fillStyle = "#fff6e8"; rr(c, -24, -60, 48, 34, 6); c.fill(); c.stroke(); c.fillStyle = "#c0106a"; c.font = "900 12px Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("BUBBLY", 0, -43);
      c.fillStyle = "#f6c7a8"; c.beginPath(); c.ellipse(0, 10, 40, 30, 0, 0, 7); c.fill(); c.stroke();
      // spray stream
      for (let i = 0; i < 9; i++) { const t = (now * 3 + i / 9) % 1, sx = Math.sin(i * 7.3 + now * 20) * 10 * t; c.globalAlpha = 0.85 * (1 - t); c.fillStyle = i % 2 ? "#ffffff" : "#ffe0f0"; c.beginPath(); c.arc(sx, -160 - t * 260, 8 + t * 22, 0, 7); c.fill(); }
      c.globalAlpha = 1; c.restore();
    }
    // slapping hand
    const tx = side > 0 ? cssW * (0.74 - 0.38 * sw) : cssW * (0.74 - 0.38 * (1 - sw) * (k > 0 ? 1 : 0)), ty = cssH + 6 * S + by0 - sw * 120 * S;
    const x = (p.slapT > 0 ? tx : cssW * 0.74 + bx0), y = (p.slapT > 0 ? ty : cssH + 10 * S + by0);
    const rot = p.slapT > 0 ? (-0.35 - sw * 0.9 * side) : -0.3;
    if (p.slapT > 0) { // swoosh
      c.save(); c.strokeStyle = fr ? "rgba(255,140,210,.7)" : "rgba(255,255,255,.55)"; c.lineCap = "round";
      for (let i = 0; i < 3; i++) { c.lineWidth = (10 - i * 3) * S; c.beginPath(); c.arc(cssW * 0.55, cssH * 0.95, (230 + i * 26) * S, Math.PI * (1.25 + (side > 0 ? 0.25 : 0) - 0.2 * k), Math.PI * (1.45 + (side > 0 ? 0.25 : 0) + 0.1 * k)); c.stroke(); }
      c.restore();
    }
    c.save(); c.translate(x, y); c.scale(S * (1 + sw * 0.25), S * (1 + sw * 0.25)); c.rotate(rot);
    if (fr) { c.globalCompositeOperation = "lighter"; c.globalAlpha = 0.75 + Math.sin(now * 14) * 0.2; c.drawImage(fpS.glowPink, -120, -230, 240, 240); c.globalAlpha = 1; c.globalCompositeOperation = "source-over"; }
    // sleeve (bridesmaid satin) + bracelet
    const sg = c.createLinearGradient(-40, 0, 40, 0); sg.addColorStop(0, "#c0307a"); sg.addColorStop(0.5, "#ff8ac8"); sg.addColorStop(1, "#b0206a");
    rr(c, -34, -20, 68, 200, 30); c.fillStyle = "#f2c29b"; c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
    rr(c, -40, 40, 80, 160, 30); c.fillStyle = sg; c.fill(); c.stroke();
    c.fillStyle = "#ffcf5a"; rr(c, -36, -8, 72, 12, 6); c.fill(); c.lineWidth = 3; c.stroke();
    [-24, -8, 8, 24].forEach((bx) => { c.fillStyle = "#7fe7ff"; c.beginPath(); c.arc(bx, -2, 3, 0, 7); c.fill(); });
    // hand (back of hand, fingers up)
    c.lineWidth = 5; c.strokeStyle = INK; c.fillStyle = "#f2c29b";
    rr(c, -40, -92, 80, 82, 30); c.fill(); c.stroke();
    const fingers = [[-30, -96, -0.18, 46], [-11, -104, -0.06, 54], [9, -104, 0.06, 52], [27, -96, 0.18, 42]];
    fingers.forEach(([fx, fy, r, L]) => {
      c.save(); c.translate(fx, fy); c.rotate(r);
      rr(c, -9.5, -L, 19, L + 14, 9.5); c.fillStyle = "#f2c29b"; c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
      c.fillStyle = "#ff3f9a"; rr(c, -6.5, -L + 2, 13, 15, 6); c.fill(); c.lineWidth = 2.5; c.stroke();
      c.fillStyle = "rgba(255,255,255,.6)"; c.fillRect(-3.5, -L + 5, 2.5, 7);
      c.strokeStyle = "rgba(120,60,40,.45)"; c.lineWidth = 2; c.beginPath(); c.moveTo(-5, -L * 0.45); c.lineTo(5, -L * 0.45); c.stroke();
      c.restore();
    });
    c.save(); c.translate(-44, -44); c.rotate(-0.9); rr(c, -10, -40, 20, 50, 10); c.fillStyle = "#f2c29b"; c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); c.fillStyle = "#ff3f9a"; rr(c, -7, -38, 14, 13, 6); c.fill(); c.lineWidth = 2.5; c.stroke(); c.restore();
    c.strokeStyle = "rgba(120,60,40,.35)"; c.lineWidth = 2.5; [-22, -4, 14].forEach((kx) => { c.beginPath(); c.arc(kx + 5, -78, 5, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); });
    c.fillStyle = "rgba(255,110,140,.25)"; c.beginPath(); c.ellipse(0, -50, 26, 16, 0, 0, 7); c.fill();
    c.restore();
    // impact
    if (p.slapHit && p.slapT > 0 && k > 0.35) {
      const ix = cssW / 2 + (side > 0 ? -10 : 10), iy = fpS.hor * cssW / fpS.IW - 30;
      c.save(); c.translate(ix, iy); c.rotate(now * 3); c.fillStyle = fr ? "#ff8fd0" : "#fff6c0"; c.strokeStyle = INK; c.lineWidth = 3;
      c.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? 16 : 40 * (1 + sw * 0.3); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); c.restore();
    }
  }
  function drawCrosshair() {
    const t = state.phase === "play" ? slapTargets(state.p.superT > 0 ? 112 : 98, 0.42) : null;
    const cx = cssW / 2, cy = fpS.hor * cssW / fpS.IW - 10, r = t ? 14 : 10;
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(20,6,14,.7)"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = t ? "#ff5db4" : "rgba(255,255,255,.8)"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    if (t) { ctx.font = "900 11px 'Avenir Next', sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.strokeText("IN RANGE", cx, cy + 26); ctx.fillStyle = "#ff8fd0"; ctx.fillText("IN RANGE", cx, cy + 26); }
  }
  function drawHud(now) {
    const s = state, p = s.p, b = s.bride, c = ctx, top = 52;
    // health
    c.fillStyle = "rgba(20,6,24,.62)"; rr(c, 10, top, 172, 22, 11); c.fill();
    const hpw = 140 * clamp(p.hp / 100, 0, 1);
    const hg = c.createLinearGradient(34, 0, 174, 0); hg.addColorStop(0, p.hp < 35 ? "#ff3d5a" : "#b8ff6a"); hg.addColorStop(1, p.hp < 35 ? "#ff7a8a" : "#3fe6ff");
    c.fillStyle = hg; rr(c, 36, top + 4, Math.max(6, hpw), 14, 7); c.fill();
    c.fillStyle = "#b8ff6a"; c.font = "900 13px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("\u2726", 22, top + 11.5);
    c.fillStyle = "#1a0a16"; c.font = "800 10px 'Avenir Next', sans-serif"; c.textAlign = "left"; c.fillText("MAID OF HONOUR", 42, top + 11.5);
    // bride danger
    const dg = b.danger / 100, flash = dg > 0.65 && Math.floor(now * 6) % 2 === 0;
    c.fillStyle = flash ? "rgba(140,0,30,.8)" : "rgba(20,6,24,.62)"; rr(c, 10, top + 27, 172, 22, 11); c.fill();
    c.fillStyle = "rgba(255,255,255,.12)"; rr(c, 36, top + 31, 140, 14, 7); c.fill();
    const dgr = c.createLinearGradient(36, 0, 176, 0); dgr.addColorStop(0, "#ffcf5a"); dgr.addColorStop(1, "#ff2a4a");
    if (dg > 0) { c.fillStyle = dgr; rr(c, 36, top + 31, Math.max(6, 140 * dg), 14, 7); c.fill(); }
    c.fillStyle = dg > 0.6 ? "#ff2a4a" : "#ff5db4"; heart(c, 22, top + 38, 6.5 * (1 + (dg > 0.65 ? Math.sin(now * 14) * 0.15 : 0))); c.fill();
    c.fillStyle = "#fff"; c.font = "800 10px 'Avenir Next', sans-serif"; c.textAlign = "left"; c.fillText(BN().toUpperCase() + " DANGER" + (b.carrier ? " · SLAP HIM!" : ""), 42, top + 38.5);
    // hold timer ring
    if (b.hold > 0) {
      const rx = cssW / 2, ry = top + 42, frac = b.hold / b.holdMax;
      c.fillStyle = "rgba(20,6,24,.7)"; c.beginPath(); c.arc(rx + 60, ry, 0, 0, 7); c.fill();
    }
    // slapped count
    c.textAlign = "right"; c.fillStyle = "#fff"; c.font = "800 12px 'Avenir Next', sans-serif"; c.fillText("Slapped " + s.slapped + " \uD83D\uDC4B", cssW - 12, top + 9);
    // frenzy ring
    if (p.superT > 0) {
      const rx = 40, ry = top + 92, frac = p.superT / SUPER_TIME;
      c.fillStyle = "rgba(60,8,40,.8)"; c.beginPath(); c.arc(rx, ry, 25, 0, 7); c.fill();
      c.strokeStyle = "rgba(255,255,255,.18)"; c.lineWidth = 5; c.beginPath(); c.arc(rx, ry, 21, 0, 7); c.stroke();
      c.strokeStyle = "#ff5db4"; c.lineCap = "round"; c.beginPath(); c.arc(rx, ry, 21, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); c.stroke(); c.lineCap = "butt";
      c.fillStyle = "#fff"; c.textAlign = "center"; c.font = "900 18px 'Avenir Next', sans-serif"; c.fillText(String(Math.ceil(p.superT)), rx, ry + 1);
      c.font = "900 9px 'Avenir Next', sans-serif"; c.fillStyle = "#ff9ad8"; c.fillText("BUBBLY", rx, ry + 34);
      c.fillText("FRENZY", rx, ry + 45);
    }
    if (s.boss) {
      const bw = Math.min(220, cssW - 60), bx = (cssW - bw) / 2, by = cssH - (isTouch ? 210 : 34) - (!$("assist-bar").hidden ? 60 : 0);
      c.fillStyle = "rgba(20,6,24,.75)"; rr(c, bx - 4, by - 16, bw + 8, 30, 10); c.fill();
      c.fillStyle = "#ffcf5a"; c.font = "900 10px 'Avenir Next', sans-serif"; c.textAlign = "center"; c.fillText("MR. SEXY", cssW / 2, by - 7);
      c.fillStyle = "#ff5db4"; rr(c, bx, by, bw * clamp(s.boss.hp / s.boss.maxHp, 0, 1), 8, 4); c.fill();
    }
    if (sticks.move) {
      const st = sticks.move; c.strokeStyle = "#ffcf5a"; c.lineWidth = 3; c.globalAlpha = 0.5; c.beginPath(); c.arc(st.ox, st.oy, 56, 0, 7); c.stroke();
      c.globalAlpha = 0.75; c.fillStyle = "#ffcf5a"; c.beginPath(); c.arc(st.x, st.y, 24, 0, 7); c.fill(); c.globalAlpha = 1;
    }
    if (s.hintT > 0 && s.phase === "play") {
      c.globalAlpha = Math.min(1, s.hintT); c.fillStyle = "rgba(20,6,24,.75)";
      const msg = isTouch ? "Left thumb: move  ·  Drag right: look  ·  Hold SLAP" : "WASD: move  ·  Mouse: look  ·  Click: slap";
      c.font = "800 12px 'Avenir Next', sans-serif"; c.textAlign = "center"; const w = c.measureText(msg).width + 24;
      rr(c, (cssW - w) / 2, cssH * 0.3, w, 28, 14); c.fill(); c.fillStyle = "#fff"; c.fillText(msg, cssW / 2, cssH * 0.3 + 14.5);
      c.globalAlpha = 1;
    }
  }
  function fpHudExtras(now) {
    const s = state, p = s.p, c = ctx;
    if (s.mohSayT > 0 && s.mohSay) {
      const a = clamp(s.mohSayT * 3, 0, 1), y = cssH * 0.62;
      c.save(); c.globalAlpha = a; c.font = "italic 900 18px 'Avenir Next', 'Segoe UI', sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
      const t = "You: \u201C" + s.mohSay + "\u201D", w = Math.min(cssW - 24, c.measureText(t).width + 26);
      c.fillStyle = "rgba(30,6,30,.75)"; rr(c, cssW / 2 - w / 2, y - 17, w, 34, 17); c.fill(); c.strokeStyle = "#ff5db4"; c.lineWidth = 2; c.stroke();
      c.fillStyle = "#ffd6ec"; c.fillText(t, cssW / 2, y + 1, cssW - 40); c.restore();
    }
    const R = 44, mx = cssW - R - 12, my = 160, b = s.bride;
    c.save(); c.beginPath(); c.arc(mx, my, R, 0, 7); c.fillStyle = "rgba(14,4,20,.78)"; c.fill(); c.clip();
    c.drawImage(mmCanvas, mx - p.x * MMS, my - p.y * MMS, MW * T * MMS, MH * T * MMS);
    for (const k of s.pickups) { c.fillStyle = k.type === "marg" ? "#b8ff6a" : "#ff8fd0"; c.beginPath(); c.arc(mx + (k.x - p.x) * MMS, my + (k.y - p.y) * MMS, 2.2, 0, 7); c.fill(); }
    for (const e of s.hunks) { if (e.state === "spun") continue; c.fillStyle = e.type === "boss" ? "#ffcf5a" : e.state === "carry" ? "#ff2a4a" : "#3fe6ff"; c.beginPath(); c.arc(mx + (e.x - p.x) * MMS, my + (e.y - p.y) * MMS, e.type === "boss" ? 4 : 2.6, 0, 7); c.fill(); }
    const wp = WP[Math.min(b.wp, WP.length - 1)];
    c.fillStyle = "#ffcf5a"; c.beginPath(); c.arc(mx + (wp.x * T - p.x) * MMS, my + (wp.y * T - p.y) * MMS, 3, 0, 7); c.fill();
    c.restore();
    { const ex = (b.x - p.x) * MMS, ey = (b.y - p.y) * MMS, ed = Math.hypot(ex, ey), k2 = ed > R - 8 ? (R - 8) / ed : 1, pu = 1 + 0.2 * Math.sin(now * 6);
      c.fillStyle = b.carrier || b.danger > 60 ? "#ff2a4a" : "#ff5db4"; heart(c, mx + ex * k2, my + ey * k2, 5 * pu); c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 1.3; c.stroke(); }
    c.save(); c.translate(mx, my); c.rotate(p.ang); c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(8, 0); c.lineTo(-5, -5.5); c.lineTo(-2, 0); c.lineTo(-5, 5.5); c.closePath(); c.fill(); c.stroke();
    c.globalAlpha = 0.18; c.fillStyle = "#fff"; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, -FOVH / 2, FOVH / 2); c.closePath(); c.fill(); c.restore();
    c.strokeStyle = "#ff5db4"; c.lineWidth = 2; c.beginPath(); c.arc(mx, my, R, 0, 7); c.stroke();
    if (isTouch) {
      const fx = cssW - 74, fy = cssH - 132, on = !!fpS.fire;
      c.globalAlpha = on ? 0.95 : 0.75; c.fillStyle = on ? "#ff3f9a" : "rgba(30,6,30,.62)"; c.beginPath(); c.arc(fx, fy, 46, 0, 7); c.fill();
      c.lineWidth = 3; c.strokeStyle = p.superT > 0 ? "#ffffff" : "#ff8fd0"; c.stroke();
      c.globalAlpha = 1; c.font = "30px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("\uD83D\uDC4B", fx, fy - 6);
      c.fillStyle = "#fff"; c.font = "900 11px 'Avenir Next', sans-serif"; c.fillText(p.superT > 0 ? "SPRAY!" : "SLAP", fx, fy + 27);
    }
  }
  function fpPointerDown(e, pt) {
    if (e.pointerType === "mouse") {
      mouse.down = true; mouse.active = true; mouse.lx = pt.x;
      if (canvas.requestPointerLock && document.pointerLockElement !== canvas && !navigator.webdriver) { try { canvas.requestPointerLock(); } catch (_) {} }
      return;
    }
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    const fx = cssW - 74, fy = cssH - 132;
    if (!fpS.fire && Math.hypot(pt.x - fx, pt.y - fy) < 60) { fpS.fire = { id: e.pointerId, lx: pt.x }; return; }
    if (pt.x < cssW * 0.45 && !sticks.move) { sticks.move = { id: e.pointerId, ox: pt.x, oy: pt.y, x: pt.x, y: pt.y }; return; }
    if (!fpS.look) fpS.look = { id: e.pointerId, lx: pt.x };
  }
  function fpPointerMove(e, pt) {
    if (!state || state.phase !== "play") return;
    if (e.pointerType === "mouse") {
      if (document.pointerLockElement === canvas) state.p.ang += (e.movementX || 0) * 0.0032;
      else if (mouse.down) state.p.ang += (pt.x - (mouse.lx || pt.x)) * 0.007;
      mouse.lx = pt.x; return;
    }
    for (const k of ["fire", "look"]) { const l = fpS[k]; if (l && l.id === e.pointerId) { state.p.ang += (pt.x - l.lx) * 0.0095; l.lx = pt.x; } }
    const s = sticks.move;
    if (s && s.id === e.pointerId) { s.x = pt.x; s.y = pt.y; const dx = s.x - s.ox, dy = s.y - s.oy, d = Math.hypot(dx, dy); if (d > 56) { s.ox = s.x - dx / d * 56; s.oy = s.y - dy / d * 56; } }
  }
  function fpPointerUp(e) {
    if (e.pointerType === "mouse") { mouse.down = false; return; }
    if (fpS.fire && fpS.fire.id === e.pointerId) fpS.fire = null;
    if (fpS.look && fpS.look.id === e.pointerId) fpS.look = null;
    if (sticks.move && sticks.move.id === e.pointerId) sticks.move = null;
  }

  /* ================= OPENING CINEMATIC ================= */
  const PI = Math.PI;
  const IKEYS = [
    { t: 0, x: 11.5, y: 25.3, z: 92, a: -PI / 2, p: 0.2 },
    { t: 1.5, x: 11.5, y: 22.0, z: 100, a: -PI / 2 - 0.5, p: 0.25 },
    { t: 3.0, x: 6.0, y: 18.6, z: 100, a: -0.6, p: 0.23 },
    { t: 4.3, x: 15.6, y: 15.5, z: 90, a: 2.2, p: 0.19 },
    { t: 5.4, x: 11.5, y: 19.3, z: 52, a: PI / 2, p: 0.03 },
    { t: 7.5, x: 11.5, y: 19.3, z: 52, a: PI / 2, p: 0.03 },
  ];
  const INTRO_ORBIT = 7.5, INTRO_LEN = 8.8;
  function lerpAng(a, b, t) { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * t; }
  function introCam(t) {
    const b = state.bride;
    if (t >= INTRO_ORBIT) {
      const k = sstep((t - INTRO_ORBIT) / (INTRO_LEN - INTRO_ORBIT)), th = -PI / 2 + PI * k, R = (1.9 + 0.8 * k) * T;
      cam.x = b.x + Math.cos(th) * R; cam.y = b.y + Math.sin(th) * R; cam.z = 52 - 14 * k; cam.ang = th + PI; cam.pitch = 0.03 * (1 - k);
      return;
    }
    let i = 0; while (i < IKEYS.length - 2 && t > IKEYS[i + 1].t) i++;
    const A = IKEYS[i], B = IKEYS[i + 1], k = sstep((t - A.t) / (B.t - A.t));
    cam.x = (A.x + (B.x - A.x) * k) * T; cam.y = (A.y + (B.y - A.y) * k) * T; cam.z = A.z + (B.z - A.z) * k; cam.ang = lerpAng(A.a, B.a, k); cam.pitch = A.p + (B.p - A.p) * k;
  }
  function updateIntro(dt) {
    const s = state; s.intro.t += dt; s.bride.dph += dt * 7.5; s.bride.state = "dance";
    if (s.intro.t > 5.6 && !s.intro.woo) { s.intro.woo = true; brideSay(BRIDE_WOO, "Whoo! Girls night!"); }
    if (s.intro.t >= INTRO_LEN) endIntro();
  }
  function endIntro() {
    const s = state; if (s.phase !== "intro") return;
    s.phase = "play"; s.hintT = 6; playedIntro = true; s.bride.sayT = 0;
    const cp = CPS[0]; s.p.x = cp.p[0] * T; s.p.y = cp.p[1] * T; s.p.ang = cp.a; s.p.inv = 1;
    s.spawnT = 1.6; setObj();
  }
  function drawIntroOverlay(now) {
    const s = state, t = s.intro.t, c = ctx;
    const bar = cssH * 0.1 * (t > INTRO_LEN - 0.6 ? clamp((INTRO_LEN - t) / 0.6, 0, 1) : 1);
    c.fillStyle = "#000"; c.fillRect(0, 0, cssW, bar); c.fillRect(0, cssH - bar, cssW, bar);
    if (t < 0.5) { c.fillStyle = "rgba(0,0,0," + (1 - t / 0.5) + ")"; c.fillRect(0, 0, cssW, cssH); }
    c.textAlign = "center"; c.textBaseline = "middle";
    if (t > 0.4 && t < 4.6) {
      const a = clamp(Math.min((t - 0.4) / 0.5, (4.6 - t) / 0.5), 0, 1);
      c.save(); c.globalAlpha = a; c.shadowColor = "#ff3fae"; c.shadowBlur = 18;
      c.font = "900 15px 'Avenir Next', sans-serif"; c.fillStyle = "#7fe7ff"; c.fillText("TONIGHT AT THE VELVET ROOM", cssW / 2, bar + 34);
      c.font = "900 38px 'Avenir Next', 'Arial Black', sans-serif"; c.lineWidth = 3; c.strokeStyle = "#ff3fae"; c.strokeText("PROTECT", cssW / 2, bar + 74); c.fillStyle = "#fff"; c.fillText("PROTECT", cssW / 2, bar + 74);
      c.strokeText("THE BRIDE", cssW / 2, bar + 114); c.fillText("THE BRIDE", cssW / 2, bar + 114);
      c.restore();
    }
    const lines = [[5.5, "This is " + BN() + "."], [6.3, "She's getting married."], [7.1, "Keep it that way."]];
    const fadeAll = t > INTRO_LEN - 0.5 ? clamp((INTRO_LEN - t) / 0.5, 0, 1) : 1;
    lines.forEach(([t0, txt], i) => {
      if (t < t0) return;
      const a = clamp((t - t0) / 0.35, 0, 1) * fadeAll, y = cssH - bar - 112 + i * 34, sc = 0.85 + 0.15 * sstep((t - t0) / 0.3);
      c.save(); c.globalAlpha = a; c.translate(cssW / 2, y); c.scale(sc, sc);
      c.font = (i === 2 ? "900 27px" : "800 23px") + " 'Avenir Next', 'Segoe UI', sans-serif"; c.lineWidth = 6; c.strokeStyle = INK; c.strokeText(txt, 0, 0);
      c.fillStyle = i === 2 ? "#ff8fd0" : "#fff"; c.fillText(txt, 0, 0); c.restore();
    });
    c.globalAlpha = 0.75; c.font = "800 12px 'Avenir Next', sans-serif"; c.fillStyle = "#fff"; c.textAlign = "right"; c.fillText("Tap to skip \u25B6\u25B6", cssW - 14, cssH - bar / 2); c.globalAlpha = 1;
  }

  /* ================= FAIL GAG: the morning after ================= */
  function failSounds(t0, t1) {
    const at = (t) => t0 < t && t1 >= t;
    if (at(0.7)) { [0, 0.12, 0.3].forEach((d) => tone(2600, 0.07, "sine", 0.06, 3400, d)); }
    if (at(1.25)) sfx.facepalm();
  }
  function drawGirlHead(c, x, y, s, hair, skin, mode) {
    c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 2.5; c.strokeStyle = INK;
    c.fillStyle = hair; c.beginPath(); c.ellipse(0, -2, 22, 22, 0, 0, 7); c.fill(); c.stroke();
    if (mode === "messy") { for (let i = 0; i < 7; i++) { const a = -PI * 0.95 + i * 0.3; c.beginPath(); c.moveTo(Math.cos(a) * 18, Math.sin(a) * 18 - 2); c.quadraticCurveTo(Math.cos(a) * 30, Math.sin(a) * 30, Math.cos(a + 0.2) * 34, Math.sin(a + 0.2) * 32); c.lineWidth = 4; c.strokeStyle = hair; c.stroke(); } c.strokeStyle = INK; c.lineWidth = 2.5; }
    c.fillStyle = skin; c.beginPath(); c.ellipse(0, 4, 16, 18, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = hair; c.beginPath(); c.moveTo(-16, 0); c.quadraticCurveTo(-12, -16, 2, -14); c.quadraticCurveTo(14, -13, 16, 0); c.quadraticCurveTo(6, -8, -2, -6); c.quadraticCurveTo(-10, -5, -16, 0); c.closePath(); c.fill(); c.stroke();
    c.restore(); return c;
  }
  function drawFailGag(now) {
    const s = state, f = s.fail, t = f.t - 0.35, c = ctx, W2 = cssW, H2 = cssH, k = Math.min(W2 / 390, H2 / 720);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    // wall
    const wg = c.createLinearGradient(0, 0, 0, H2); wg.addColorStop(0, "#f7d9ea"); wg.addColorStop(1, "#e8b8d8"); c.fillStyle = wg; c.fillRect(0, 0, W2, H2);
    c.fillStyle = "rgba(255,120,180,.18)"; for (let y = 30; y < H2 * 0.7; y += 46) for (let x = ((y / 46) % 2) * 23; x < W2; x += 46) { heart(c, x, y, 7); c.fill(); }
    // window + sunrise
    const wx = W2 * 0.56, wy = H2 * 0.08, ww = W2 * 0.38, wh = H2 * 0.22;
    const sky = c.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, "#ffd27a"); sky.addColorStop(1, "#ff9a7a"); c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
    c.fillStyle = "#fff6c0"; c.beginPath(); c.arc(wx + ww * 0.5, wy + wh * 0.85, 26 * k, PI, 0); c.fill();
    c.strokeStyle = "#fff"; c.lineWidth = 6 * k; c.strokeRect(wx, wy, ww, wh); c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.stroke();
    c.fillStyle = "#c0307a"; c.fillRect(wx - 12 * k, wy - 8 * k, 16 * k, wh + 20 * k); c.fillRect(wx + ww - 4 * k, wy - 8 * k, 16 * k, wh + 20 * k);
    // floor
    c.fillStyle = "#8a5a3a"; c.fillRect(0, H2 * 0.82, W2, H2 * 0.18); c.fillStyle = "rgba(0,0,0,.15)"; for (let x = 0; x < W2; x += 40 * k) c.fillRect(x, H2 * 0.82, 2, H2 * 0.18);
    // doorway with the MOH
    const dx = W2 * 0.03, dy = H2 * 0.3, dw = W2 * 0.27, dh = H2 * 0.52;
    c.fillStyle = "#3a1a2a"; c.fillRect(dx, dy, dw, dh); c.strokeStyle = "#fff"; c.lineWidth = 8 * k; c.strokeRect(dx, dy, dw, dh);
    const mx = dx + dw / 2, my = dy + dh;
    c.save(); c.translate(mx, my); c.scale(k * 1.05, k * 1.05);
    c.fillStyle = "#ff8ac8"; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, -150); c.lineTo(14, -150); c.lineTo(34, -4); c.lineTo(-34, -4); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "#f2c29b"; c.beginPath(); c.ellipse(0, -156, 16, 7, 0, 0, 7); c.fill(); c.stroke();
    drawGirlHead(c, 0, -180, 1.15, "#e8b04a", "#f2c29b");
    c.restore();
    const palm = t > 1.25;
    // MOH face + arms
    c.save(); c.translate(mx, my - 180 * k * 1.05); c.scale(k * 1.05, k * 1.05);
    if (!palm) { c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 1.5; [-6, 6].forEach((ex) => { c.beginPath(); c.arc(ex, 3 * 1.15, 4, 0, 7); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(ex, 3.5 * 1.15, 1.8, 0, 7); c.fill(); c.fillStyle = "#fff"; }); c.fillStyle = "#c0104a"; c.beginPath(); c.ellipse(0, 14, 4, 5, 0, 0, 7); c.fill(); }
    else { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, 18); c.quadraticCurveTo(0, 14, 6, 18); c.stroke(); }
    c.restore();
    c.save(); c.translate(mx, my); c.scale(k * 1.05, k * 1.05);
    const armTo = palm ? [-2, -184] : [-26, -96];
    limb(c, -12, -142, -26, palm ? -150 : -120, armTo[0], armTo[1], "#f2c29b", 8); limb(c, 12, -142, 22, -120, 26, -96, "#f2c29b", 8);
    c.fillStyle = "#f2c29b"; c.strokeStyle = INK; c.lineWidth = 2.5;
    if (palm) { rr(c, -18, -200, 30, 26, 10); c.fill(); c.stroke(); [-14, -6, 2].forEach((fx) => { rr(c, fx, -214, 7, 18, 3.5); c.fill(); c.stroke(); }); }
    else { c.beginPath(); c.arc(armTo[0], armTo[1], 7, 0, 7); c.fill(); c.stroke(); }
    c.beginPath(); c.arc(26, -96, 7, 0, 7); c.fill(); c.stroke();
    c.restore();
    // bed
    const bx = W2 * 0.33, bw = W2 * 0.64, by = H2 * 0.45;
    c.fillStyle = "#e04a9a"; c.strokeStyle = INK; c.lineWidth = 4 * k; rr(c, bx, by, bw, H2 * 0.2, 30 * k); c.fill(); c.stroke();
    c.fillStyle = "rgba(255,255,255,.35)"; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { c.beginPath(); c.arc(bx + bw * (0.2 + i * 0.2), by + H2 * (0.06 + j * 0.06), 3 * k, 0, 7); c.fill(); }
    // posts + tiara on the right post
    [bx - 6 * k, bx + bw - 10 * k].forEach((px) => { c.fillStyle = "#f2d27e"; c.fillRect(px, by - 30 * k, 16 * k, H2 * 0.42); c.strokeRect(px, by - 30 * k, 16 * k, H2 * 0.42); c.beginPath(); c.arc(px + 8 * k, by - 34 * k, 12 * k, 0, 7); c.fill(); c.stroke(); });
    { const tx = bx + bw - 2 * k, ty = by + 4 * k + Math.sin(now * 2) * 2 * k; c.save(); c.translate(tx, ty); c.rotate(0.25 + Math.sin(now * 2.2) * 0.08); c.scale(k * 1.4, k * 1.4);
      c.fillStyle = "#ffe08a"; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-16, 8); c.lineTo(-12, -4); c.lineTo(-6, 3); c.lineTo(0, -12); c.lineTo(6, 3); c.lineTo(12, -4); c.lineTo(16, 8); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = "#7fe7ff"; c.beginPath(); c.arc(0, -4, 2.5, 0, 7); c.fill(); c.restore(); }
    // pillows + heads
    const py = by + H2 * 0.2;
    c.fillStyle = "#fff"; c.lineWidth = 3 * k; rr(c, bx + bw * 0.08, py - 34 * k, bw * 0.38, 46 * k, 20 * k); c.fill(); c.stroke(); rr(c, bx + bw * 0.54, py - 34 * k, bw * 0.38, 46 * k, 20 * k); c.fill(); c.stroke();
    const jx = bx + bw * 0.28, hx = bx + bw * 0.72, hy = py - 6 * k;
    // Jess (messy hair, sheepish)
    drawGirlHead(c, jx, hy, 1.25 * k, "#7a4422", "#f6d2b8", "messy");
    c.save(); c.translate(jx, hy); c.scale(1.25 * k, 1.25 * k); c.strokeStyle = INK; c.lineWidth = 2;
    [-6, 6].forEach((ex) => { c.beginPath(); c.arc(ex, 3, 3.5, PI * 1.1, PI * 1.9); c.stroke(); });
    c.fillStyle = "#e0205a"; c.beginPath(); c.moveTo(-5, 12); c.quadraticCurveTo(0, 16, 5, 11); c.quadraticCurveTo(0, 13, -5, 12); c.fill(); c.stroke();
    c.fillStyle = "rgba(255,90,140,.45)"; c.beginPath(); c.arc(-10, 9, 4, 0, 7); c.arc(10, 9, 4, 0, 7); c.fill();
    c.restore();
    // hunk (grinning, eyebrow waggle)
    c.save(); c.translate(hx, hy); c.scale(1.3 * k, 1.3 * k); c.strokeStyle = INK; c.lineWidth = 2.5;
    c.fillStyle = "#d9a074"; rr(c, -16, -16, 32, 38, 13); c.fill(); c.stroke();
    c.fillStyle = "#2a1a10"; c.beginPath(); c.moveTo(-17, -4); c.quadraticCurveTo(-20, -26, 2, -26); c.quadraticCurveTo(24, -26, 17, -4); c.quadraticCurveTo(12, -14, 0, -13); c.quadraticCurveTo(-10, -13, -17, -4); c.closePath(); c.fill(); c.stroke();
    const wag = Math.sin(now * 10) > 0 ? -2.5 : 0;
    c.lineWidth = 3; c.beginPath(); c.moveTo(-12, -4 + wag); c.quadraticCurveTo(-7, -8 + wag, -3, -5 + wag); c.moveTo(3, -5 + wag); c.quadraticCurveTo(7, -8 + wag, 12, -4 + wag); c.stroke();
    c.lineWidth = 2; c.fillStyle = "#fff"; [-7, 7].forEach((ex) => { c.beginPath(); c.ellipse(ex, 2, 3.5, 3, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(ex - 1, 2.4, 1.6, 0, 7); c.fill(); c.fillStyle = "#fff"; });
    c.beginPath(); c.moveTo(-9, 10); c.quadraticCurveTo(0, 14, 9, 9); c.quadraticCurveTo(6, 19, 0, 19); c.quadraticCurveTo(-7, 19, -9, 10); c.closePath(); c.fill(); c.stroke();
    handprint(c, -11, 6, 0.9, -0.3);
    c.restore();
    // sheet pulled up to the chins
    const sy = hy + 16 * k;
    const sg = c.createLinearGradient(0, sy, 0, H2 * 0.82); sg.addColorStop(0, "#ffffff"); sg.addColorStop(1, "#e8d0f0");
    c.fillStyle = sg; c.strokeStyle = INK; c.lineWidth = 4 * k;
    c.beginPath(); c.moveTo(bx - 10 * k, sy + 10 * k); c.quadraticCurveTo(jx, sy - 8 * k, (jx + hx) / 2, sy + 4 * k); c.quadraticCurveTo(hx, sy - 8 * k, bx + bw + 12 * k, sy + 10 * k); c.lineTo(bx + bw + 16 * k, H2 * 0.8); c.lineTo(bx - 14 * k, H2 * 0.8); c.closePath(); c.fill(); c.stroke();
    // fingers clutching the sheet
    c.fillStyle = "#f6d2b8"; c.lineWidth = 2 * k; [-8, 0, 8].forEach((o) => { c.beginPath(); c.ellipse(jx + o * k, sy + 2 * k, 3.6 * k, 5 * k, 0, 0, 7); c.fill(); c.stroke(); });
    c.fillStyle = "#d9a074"; [-8, 0, 8].forEach((o) => { c.beginPath(); c.ellipse(hx + o * k, sy + 2 * k, 3.8 * k, 5 * k, 0, 0, 7); c.fill(); c.stroke(); });
    c.strokeStyle = "rgba(160,120,200,.45)"; c.lineWidth = 2 * k; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(bx + bw * (0.1 + i * 0.2), sy + 30 * k); c.quadraticCurveTo(bx + bw * (0.15 + i * 0.2), H2 * 0.7, bx + bw * (0.12 + i * 0.2), H2 * 0.8); c.stroke(); }
    // nightstand lamp with the bow tie on it
    const lx = W2 * 0.9, ly = H2 * 0.82;
    c.fillStyle = "#6a3a5a"; c.strokeStyle = INK; c.lineWidth = 3 * k; c.fillRect(lx - 26 * k, ly - 44 * k, 52 * k, 44 * k); c.strokeRect(lx - 26 * k, ly - 44 * k, 52 * k, 44 * k);
    c.fillStyle = "#ffcf5a"; c.fillRect(lx - 3 * k, ly - 80 * k, 6 * k, 36 * k);
    c.fillStyle = "#fff0c8"; c.beginPath(); c.moveTo(lx - 22 * k, ly - 78 * k); c.lineTo(lx + 22 * k, ly - 78 * k); c.lineTo(lx + 14 * k, ly - 108 * k); c.lineTo(lx - 14 * k, ly - 108 * k); c.closePath(); c.fill(); c.stroke();
    c.save(); c.translate(lx, ly - 106 * k); c.rotate(-0.2); c.fillStyle = "#111"; c.beginPath(); c.moveTo(0, 0); c.lineTo(-14 * k, -7 * k); c.lineTo(-14 * k, 7 * k); c.closePath(); c.moveTo(0, 0); c.lineTo(14 * k, -7 * k); c.lineTo(14 * k, 7 * k); c.closePath(); c.fill(); c.restore();
    // sparkle tears of joy? no: text
    c.textAlign = "center"; c.textBaseline = "middle";
    if (t > 0.1) { c.save(); c.globalAlpha = clamp(t / 0.4, 0, 1); c.font = "italic 800 " + Math.round(15 * k + 2) + "px 'Avenir Next', sans-serif"; c.fillStyle = "#7a1a4a"; c.fillText("The next morning…", W2 * 0.3, H2 * 0.12); c.restore(); }
    if (t > 1.45) {
      const p2 = sstep((t - 1.45) / 0.25), sc = 0.6 + 0.4 * p2 + Math.sin(clamp(t - 1.45, 0, 0.5) * 20) * 0.04 * (1 - p2);
      c.save(); c.translate(W2 / 2, H2 * 0.89); c.scale(sc, sc); c.rotate(-0.04); c.font = "900 " + Math.round(36 * k + 4) + "px 'Avenir Next', 'Arial Black', sans-serif";
      c.lineWidth = 9; c.strokeStyle = INK; c.strokeText("You had ONE job.", 0, 0); c.fillStyle = "#ffcf5a"; c.fillText("You had ONE job.", 0, 0); c.restore();
    }
    if (t > 2.0) {
      c.save(); c.globalAlpha = clamp((t - 2.0) / 0.4, 0, 1); c.font = "800 " + Math.round(13 * k + 2) + "px 'Avenir Next', sans-serif"; c.fillStyle = "#fff";
      const msg = (f.reason === "moh" ? "You got flattened and " + BN() + " got swept away." : BN() + " got swept off her feet.") + (easy ? "  Easy mode is on." : "");
      c.lineWidth = 4; c.strokeStyle = INK; c.strokeText(msg, W2 / 2, H2 * 0.95, W2 - 20); c.fillText(msg, W2 / 2, H2 * 0.95, W2 - 20);
      c.font = "900 " + Math.round(12 * k + 2) + "px 'Avenir Next', sans-serif"; c.fillStyle = "#ffd6ec"; c.strokeText("Tap to try again", W2 / 2, H2 * 0.04 + 10); c.fillText("Tap to try again", W2 / 2, H2 * 0.04 + 10); c.restore();
    }
    if (t < 0.45) { c.fillStyle = "rgba(0,0,0," + clamp(1 - t / 0.45, 0, 1) + ")"; c.fillRect(0, 0, W2, H2); }
  }

  /* ================= WIN SCENE: safe in the VIP ================= */
  let winConf = [];
  function drawGirl(c, x, y, sc, hair, dress, skin, ph, bride) {
    c.save(); c.translate(x, y); c.scale(sc, sc);
    const up = Math.sin(ph), jump = Math.max(0, Math.sin(ph * 0.5)) * 8;
    c.translate(0, -jump);
    if (bride) { c.fillStyle = "rgba(255,255,255,.6)"; c.strokeStyle = "rgba(26,10,22,.5)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-14, -112); c.quadraticCurveTo(-40, -60, -42, 0); c.lineTo(42, 0); c.quadraticCurveTo(40, -60, 14, -112); c.closePath(); c.fill(); c.stroke(); }
    c.fillStyle = dress; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, -80); c.lineTo(14, -80); c.lineTo(bride ? 44 : 30, 0); c.lineTo(bride ? -44 : -30, 0); c.closePath(); c.fill(); c.stroke();
    if (bride) { c.save(); c.beginPath(); c.moveTo(-14, -80); c.lineTo(-6, -80); c.lineTo(20, -40); c.lineTo(12, -38); c.closePath(); c.fillStyle = "#ff3f9a"; c.fill(); c.stroke(); c.restore(); }
    limb(c, -12, -76, -30, -96 - up * 6, -26 - up * 4, -122, skin, 6); limb(c, 12, -76, 30, -96 + up * 6, 26 + up * 4, -122, skin, 6);
    c.fillStyle = skin; c.beginPath(); c.arc(-26 - up * 4, -122, 5, 0, 7); c.arc(26 + up * 4, -122, 5, 0, 7); c.fill(); c.stroke();
    drawGirlHead(c, 0, -100, 1, hair, skin);
    c.strokeStyle = INK; c.lineWidth = 1.8; [-6, 6].forEach((ex) => { c.beginPath(); c.arc(ex, -96, 3.4, PI * 1.1, PI * 1.9); c.stroke(); });
    c.fillStyle = "#c0104a"; c.beginPath(); c.moveTo(-7, -89); c.quadraticCurveTo(0, -79, 7, -89); c.closePath(); c.fill(); c.stroke();
    if (bride) { c.fillStyle = "#ffe08a"; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-13, -114); c.lineTo(-10, -124); c.lineTo(-5, -117); c.lineTo(0, -128); c.lineTo(5, -117); c.lineTo(10, -124); c.lineTo(13, -114); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#7fe7ff"; c.beginPath(); c.arc(0, -121, 2, 0, 7); c.fill(); }
    c.restore();
  }
  function drawWinScene(now) {
    const s = state, w = s.win, g = w.g, c = ctx, W2 = cssW, H2 = cssH, k = Math.min(W2 / 390, H2 / 720);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = c.createRadialGradient(W2 / 2, H2 * 0.35, 20, W2 / 2, H2 * 0.4, H2 * 0.8); bg.addColorStop(0, "#5a1a7a"); bg.addColorStop(1, "#14061e"); c.fillStyle = bg; c.fillRect(0, 0, W2, H2);
    c.strokeStyle = "rgba(212,175,55,.35)"; c.lineWidth = 2; for (let x = 0; x < W2 + 60; x += 60) for (let y = H2 * 0.3; y < H2 * 0.62; y += 60) for (let r = 10; r <= 28; r += 9) { c.beginPath(); c.arc(x, y + 30, r, PI, 0); c.stroke(); }
    // neon VIP
    c.save(); c.textAlign = "center"; c.textBaseline = "middle"; c.shadowColor = "#ffcf5a"; c.shadowBlur = 22 + Math.sin(now * 8) * 6; c.font = "900 " + Math.round(70 * k) + "px 'Avenir Next', 'Arial Black', sans-serif";
    c.lineWidth = 4; c.strokeStyle = "#ffcf5a"; c.strokeText("VIP", W2 / 2, H2 * 0.2); c.fillStyle = "#fff8e0"; c.fillText("VIP", W2 / 2, H2 * 0.2); c.restore();
    // booth sofa
    c.fillStyle = "#c0106a"; c.strokeStyle = INK; c.lineWidth = 4 * k; rr(c, W2 * 0.04, H2 * 0.44, W2 * 0.92, H2 * 0.24, 40 * k); c.fill(); c.stroke();
    c.fillStyle = "rgba(60,0,40,.5)"; for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) { c.beginPath(); c.arc(W2 * (0.12 + i * 0.11), H2 * (0.49 + j * 0.07), 3.5 * k, 0, 7); c.fill(); }
    c.fillStyle = "#2a0a20"; c.fillRect(0, H2 * 0.82, W2, H2 * 0.18);
    // girls + bride
    const base = H2 * 0.84;
    drawGirl(c, W2 * 0.15, base, 1.05 * k, "#1a1010", "#ff5db4", "#a8693f", now * 9 + 1);
    drawGirl(c, W2 * 0.85, base, 1.05 * k, "#e8b04a", "#ff5db4", "#f2c7a5", now * 9 + 2.4);
    drawGirl(c, W2 * 0.3, base + 6 * k, 0.95 * k, "#c0402a", "#b98cff", "#f5d6bd", now * 9 + 3.1);
    drawGirl(c, W2 * 0.7, base + 6 * k, 0.95 * k, "#5a3018", "#7fe7ff", "#d9a074", now * 9 + 0.5);
    drawGirl(c, W2 * 0.5, base + 10 * k, 1.35 * k, "#7a4422", "#ffffff", "#f6d2b8", now * 10, true);
    // champagne pop + spray
    const bx = W2 * 0.8, by = H2 * 0.62;
    c.save(); c.translate(bx, by); c.rotate(-0.5); c.scale(k, k);
    c.fillStyle = "#ff7ac8"; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-6, -60); c.lineTo(6, -60); c.lineTo(6, -40); c.quadraticCurveTo(16, -34, 16, -20); c.lineTo(16, 30); c.lineTo(-16, 30); c.lineTo(-16, -20); c.quadraticCurveTo(-16, -34, -6, -40); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "#ffcf5a"; c.fillRect(-7, -62, 14, 20); c.strokeRect(-7, -62, 14, 20);
    for (let i = 0; i < 26; i++) { const tt = (now * 1.6 + i / 26) % 1, a = -PI / 2 + Math.sin(i * 3.1) * 0.5; c.globalAlpha = (1 - tt) * clamp(g * 2, 0, 1); c.fillStyle = i % 2 ? "#fff" : "#ffe0f0"; c.beginPath(); c.arc(Math.cos(a) * tt * 220, -62 + Math.sin(a) * tt * 220 + tt * tt * 140, 5 + tt * 8, 0, 7); c.fill(); }
    c.globalAlpha = 1; c.restore();
    if (g < 0.8) { const cy = by - 80 * k - g * 500 * k; c.fillStyle = "#e8c090"; c.strokeStyle = INK; c.lineWidth = 2; c.save(); c.translate(bx - 40 * k - g * 160 * k, cy); c.rotate(g * 20); rr(c, -7 * k, -9 * k, 14 * k, 18 * k, 4 * k); c.fill(); c.stroke(); c.restore(); }
    // confetti
    if (winConf.length < 120) for (let i = 0; i < 4; i++) winConf.push({ x: Math.random() * W2, y: -10, vy: rand(80, 200), vx: rand(-30, 30), r: rand(0, 6), vr: rand(-8, 8), c: ["#ff5db4", "#7fe7ff", "#ffcf5a", "#b98cff", "#ffffff", "#7dff9a"][(Math.random() * 6) | 0] });
    winConf.forEach((q) => { q.y += q.vy / 60; q.x += q.vx / 60; q.r += q.vr / 60; if (q.y > H2 + 10) { q.y = -10; q.x = Math.random() * W2; } c.save(); c.translate(q.x, q.y); c.rotate(q.r); c.fillStyle = q.c; c.fillRect(-5, -2.5, 10, 5); c.restore(); });
    // text
    const p2 = sstep(g / 0.35), sc = 0.5 + 0.5 * p2 + Math.sin(now * 6) * 0.03;
    c.save(); c.translate(W2 / 2, H2 * 0.33); c.scale(sc, sc); c.rotate(-0.05); c.textAlign = "center"; c.textBaseline = "middle";
    c.font = "900 " + Math.round(44 * k + 4) + "px 'Avenir Next', 'Arial Black', sans-serif"; c.lineWidth = 10; c.strokeStyle = INK; c.strokeText("SHE'S SAFE!", 0, 0); c.fillStyle = "#ff8fd0"; c.fillText("SHE'S SAFE!", 0, 0); c.restore();
    if (g > 0.9) {
      c.save(); c.globalAlpha = clamp((g - 0.9) / 0.4, 0, 1); c.textAlign = "center"; c.font = "900 " + Math.round(18 * k + 3) + "px 'Avenir Next', sans-serif"; c.lineWidth = 6; c.strokeStyle = INK;
      const t1 = "Bride: 1  \u00B7  Hunks: 0", t2 = s.slapped + " hunks slapped. Legendary.";
      c.strokeText(t1, W2 / 2, H2 * 0.39); c.fillStyle = "#fff"; c.fillText(t1, W2 / 2, H2 * 0.39);
      c.font = "800 " + Math.round(14 * k + 2) + "px 'Avenir Next', sans-serif"; c.strokeText(t2, W2 / 2, H2 * 0.93); c.fillStyle = "#ffd6ec"; c.fillText(t2, W2 / 2, H2 * 0.93); c.restore();
    }
    if (g < 0.3) { c.fillStyle = "rgba(255,255,255," + (1 - g / 0.3) + ")"; c.fillRect(0, 0, W2, H2); }
  }

  /* ================= RENDER DISPATCH ================= */
  function render(now) {
    const s = state; if (!s) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#12061c"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (s.phase === "fail" && s.fail.t > 0.35) { drawFailGag(now); return; }
    if (s.phase === "win" && s.win.scene) { drawWinScene(now); return; }
    if (s.phase === "intro") introCam(s.intro.t);
    else { cam.x = s.p.x; cam.y = s.p.y; cam.z = EYE + fpS.bob; cam.ang = s.p.ang; cam.pitch = 0; }
    fpRender(now);
    const p = s.p, b = s.bride;
    if (s.phase === "intro") { drawIntroOverlay(now); return; }
    if (s.phase !== "win") drawHand(now);
    if (p.superT > 0) { ctx.strokeStyle = "rgba(255,93,180," + (0.4 + Math.sin(now * 10) * 0.15) + ")"; ctx.lineWidth = 8; ctx.strokeRect(4, 4, cssW - 8, cssH - 8); }
    const dg = b.danger / 100;
    if (p.hurtT > 0 || dg > 0.55 || b.carrier) {
      const a = p.hurtT > 0 ? 0.5 : (b.carrier ? 0.35 : (dg - 0.55) * 0.8) + Math.sin(now * 10) * 0.08;
      const g = ctx.createRadialGradient(cssW / 2, cssH / 2, Math.min(cssW, cssH) * 0.3, cssW / 2, cssH / 2, Math.max(cssW, cssH) * 0.7);
      g.addColorStop(0, "rgba(255,30,80,0)"); g.addColorStop(1, "rgba(255,30,80," + clamp(a, 0, 0.6) + ")"); ctx.fillStyle = g; ctx.fillRect(0, 0, cssW, cssH);
    }
    if (s.superFlash > 0) { ctx.fillStyle = "rgba(255,180,230," + s.superFlash + ")"; ctx.fillRect(0, 0, cssW, cssH); }
    if (s.slapFlash > 0) { ctx.fillStyle = "rgba(255,255,255," + s.slapFlash * 2.2 + ")"; ctx.fillRect(0, 0, cssW, cssH); }
    if (s.phase !== "win") { drawCrosshair(); drawHud(now); fpHudExtras(now); }
    if (s.phase === "fail") { ctx.fillStyle = "rgba(0,0,0," + clamp(s.fail.t / 0.35, 0, 1) + ")"; ctx.fillRect(0, 0, cssW, cssH); }
  }

  /* ================= LOOP / SCREENS ================= */
  function resize() {
    const r = canvas.getBoundingClientRect();
    cssW = Math.max(200, r.width); cssH = Math.max(300, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
    fpBuild();
    vignette = document.createElement("canvas"); vignette.width = Math.round(cssW); vignette.height = Math.round(cssH);
    const v = vignette.getContext("2d"); const g = v.createRadialGradient(cssW / 2, cssH / 2, Math.min(cssW, cssH) * 0.35, cssW / 2, cssH / 2, Math.max(cssW, cssH) * 0.75);
    g.addColorStop(0, "rgba(12,2,20,0)"); g.addColorStop(1, "rgba(12,2,20,.6)"); v.fillStyle = g; v.fillRect(0, 0, cssW, cssH);
  }
  window.addEventListener("resize", () => { if (!screens.game.hidden) resize(); });
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const t = now / 1000; let dt = t - last; last = t;
    if (state && (state.phase === "play" || state.phase === "intro") && !state.paused && !fpS.lockTier && dt > 0 && dt < 0.25) {
      fpS.ft += dt; fpS.fn++;
      if (fpS.fn >= 90) { const avg = fpS.ft / fpS.fn; if (avg > 0.0205 && fpS.tier < 2) { fpS.tier++; fpBuild(); } fpS.ft = 0; fpS.fn = 0; }
    }
    if (dt > 0.05) dt = 0.05; if (dt < 0) dt = 0;
    if (state && !state.paused) update(dt);
    if (state) setMusicLevel(state.phase === "fail" ? 0.3 : 1);
    render(t);
  }
  function startLoop() { if (running) return; running = true; last = performance.now() / 1000; raf = requestAnimationFrame(frame); }
  function stopLoop() { running = false; cancelAnimationFrame(raf); }
  document.addEventListener("visibilitychange", () => { try { if (actx) { if (document.hidden) actx.suspend(); else actx.resume(); } } catch (e) {} last = performance.now() / 1000; for (const k in keys) keys[k] = false; });
  function startLevel() {
    state = newState(0); placePickups(state); winConf = [];
    state.phase = "intro"; state.intro = { t: 0 };
    lastObj = ""; $("hud-obj").textContent = "Tonight: protect " + BN();
    $("assist-bar").hidden = !easy;
    resize();
    startLoop();
  }
  function showScreen(name) {
    Object.keys(screens).forEach((k) => (screens[k].hidden = k !== name));
    if (name === "game") startLevel(); else stopLoop();
    if (name === "reveal") { setupRsvp(); setMusicLevel(0.55); }
    window.scrollTo(0, 0);
  }

  /* ================= CONFIG / UI ================= */
  function applyConfig() {
    const sample = !!config.sample;
    ["sample-badge", "sample-badge-2"].forEach((id) => ($(id).hidden = !sample));
    $("landing-line").textContent = config.landingLine || (config.hostName + " is sending you an invite. Pass the level to find out what it is!");
    const ol = $("howto-lines"); ol.innerHTML = "";
    (config.howToPlay || []).forEach((t) => { const li = document.createElement("li"); li.textContent = t; ol.appendChild(li); });
    $("event-name").textContent = config.eventName;
    $("field-date").textContent = config.date; $("field-time").textContent = config.time;
    $("field-location").textContent = config.location; $("field-host").textContent = config.hostName;
    $("extra-note").hidden = !config.extraNote; $("extra-note-text").textContent = config.extraNote || "";
    $("privacy-note").textContent = config.privacyNote || "No ads. No tracking.";
    document.querySelectorAll(".madeby").forEach((f) => { f.innerHTML = ""; const a = document.createElement("span"); a.innerHTML = "Made by <b></b>"; a.querySelector("b").textContent = config.madeBy; const t = document.createElement("span"); t.className = "tag"; t.textContent = config.tagline; f.appendChild(a); f.appendChild(t); });
  }
  function loadConfig() {
    return fetch("./config.json", { cache: "no-store" }).then((r) => r.json()).then((c) => { config = Object.assign(config, c); applyConfig(); }).catch(() => applyConfig());
  }
  $("btn-begin").addEventListener("click", () => { unlockAudio(); sfx.tap(); showScreen("game"); });
  $("btn-start").addEventListener("click", () => { unlockAudio(); sfx.tap(); showScreen("game"); });
  $("btn-skip").addEventListener("click", () => { unlockAudio(); sfx.tap(); stopLoop(); wipeToReveal(); });
  $("btn-replay").addEventListener("click", () => { unlockAudio(); sfx.tap(); showScreen("game"); });
  $("btn-mute").addEventListener("click", () => { muted = !muted; $("btn-mute").textContent = muted ? "Sound off" : "Sound on"; if (!muted) unlockAudio(); applyMusicLevel(); });

  /* ================= RSVP ================= */
  const isLocalRsvp = () => { const ep = String(config.rsvpEndpoint || "local").trim(); return !ep || ep.toLowerCase() === "local"; };
  const storeKey = () => config.rsvpStorageKey || "playfair-bachelorette-sample-rsvp";
  function rsvpPayload(form) {
    return {
      guestName: String(form.guestName.value || "").trim(), attending: form.attending.value, stayingOver: !!form.stayingOver.checked,
      message: String(form.message.value || "").trim(), eventName: config.eventName, date: config.date, time: config.time,
      location: config.location, hostName: config.hostName, sample: !!config.sample, submittedAt: new Date().toISOString(),
    };
  }
  function saveLocal(payload) {
    let list = []; try { list = JSON.parse(localStorage.getItem(storeKey()) || "[]"); if (!Array.isArray(list)) list = []; } catch (e) {}
    list.push(payload);
    try { localStorage.setItem(storeKey(), JSON.stringify(list)); localStorage.setItem(storeKey() + "-latest", JSON.stringify(payload)); } catch (e) {}
  }
  function showThanks(payload, localOnly) {
    $("rsvp-form").hidden = true; $("rsvp-thanks").hidden = false;
    const ans = payload.attending === "yes" ? "You're in! Bring your best slapping hand." : payload.attending === "maybe" ? "Marked as a maybe." : "Sorry you can't make it.";
    $("rsvp-thanks-lead").textContent = "Thanks, " + payload.guestName + "!";
    $("rsvp-thanks-body").textContent = ans + (payload.stayingOver ? " Staying over: noted." : "") +
      (localOnly ? " (Sample invite: this RSVP is saved on this device only and was not sent to anyone.)" : " Your RSVP is on its way to " + config.hostName + ".");
  }
  function setupRsvp() {
    const form = $("rsvp-form");
    try { const latest = JSON.parse(localStorage.getItem(storeKey() + "-latest") || "null"); if (latest && latest.guestName) showThanks(latest, isLocalRsvp()); } catch (e) {}
    if (form.dataset.bound === "1") return;
    form.dataset.bound = "1";
    const err = $("rsvp-error"), btn = $("rsvp-submit");
    form.addEventListener("submit", (ev) => {
      ev.preventDefault(); err.hidden = true;
      const payload = rsvpPayload(form);
      if (!payload.guestName) { err.hidden = false; err.textContent = "Please add your name."; form.guestName.focus(); return; }
      saveLocal(payload);
      if (isLocalRsvp()) { showThanks(payload, true); return; }
      btn.disabled = true; btn.textContent = "Sending…";
      fetch(config.rsvpEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
        .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); showThanks(payload, false); })
        .catch(() => { err.hidden = false; err.textContent = "Could not send yet, but your RSVP is saved on this device. Please try again later."; btn.disabled = false; btn.textContent = "Send RSVP"; });
    });
  }

  /* ================= TEST HOOKS ================= */
  window.__invite = {
    show: showScreen, getState: () => state, config: () => config,
    pause: (v) => { if (state) state.paused = v !== false; },
    poseIntro(t) { state.intro.t = t; state.bride.dph = t * 7.5; },
    skipIntro() { endIntro(); },
    poseGameplay() {
      endIntro(); const s = state, b = s.bride;
      s.p.x = 11.5 * T; s.p.y = 21.4 * T; s.p.ang = -1.33; s.p.hp = 74; s.hintT = 0; s.slapped = 3;
      b.x = 11.3 * T; b.y = 18.5 * T; b.wp = 1; b.hold = 4.2; b.holdMax = 7; b.danger = 38; b.state = "dance"; b.dph = 1.3;
      s.hunks = [];
      const h1 = mkHunk("hunk", 11.85 * T, 20.3 * T, doors[6]); h1.slaps = 1; h1.hp = 1; h1.flash = 0.1; h1.say = "What's your sign?"; h1.sayT = 5; h1.walk = 1;
      const h2 = mkHunk("talker", 10.6 * T, 18.4 * T, doors[0]); h2.state = "dance"; h2.walk = 2;
      const h3 = mkHunk("dasher", 14.2 * T, 17.2 * T, doors[4]); h3.walk = 3; h3.vi = 1;
      const h4 = mkHunk("grabber", 8.4 * T, 16.6 * T, doors[7]); h4.walk = 0;
      s.hunks.push(h1, h2, h3, h4);
      s.p.slapT = 0.09; s.p.slapHit = true; s.p.slapSide = 1; s.slapFlash = 0;
      pop(11.85 * T, 20.3 * T, "CRACK!", "#fff", 17, 2); burst(11.85 * T, 20.25 * T, "star", 8, ["#fff6c0", "#ffffff", "#ff8fd0"], 60, 58);
      s.mohSay = "Not today, Romeo!"; s.mohSayT = 1.5; setObj();
    },
    poseSuper() {
      this.poseGameplay(); const s = state, p = s.p; p.superT = 3.4; p.slapT = 0.06; p.slapHit = true;
      s.hunks[0].x = 11.7 * T; s.hunks[0].y = 19.9 * T; s.hunks[0].slaps = 2; s.hunks[0].flash = 0.1;
      for (let i = 0; i < 26; i++) { const d = 20 + i * 9; s.foams.push({ x: p.x + Math.cos(p.ang) * d + rand(-6, 6), y: p.y + Math.sin(p.ang) * d + rand(-6, 6), vx: 0, vy: -450, life: 0.4, t: d / 470, z: EYE - 12 + rand(-3, 3), hit: new Set(), sz: rand(0.8, 1.3) }); }
      pop(11.7 * T, 19.9 * T, "MEGA SLAP!", "#ff8fd0", 20, 2); s.mohSay = "Pop the bubbly!"; s.mohSayT = 1.5;
    },
    poseBoss() {
      endIntro(); const s = state, b = s.bride, p = s.p;
      p.superT = 0; s.foams = []; s.pops = []; s.parts = []; s.mohSayT = 0; p.slapT = 0;
      s.cpi = 3; b.wp = 5; b.x = 7.6 * T; b.y = 5.5 * T; b.state = "walk"; b.hold = 0; b.danger = 22; s.hunks = []; s.slapped = 17;
      p.x = 12.9 * T; p.y = 5.3 * T; p.ang = PI + 0.04; p.hp = 58; s.hintT = 0;
      const e = mkHunk("boss", 10.0 * T, 4.75 * T, doors[11]); e.hp = 17; e.slaps = 2; e.say = "Did somebody order Mr. Sexy?"; e.sayT = 5; e.walk = 1.5;
      s.boss = e; s.bossSpawned = true; s.hunks.push(e);
      s.roses.push({ x: 9.3 * T, y: 4.6 * T, vx: 200, vy: 30, life: 2, t: 0.3 });
      setObj();
    },
    forceWin(n) { if (state.phase === "intro") endIntro(); const s = state; if (n) s.slapped = n; s.boss = null; s.ropeOpen = true; s.hunks = []; s.bride.carrier = null; s.bride.wp = 6; s.bride.x = 3.0 * T; s.bride.y = 5 * T; s.p.x = 6.5 * T; s.p.y = 5 * T; s.p.ang = PI; startWin(); },
    forceFail(reason) { if (state.phase === "intro") endIntro(); failRun(reason || "carried"); },
    damage: (n) => hurt(n || 10),
    setDanger: (v) => { state.bride.danger = v; },
    setTier: (t) => { fpS.tier = t; fpS.lockTier = true; fpBuild(); },
    tier: () => fpS.tier, music: () => ({ playing: !!musicSrc, level: musicLevel, gain: musicGain ? musicGain.gain.value : null, beat: musicBeat(), state: actx && actx.state }), fails: () => fails, easy: () => easy,
  };

  function boot() {
    Promise.resolve(loadConfig()).then(() => { showScreen("landing"); if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("./sw.js").catch(() => {}); });
  }
  boot();
})();
