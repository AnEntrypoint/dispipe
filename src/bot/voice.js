import { createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus, VoiceConnectionStatus } from '@discordjs/voice'
import { PassThrough } from 'node:stream'
import prism from 'prism-media'

let audioPlayer = null
let pcmInput = null
let voiceConn = null
let _pushCount = 0
const FRAME = 960 * 2 * 2          // 20ms @ 48kHz stereo int16 = 3840 bytes
const SILENCE = Buffer.alloc(FRAME)
// Real-time jitter buffer: synthesis arrives in bursts (a whole sentence at once),
// but Discord wants exactly one 20ms frame every 20ms. We queue incoming frames and
// a single paced pump drains the queue at real-time (silence when empty), so a burst
// plays at true speed (no speed-up/slow-down) and the stream is ALWAYS fed -> the
// player never goes Idle, so the encoder is never torn down/rebuilt mid-speech
// (the rebuild was the source of the gaps + robotic clicks).
let frameQueue = []
let _carry = Buffer.alloc(0)       // leftover < one frame between pushes
let _pump = null
const MAX_QUEUE = 60 * 50          // ~60s safety cap (drop oldest beyond this)

function _makeStream() {
  if (pcmInput) { try { pcmInput.destroy() } catch {} }
  pcmInput = new PassThrough({ highWaterMark: FRAME * 400 })
  const encoder = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 })
  pcmInput.pipe(encoder)
  return createAudioResource(encoder, { inputType: StreamType.Opus })
}

// Clock-based pacing: keep the stream written up to (real elapsed + LOOKAHEAD)
// worth of 20ms frames. A naive one-frame-per-20ms-tick pump starves the player
// whenever a Node timer fires late (it does, under load) -> rapid cutting. Tying
// the write target to a real clock + a small lookahead buffer absorbs that jitter
// and still plays at exactly real-time (writtenFrames tracks elapsed time).
const LOOKAHEAD_MS = Number(process.env.VOICE_LOOKAHEAD_MS || 120)
let _writtenFrames = 0
let _pumpStart = 0
function _startPump() {
  if (_pump) return
  _pumpStart = Date.now()
  _writtenFrames = 0
  _pump = setInterval(() => {
    if (!pcmInput || pcmInput.destroyed) return
    const target = Math.floor((Date.now() - _pumpStart + LOOKAHEAD_MS) / 20)
    let n = Math.min(target - _writtenFrames, 100) // burst cap per tick
    while (n-- > 0) {
      const frame = frameQueue.length ? frameQueue.shift() : SILENCE
      try { pcmInput.write(frame) } catch {}
      _writtenFrames++
    }
  }, 10)
  if (_pump.unref) _pump.unref()
}
function _stopPump() { if (_pump) { clearInterval(_pump); _pump = null } }

function initVoicePlayer(connection) {
  if (audioPlayer) { try { audioPlayer.stop() } catch {} }
  voiceConn = connection
  audioPlayer = createAudioPlayer()

  console.log('[voice] connection state on init:', connection.state.status)

  connection.on('stateChange', (oldState, newState) => {
    console.log(`[voice] connection: ${oldState.status} -> ${newState.status}`)
    if (newState.status === VoiceConnectionStatus.Disconnected) {
      try { connection.rejoin() } catch {}
    }
  })

  audioPlayer.on('error', (err) => console.error('[voice] player error:', err.message))
  audioPlayer.on('stateChange', (oldState, newState) => {
    // Safety net only: with the silence-filled pump the player should never go
    // Idle. If it does (stream error), rebuild and keep the pump feeding it.
    if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
      const resource = _makeStream()
      audioPlayer.play(resource)
    }
  })

  connection.subscribe(audioPlayer)

  const resource = _makeStream()
  audioPlayer.play(resource)
  _startPump()
  console.log('[voice] player started (paced pump)')
}

function pushAudioFrame(f32Buffer) {
  const f32 = f32Buffer instanceof Float32Array ? f32Buffer : new Float32Array(f32Buffer)
  const s16 = new Int16Array(f32.length)
  for (let i = 0; i < f32.length; i++) {
    const c = f32[i] > 1 ? 1 : f32[i] < -1 ? -1 : f32[i]
    s16[i] = c < 0 ? c * 32768 : c * 32767
  }
  // queue exact 20ms frames; the paced pump drains them at real-time. Copy each
  // frame (subarray shares the s16 buffer, which the caller may reuse).
  const buf = Buffer.concat([_carry, Buffer.from(s16.buffer, s16.byteOffset, s16.byteLength)])
  let off = 0
  while (off + FRAME <= buf.length) {
    frameQueue.push(Buffer.from(buf.subarray(off, off + FRAME)))
    off += FRAME; _pushCount++
  }
  _carry = off < buf.length ? Buffer.from(buf.subarray(off)) : Buffer.alloc(0)
  if (frameQueue.length > MAX_QUEUE) frameQueue.splice(0, frameQueue.length - MAX_QUEUE)
}

function stopAudio() {
  _stopPump()
  frameQueue = []
  _carry = Buffer.alloc(0)
  if (pcmInput) { try { pcmInput.end() } catch {}; pcmInput = null }
  if (audioPlayer) { audioPlayer.stop(); audioPlayer = null }
  voiceConn = null
}

function flushAudio() {
  // drop anything queued (interrupt) without tearing the stream down
  frameQueue = []
  _carry = Buffer.alloc(0)
}

export { initVoicePlayer, pushAudioFrame, stopAudio, flushAudio }
