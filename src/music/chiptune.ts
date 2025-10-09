type TrackNote = { n: string | number; len?: number }

export class Chiptune {
  ctx: AudioContext | null
  master: GainNode | null
  activeLoop: string | null
  loopTimer: any
  trackDefs: any
  analyser: AnalyserNode | null
  editedData: Record<string, any>
  activeVoices: Array<{ stop: (when?: number) => void }>

  constructor() {
    this.ctx = null
    this.master = null
    this.activeLoop = null
    this.loopTimer = null
    this.analyser = null
    this.activeVoices = []
    this.trackDefs = this._defineTracks()
    this.editedData = {}
    for (const k of Object.keys(this.trackDefs)) {
      this.editedData[k] = JSON.parse(
        JSON.stringify(this.trackDefs[k].data || {})
      )
    }
  }

  async initOnGesture() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.9
      this.master.connect(this.ctx.destination)
      this._createSimpleLimiter()
      await this.ctx.resume()
    }
  }

  private _createSimpleLimiter() {
    if (!this.ctx || !this.master) return

    const comp = this.ctx.createDynamicsCompressor()
    comp.threshold.value = -6
    comp.knee.value = 6
    comp.ratio.value = 6
    comp.attack.value = 0.01
    comp.release.value = 0.2
    const analyser = this.ctx.createAnalyser()
    analyser.fftSize = 2048
    this.analyser = analyser

    this.master.disconnect()
    this.master.connect(comp)
    comp.connect(analyser)
    analyser.connect(this.ctx.destination)
  }

  private _now() {
    return this.ctx ? this.ctx.currentTime : 0
  }

  private _noteToFreq(note: string | number): number {
    if (typeof note === "number") return note
    const noteRegex = /^([A-G])(#|b)?(\d)$/
    const map = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
    const m = noteRegex.exec(note)
    if (!m) return 440
    const [, letter, acc, octave] = m
    let n = map[letter as keyof typeof map]
    if (acc === "#") n += 1
    if (acc === "b") n -= 1
    const semis = n + (Number(octave) - 4) * 12
    return 440 * Math.pow(2, semis / 12)
  }

  private _makeNoiseBuffer(lengthSec = 1) {
    if (!this.ctx) throw new Error("AudioContext not initialized")

    const sr = this.ctx.sampleRate
    const buf = this.ctx.createBuffer(1, sr * lengthSec, sr)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.02))
    }
    return buf
  }

  private _playNoiseHit(
    time: number,
    { gain = 0.5, duration = 0.06, tone = 0.5 } = {}
  ) {
    if (!this.ctx || !this.master) return

    const src = this.ctx.createBufferSource()
    src.buffer = this._makeNoiseBuffer(0.12)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(gain, time)
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration)
    src.connect(g)
    g.connect(this.master)
    src.start(time)
    src.stop(time + 0.15)

    const voice = {
      stop: (when = this._now()) => {
        try {
          g.gain.cancelScheduledValues(when)
          g.gain.setValueAtTime(0.0001, when)
          src.stop(when + 0.02)
        } catch (e) {}
        try {
          g.disconnect()
        } catch (_) {}
        try {
          src.disconnect()
        } catch (_) {}
      },
    }
    src.onended = () => this._removeVoice(voice)
    this._addVoice(voice)
  }

  private _createLeadOsc(freq: number, time: number) {
    if (!this.ctx || !this.master)
      throw new Error("AudioContext not initialized")

    const osc = this.ctx.createOscillator()
    osc.type = "square"
    osc.frequency.setValueAtTime(freq, time)
    const gain = this.ctx.createGain()
    gain.gain.value = 0
    const shaper = this.ctx.createWaveShaper()
    shaper.curve = this._makeDistortionCurve(3)
    osc.connect(shaper)
    shaper.connect(gain)
    gain.connect(this.master)
    return { osc, gain }
  }

  private _createBassOsc(freq: number, time: number) {
    if (!this.ctx || !this.master)
      throw new Error("AudioContext not initialized")

    const osc = this.ctx.createOscillator()
    osc.type = "triangle"
    osc.frequency.setValueAtTime(freq, time)
    const gain = this.ctx.createGain()
    gain.gain.value = 0
    osc.connect(gain)
    const shaper = this.ctx.createWaveShaper()
    shaper.curve = this._makeDistortionCurve(0.7)
    gain.connect(shaper)
    shaper.connect(this.master)
    return { osc, gain }
  }

  private _createPadOsc(freq: number) {
    if (!this.ctx || !this.master)
      throw new Error("AudioContext not initialized")

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.frequency.value = freq
    gain.gain.value = 0
    osc.connect(gain).connect(this.master)
    return { osc, gain }
  }

  private _makeDistortionCurve(amount: number) {
    if (!this.ctx) throw new Error("AudioContext not initialized")

    const n = 4096
    const curve = new Float32Array(n)
    const deg = Math.PI / 180
    for (let i = 0; i < n; ++i) {
      const x = (i * 2) / n - 1
      curve[i] =
        ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x))
    }
    return curve
  }

  private _applyEnvelope(
    gainNode: GainNode,
    at: number,
    {
      attack = 0.001,
      decay = 0.02,
      sustain = 0.6,
      release = 0.06,
      peak = 0.9,
    } = {}
  ) {
    const g = gainNode.gain
    g.cancelScheduledValues(at)
    g.setValueAtTime(0.0001, at)
    g.linearRampToValueAtTime(peak, at + attack)
    g.linearRampToValueAtTime(sustain * peak, at + attack + decay)
  }

  private _releaseEnvelope(
    gainNode: GainNode,
    at: number,
    { release = 0.06 } = {}
  ) {
    const g = gainNode.gain
    g.cancelScheduledValues(at)
    let current = 0.0001
    try {
      current = g.value
    } catch (_) {}
    g.setValueAtTime(current, at)
    g.exponentialRampToValueAtTime(0.0001, at + release)
  }

  private _scheduleMelody(
    startTime: number,
    notes: { n: string | number; len?: number }[],
    bpm = 120,
    instrumentFactory: (
      freq: number,
      when: number
    ) => { osc: OscillatorNode; gain: GainNode },
    opts: any = {}
  ): number {
    if (!this.ctx) throw new Error("AudioContext not initialized")

    const beatSec = 60 / bpm
    let t = startTime
    const oscillators = []
    for (const step of notes) {
      const freq = this._noteToFreq(step.n)
      const dur = (step.len || 0.25) * beatSec
      const inst = instrumentFactory(freq, t)
      this._applyEnvelope(inst.gain, t, opts.env || {})
      this._releaseEnvelope(inst.gain, t + dur - 0.001, opts.env || {})
      inst.osc.start(t)
      inst.osc.stop(t + dur + 0.05)
      const voice = {
        stop: (when = this._now()) => {
          try {
            this._releaseEnvelope(inst.gain, when, { release: 0.02 })
            inst.osc.stop(when + 0.05)
          } catch (e) {}
          try {
            inst.gain.disconnect()
          } catch (_) {}
        },
      }
      inst.osc.onended = () => this._removeVoice(voice)
      this._addVoice(voice)
      oscillators.push(inst)
      t += dur
    }
    return t
  }

  private _startLoop(
    id: string,
    scheduleFn: (startTime: number) => void,
    loopLengthSec: number
  ) {
    this.stop()
    this.activeLoop = id
    const scheduleAhead = 0.1

    const scheduleOnce = () => {
      this._stopAllVoices()
      const start = this._now() + 0.04
      scheduleFn(start)
      this.loopTimer = setTimeout(
        scheduleOnce,
        Math.max(10, (loopLengthSec - scheduleAhead) * 1000)
      )
    }
    scheduleOnce()
  }

  private _stopAllVoices() {
    const voices = [...this.activeVoices]
    for (const v of voices) {
      try {
        v.stop()
      } catch (e) {}
    }
    this.activeVoices = []
  }

  private _addVoice(v: { stop: (when?: number) => void }) {
    this.activeVoices.push(v)
  }
  private _removeVoice(v: { stop: (when?: number) => void }) {
    const i = this.activeVoices.indexOf(v)
    if (i !== -1) this.activeVoices.splice(i, 1)
  }

  getAnalyser() {
    return this.analyser
  }

  getTracks() {
    return Object.keys(this.trackDefs).map((k) => {
      const data = this.editedData[k] || this.trackDefs[k].data
      return { key: k, name: data.name, length: data.length, bpm: data.bpm }
    })
  }

  getTrackData(key: string) {
    if (!this.trackDefs[key]) throw new Error("Unknown track: " + key)
    return JSON.parse(
      JSON.stringify(this.editedData[key] || this.trackDefs[key].data)
    )
  }

  updateTrackData(key: string, newData: any) {
    if (!this.trackDefs[key]) {
      this.addTrack(key, newData)
      return
    }
    this.editedData[key] = JSON.parse(JSON.stringify(newData))
    try {
      localStorage.setItem(
        "datarunners:tracks",
        JSON.stringify(this.editedData)
      )
    } catch (_) {}
  }

  addTrack(key: string, data: any) {
    if (!key) {
      key = (data.name || "track").toString().replace(/\s+/g, "-").toLowerCase()
    }
    const slug = key.toString().replace(/\s+/g, "-").toLowerCase()

    this.trackDefs[slug] = { data: data }
    this.editedData[slug] = JSON.parse(JSON.stringify(data))
    try {
      localStorage.setItem(
        "datarunners:tracks",
        JSON.stringify(this.editedData)
      )
    } catch (_) {}
    return slug
  }

  scheduleOnce(key: string) {
    const start = this._now() + 0.02
    this.schedule(key, start)
  }

  /**
   * Public universal schedule method. Can be called externally.
   * If startTime is omitted, schedules slightly in the future.
   */
  schedule(key: string, startTime?: number) {
    if (!this.trackDefs[key]) throw new Error("Unknown track: " + key)
    const start = typeof startTime === "number" ? startTime : this._now() + 0.02
    this._scheduleTrack(start, key)
  }

  /**
   * Internal scheduler: inspect the track data and carry out scheduling.
   * This consolidates previously per-track schedule closures.
   */
  private _scheduleTrack(startTime: number, key: string) {
    if (!this.trackDefs[key]) throw new Error("Unknown track: " + key)
    const def = this.trackDefs[key]
    const d = def.data || {}
    const bpm = d.bpm || 120
    const endTime = startTime + (d.length || 8)

    // If the track defines an "acts" array, schedule using those acts.
    if (Array.isArray(d.acts) && d.acts.length) {
      let t = startTime
      for (const [i, act] of d.acts.entries()) {
        const dur = act.dur || 6
        const end = t + dur
        const intensity =
          act.intensity ?? (i === 2 ? 0.00012 : i === 3 ? 0.00008 : 0.0001)

        // pads inside act
        if (
          act.padFreqs &&
          Array.isArray(act.padFreqs) &&
          act.padFreqs.length
        ) {
          let tp = t
          for (const { n, dur: padDur } of act.padFreqs) {
            const freq = this._noteToFreq(n)
            const inst = this._createPadOsc(freq)
            const padEnv = {
              attack: 2.0,
              decay: 4.0,
              sustain: 0.3,
              release: 4.0,
              peak: 0.5,
            }
            this._applyEnvelope(inst.gain, tp, padEnv)
            this._releaseEnvelope(inst.gain, tp + padDur - 0.001, {
              release: padEnv.release,
            })
            const stopAt = tp + padDur + padEnv.release + 0.05
            inst.osc.start(tp)
            inst.osc.stop(stopAt)
            const voice = {
              stop: (when = this._now()) => {
                try {
                  this._releaseEnvelope(inst.gain, when, { release: 2.0 })
                  inst.osc.stop(when + 2.05)
                } catch (_) {}
              },
            }
            inst.osc.onended = () => this._removeVoice(voice)
            this._addVoice(voice)
            tp += padDur
          }
        }

        // bass / main seq for this act
        if (Array.isArray(act.seqs) && act.seqs.length) {
          let tb = t
          while (tb < end - 0.001) {
            tb = this._scheduleMelody(
              tb,
              act.seqs,
              bpm,
              (freq, when) => {
                const inst = this._createBassOsc(freq, when)
                inst.gain.gain.value = intensity
                return inst
              },
              {
                env: act.bassEnv || {
                  attack: 0.002,
                  decay: 0.06,
                  sustain: 0.65,
                  release: 0.08,
                  peak: 0.9,
                },
              }
            )
          }
        }

        // lead lines for this act
        if (Array.isArray(act.lead) && act.lead.length) {
          const beatSec = 60 / bpm
          const seqDur = act.lead.reduce(
            (sum: number, note: TrackNote) =>
              sum + (note.len || 0.25) * beatSec,
            0
          )
          const pause = act.loopPause || 0
          const crossfade = Math.min(0.05, seqDur / 2)
          let loopStart = t
          while (loopStart < end - 0.001) {
            this._scheduleMelody(
              loopStart,
              act.lead,
              bpm,
              (freq, when) => {
                const inst = this._createLeadOsc(freq, when)
                inst.gain.gain.value = 0.0001
                inst.gain.gain.setValueAtTime(0.0001, when)
                inst.gain.gain.linearRampToValueAtTime(
                  intensity,
                  when + crossfade
                )
                inst.gain.gain.setValueAtTime(
                  intensity,
                  when + Math.max(0, seqDur - crossfade)
                )
                inst.gain.gain.linearRampToValueAtTime(0.0001, when + seqDur)
                return inst
              },
              {
                env: act.leadEnv || {
                  attack: 0.001,
                  decay: 0.04,
                  sustain: 0.5,
                  release: 0.06,
                  peak: 0.8,
                },
              }
            )
            loopStart += seqDur + pause - crossfade
          }
        }

        // decorative noise hits inside act
        const beatSec = 60 / bpm
        for (let tt = t; tt < end; tt += beatSec * (act.noiseStep || 0.5)) {
          const gain = act.noiseGain ?? (i === 2 ? 0.09 : i === 3 ? 0.07 : 0.12)
          this._playNoiseHit(tt, { gain, duration: act.noiseDur || 0.03 })
        }

        t = end + (act.loopPause || 0)
      }
      return
    }

    // Generic scheduling for other tracks (arp, seq, bassSeq, leadSeq, noiseEveryBeat)
    // arp looping
    if (Array.isArray(d.arp) && d.arp.length) {
      let t = startTime
      while (t < endTime - 0.001) {
        t = this._scheduleMelody(
          t,
          d.arp,
          bpm,
          (freq, when) => {
            const inst = this._createLeadOsc(freq, when)
            inst.gain.gain.value = 0.0001
            return inst
          },
          {
            env: d.arpEnv || {
              attack: 0.001,
              decay: 0.02,
              sustain: 0.45,
              release: 0.03,
              peak: 1.0,
            },
          }
        )
      }
    }

    // seq (single melodic sequence)
    if (Array.isArray(d.seq) && d.seq.length) {
      let t = startTime
      while (t < endTime - 0.001) {
        t = this._scheduleMelody(
          t,
          d.seq,
          d.bpm || bpm,
          (freq, when) => {
            const inst = this._createLeadOsc(freq, when)
            inst.gain.gain.value = 0.0001
            return inst
          },
          {
            env: d.seqEnv || {
              attack: 0.01,
              decay: 0.4,
              sustain: 0.5,
              release: 0.8,
              peak: 0.9,
            },
          }
        )
      }
    }

    // bassSeq / leadSeq simple scheduling (flat arrays)
    if (Array.isArray(d.bassSeq) && d.bassSeq.length) {
      let t = startTime
      while (t < endTime - 0.001) {
        t = this._scheduleMelody(
          t,
          d.bassSeq,
          bpm,
          (freq, when) => {
            const inst = this._createBassOsc(freq, when)
            inst.gain.gain.value = d.bassIntensity || 0.0001
            return inst
          },
          {
            env: d.bassEnv || {
              attack: 0.002,
              decay: 0.06,
              sustain: 0.7,
              release: 0.06,
              peak: 0.9,
            },
          }
        )
      }
    }

    if (Array.isArray(d.leadSeq) && d.leadSeq.length) {
      let t = startTime
      while (t < endTime - 0.001) {
        t = this._scheduleMelody(
          t,
          d.leadSeq,
          bpm,
          (freq, when) => {
            const inst = this._createLeadOsc(freq, when)
            inst.gain.gain.value = 0.0001
            return inst
          },
          {
            env: d.leadEnv || {
              attack: 0.001,
              decay: 0.04,
              sustain: 0.5,
              release: 0.05,
              peak: 0.7,
            },
          }
        )
      }
    }

    if (d.noiseEveryBeat) {
      const beatSec = 60 / bpm
      for (let tt = startTime; tt < endTime; tt += beatSec) {
        this._playNoiseHit(tt, { gain: 0.12, duration: 0.03 })
      }
    }
  }

  _defineTracks() {
    return {
      travel: {
        data: {
          name: "Neon Caravan (Extended Rev2)",
          length: 24.0,
          bpm: 125,
          acts: [
            {
              seqs: [
                { n: "E2", len: 0.5 },
                { n: "E2", len: 0.5 },
                { n: "D2", len: 0.5 },
                { n: "E2", len: 0.5 },
                { n: "C2", len: 1.0 },
                { n: "B1", len: 1.0 },
                { n: "E2", len: 2.0 },
              ],
              lead: [
                { n: "E4", len: 0.25 },
                { n: "G4", len: 0.25 },
                { n: "B4", len: 0.25 },
                { n: "G4", len: 0.25 },
                { n: "E4", len: 0.25 },
                { n: "G4", len: 0.25 },
                { n: "C5", len: 0.25 },
                { n: "B4", len: 0.25 },
              ],
              loopPause: 1.0,
              dur: 6,
            },
            {
              seqs: [
                { n: "E2", len: 0.5 },
                { n: "D#2", len: 0.5 },
                { n: "D2", len: 0.5 },
                { n: "C2", len: 0.5 },
                { n: "B1", len: 1.0 },
                { n: "A1", len: 1.0 },
                { n: "E2", len: 2.0 },
              ],
              lead: [
                { n: "E4", len: 0.25 },
                { n: "G4", len: 0.25 },
                { n: "Bb4", len: 0.25 },
                { n: "A4", len: 0.25 },
                { n: "F4", len: 0.25 },
                { n: "D4", len: 0.25 },
                { n: "C5", len: 0.25 },
                { n: "B4", len: 0.25 },
              ],
              padFreqs: [
                { n: "E3", dur: 8.0 },
                { n: "G3", dur: 8.0 },
                { n: "B3", dur: 8.0 },
                { n: "C4", dur: 8.0 },
              ],
              loopPause: 1.0,
              dur: 6,
            },
            {
              seqs: [
                { n: "E2", len: 0.5 },
                { n: "E2", len: 0.25 },
                { n: "G2", len: 0.25 },
                { n: "A2", len: 0.5 },
                { n: "F2", len: 0.5 },
                { n: "E2", len: 1.0 },
                { n: "D2", len: 1.0 },
                { n: "E2", len: 2.0 },
              ],
              lead: [
                { n: "E4", len: 0.25 },
                { n: "A4", len: 0.25 },
                { n: "C5", len: 0.25 },
                { n: "A4", len: 0.25 },
                { n: "G4", len: 0.25 },
                { n: "E4", len: 0.25 },
                { n: "D5", len: 0.25 },
                { n: "B4", len: 0.25 },
              ],
              loopPause: 0.5,
              dur: 6,
            },
            {
              seqs: [
                { n: "E2", len: 0.5 },
                { n: "F#2", len: 0.5 },
                { n: "A2", len: 0.5 },
                { n: "G2", len: 0.5 },
                { n: "B2", len: 1.0 },
                { n: "C3", len: 1.0 },
                { n: "E2", len: 2.0 },
              ],
              lead: [
                { n: "E4", len: 0.5 },
                { n: "A4", len: 0.5 },
                { n: "G4", len: 0.5 },
                { n: "C5", len: 0.5 },
                { n: "B4", len: 0.75 },
                { n: "G4", len: 0.25 },
                { n: "E5", len: 0.5 },
                { n: "A4", len: 1.0 },
              ],
              padFreqs: [
                { n: "E3", dur: 8.0 },
                { n: "G3", dur: 8.0 },
                { n: "B3", dur: 8.0 },
                { n: "C4", dur: 8.0 },
              ],
              loopPause: 0.5,
              dur: 6,
            },
          ],
        },
      },

      encounter: {
        data: {
          name: "Digital Ambush",
          length: 14.0,
          bpm: 160,
          arp: [
            { n: "E5", len: 0.125 },
            { n: "C5", len: 0.125 },
            { n: "G4", len: 0.125 },
            { n: "B4", len: 0.125 },
            { n: "E5", len: 0.125 },
            { n: "C5", len: 0.125 },
            { n: "D5", len: 0.125 },
            { n: "B4", len: 0.125 },
          ],
        },
      },

      gameover: {
        data: {
          name: "System Failure",
          length: 10.0,
          bpm: 80,
          seq: [
            { n: "E4", len: 0.5 },
            { n: "C4", len: 0.5 },
            { n: "B3", len: 0.5 },
            { n: "G3", len: 0.5 },
            { n: "E3", len: 1.0 },
            { n: "C3", len: 1.0 },
          ],
        },
      },
    }
  }

  async playTrack(key: string) {
    if (!this.ctx)
      throw new Error(
        "Call initOnGesture() first from a user gesture (e.g. click)."
      )
    if (!this.trackDefs[key]) throw new Error("Unknown track: " + key)
    this.stop()
    const def = this.trackDefs[key]
    this._startLoop(
      key,
      (start: number) => this._scheduleTrack(start, key),
      (def.data && def.data.length) || def.length
    )
    return (def.data && def.data.name) || def.name
  }

  stop() {
    if (this.loopTimer) {
      clearTimeout(this.loopTimer)
      this.loopTimer = null
    }
    this.activeLoop = null
    const voices = [...this.activeVoices]
    for (const v of voices) {
      try {
        v.stop()
      } catch (e) {}
    }
    this.activeVoices = []
  }

  setMasterVolume(v: number) {
    if (!this.master) return
    this.master.gain.value = v
  }
}
