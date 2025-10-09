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
    this.loadEditedTracks()
  }

  async initOnGesture() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.AudioContext)()
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

  private noteToFreq(note: string | number): number {
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

    // register voice so it can be stopped early
    const voice = {
      stop: (when = this._now()) => {
        try {
          g.gain.cancelScheduledValues(when)
          g.gain.setValueAtTime(0.0001, when)
          // schedule a quick stop to avoid abrupt cut
          src.stop(when + 0.02)
        } catch (e) {
          // ignore if already stopped
        }
        try {
          g.disconnect()
        } catch (_) {}
        try {
          src.disconnect()
        } catch (_) {}
      },
    }
    // cleanup once it naturally ends
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
    g.setValueAtTime(g.value, at)
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
      const freq = this.noteToFreq(step.n)
      const dur = (step.len || 0.25) * beatSec
      const inst = instrumentFactory(freq, t)
      this._applyEnvelope(inst.gain, t, opts.env || {})
      this._releaseEnvelope(inst.gain, t + dur - 0.001, opts.env || {})
      inst.osc.start(t)
      inst.osc.stop(t + dur + 0.05)
      // register voice so it can be stopped early when switching tracks
      const voice = {
        stop: (when = this._now()) => {
          try {
            // try a quick release and stop oscillator shortly after
            this._releaseEnvelope(inst.gain, when, { release: 0.02 })
            inst.osc.stop(when + 0.05)
          } catch (e) {
            // ignore if already stopped/scheduled
          }
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
      const start = this._now() + 0.04
      scheduleFn(start)
      this.loopTimer = setTimeout(
        scheduleOnce,
        Math.max(10, (loopLengthSec - scheduleAhead) * 1000)
      )
    }
    scheduleOnce()
  }

  // voice registry helpers
  private _addVoice(v: { stop: (when?: number) => void }) {
    this.activeVoices.push(v)
  }
  private _removeVoice(v: { stop: (when?: number) => void }) {
    const i = this.activeVoices.indexOf(v)
    if (i !== -1) this.activeVoices.splice(i, 1)
  }

  // UI / editor helpers -----------------------------------------------------
  // Return analyser for visualization (may be null until initOnGesture)
  getAnalyser() {
    return this.analyser
  }

  // Return a small summary list of tracks for the UI
  getTracks() {
    return Object.keys(this.trackDefs).map((k) => {
      const data = this.editedData[k] || this.trackDefs[k].data
      return { key: k, name: data.name, length: data.length, bpm: data.bpm }
    })
  }

  // return a deep-cloned serializable track data object for editing
  getTrackData(key: string) {
    if (!this.trackDefs[key]) throw new Error("Unknown track: " + key)
    return JSON.parse(
      JSON.stringify(this.editedData[key] || this.trackDefs[key].data)
    )
  }

  // update editable data (and persist)
  updateTrackData(key: string, newData: any) {
    if (!this.trackDefs[key]) {
      // if track didn't exist, register it so the UI can immediately play it
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

  // create/register a new track from a serializable data object
  // data is expected to contain fields similar to existing tracks:
  // { name, length, bpm, bassSeq?, leadSeq?, arp?, seq? }
  addTrack(key: string, data: any) {
    if (!key) {
      // fallback to slug of name if key empty
      key = (data.name || "track").toString().replace(/\s+/g, "-").toLowerCase()
    }
    const slug = key.toString().replace(/\s+/g, "-").toLowerCase()

    // create a schedule function that understands common arrays used by the UI
    const schedule = (startTime: number) => {
      const d = data
      const bpm = d.bpm || 120
      const endTime = startTime + (d.length || 8)

      // schedule bass sequence if present
      if (Array.isArray(d.bassSeq) && d.bassSeq.length) {
        let t = startTime
        while (t < endTime - 0.001) {
          t = this._scheduleMelody(
            t,
            d.bassSeq,
            bpm,
            (freq, when) => {
              const inst = this._createBassOsc(freq, when)
              inst.gain.gain.value = 0.0001
              return inst
            },
            {
              env: {
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

      // schedule lead sequence if present
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
              env: {
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

      // schedule simple arp/seq arrays (if present)
      if (Array.isArray(d.arp) && d.arp.length) {
        let t = startTime
        while (t < endTime - 0.001) {
          t = this._scheduleMelody(t, d.arp, bpm, (freq, when) => {
            const inst = this._createLeadOsc(freq, when)
            inst.gain.gain.value = 0.0001
            return inst
          })
        }
      }

      // optional: place simple noise hits every beat if requested
      if (d.noiseEveryBeat) {
        const beatSec = 60 / bpm
        for (let tt = startTime; tt < endTime; tt += beatSec) {
          this._playNoiseHit(tt, { gain: 0.12, duration: 0.03 })
        }
      }
    }

    this.trackDefs[slug] = { data: data, schedule }
    this.editedData[slug] = JSON.parse(JSON.stringify(data))
    try {
      localStorage.setItem(
        "datarunners:tracks",
        JSON.stringify(this.editedData)
      )
    } catch (_) {}
    return slug
  }

  // schedule a single play-through of a registered track (useful for preview)
  scheduleOnce(key: string) {
    if (!this.trackDefs[key]) throw new Error("Unknown track: " + key)
    const start = this._now() + 0.02
    this.trackDefs[key].schedule(start)
  }

  loadEditedTracks() {
    try {
      const raw = localStorage.getItem("datarunners:tracks")
      if (!raw) return
      const parsed = JSON.parse(raw)
      for (const k of Object.keys(parsed)) {
        if (this.trackDefs[k]) {
          this.editedData[k] = parsed[k]
        }
      }
    } catch (e) {}
  }

  async playNote(
    note: string | number,
    { duration = 0.6, instrument = "lead" } = {}
  ) {
    if (!this.ctx || !this.master)
      throw new Error("AudioContext not initialized")
    const t = this._now() + 0.02
    const freq = this.noteToFreq(note)
    const inst =
      instrument === "bass"
        ? this._createBassOsc(freq, t)
        : this._createLeadOsc(freq, t)
    inst.gain.gain.value = 0.0001
    this._applyEnvelope(inst.gain, t, {
      attack: 0.005,
      decay: 0.05,
      sustain: 0.6,
      release: 0.08,
      peak: 0.9,
    })
    inst.osc.start(t)
    inst.osc.stop(t + duration + 0.05)

    const voice = {
      stop: (when = this._now()) => {
        try {
          this._releaseEnvelope(inst.gain, when, { release: 0.02 })
          inst.osc.stop(when + 0.05)
        } catch (_) {}
      },
    }
    inst.osc.onended = () => this._removeVoice(voice)
    this._addVoice(voice)
    return
  }

  _defineTracks() {
    return {
      travel: {
        data: {
          name: "Neon Caravan",
          length: 24.0,
          bpm: 125,
          bassSeq: [
            { n: "E2", len: 0.5 },
            { n: "E2", len: 0.5 },
            { n: "D2", len: 0.5 },
            { n: "E2", len: 0.5 },
            { n: "C2", len: 1.0 },
            { n: "B1", len: 1.0 },
            { n: "E2", len: 2.0 },
          ],
          leadSeq: [
            { n: "E4", len: 0.25 },
            { n: "G4", len: 0.25 },
            { n: "B4", len: 0.25 },
            { n: "G4", len: 0.25 },
            { n: "E4", len: 0.25 },
            { n: "G4", len: 0.25 },
            { n: "C5", len: 0.25 },
            { n: "B4", len: 0.25 },
          ],
        },
        schedule: (startTime: number) => {
          const def = this.trackDefs.travel
          const { bpm } = def.data
          const bassSeq = def.data.bassSeq
          const leadSeq = def.data.leadSeq

          let t = startTime
          const endTime = startTime + def.data.length
          while (t < endTime - 0.001) {
            t = this._scheduleMelody(
              t,
              bassSeq,
              bpm,
              (freq, when) => {
                const inst = this._createBassOsc(freq, when)
                inst.gain.gain.value = 0.0001
                return inst
              },
              {
                env: {
                  attack: 0.002,
                  decay: 0.06,
                  sustain: 0.7,
                  release: 0.08,
                  peak: 0.9,
                },
              }
            )
          }

          t = startTime + 0.0
          while (t < endTime - 0.001) {
            this._scheduleMelody(
              t,
              leadSeq,
              bpm,
              (freq, when) => {
                const inst = this._createLeadOsc(freq, when)
                inst.gain.gain.value = 0.0001
                return inst
              },
              {
                env: {
                  attack: 0.001,
                  decay: 0.04,
                  sustain: 0.5,
                  release: 0.05,
                  peak: 0.7,
                },
              }
            )
            t += 2.0
          }

          const beatSec = 60 / bpm
          for (let tt = startTime; tt < endTime; tt += beatSec * 0.5) {
            this._playNoiseHit(tt, { gain: 0.12, duration: 0.03 })
          }
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
        schedule: (startTime: number) => {
          const def = this.trackDefs.encounter
          const { bpm } = def.data
          const arp = def.data.arp

          let t = startTime
          const endTime = startTime + def.data.length
          while (t < endTime - 0.001) {
            t = this._scheduleMelody(
              t,
              arp,
              bpm,
              (freq, when) => {
                const inst = this._createLeadOsc(freq, when)
                inst.gain.gain.value = 0.0001
                return inst
              },
              {
                env: {
                  attack: 0.001,
                  decay: 0.02,
                  sustain: 0.45,
                  release: 0.03,
                  peak: 1.0,
                },
              }
            )
          }

          const beatSec = 60 / bpm
          for (let tt = startTime; tt < endTime; tt += beatSec) {
            this._playNoiseHit(tt, { gain: 0.28, duration: 0.09 })
          }
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
        schedule: (startTime: number) => {
          const def = this.trackDefs.gameover
          const seq = def.data.seq
          const endTime = startTime + def.data.length
          let t = startTime
          while (t < endTime - 0.001) {
            t = this._scheduleMelody(
              t,
              seq,
              def.data.bpm || 80,
              (freq, when) => {
                const inst = this._createLeadOsc(freq, when)
                inst.gain.gain.value = 0.0001
                return inst
              },
              {
                env: {
                  attack: 0.01,
                  decay: 0.4,
                  sustain: 0.5,
                  release: 0.8,
                  peak: 0.9,
                },
              }
            )
          }

          for (let tt = startTime; tt < endTime; tt += 1.5) {
            this._playNoiseHit(tt, { gain: 0.1, duration: 0.25 })
          }
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
      def.schedule.bind(this),
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
      v.stop()
    }
    this.activeVoices = []
  }

  setMasterVolume(v: number) {
    if (!this.master) return
    this.master.gain.value = v
  }
}
