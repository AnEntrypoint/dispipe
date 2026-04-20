import { createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus, VoiceConnectionStatus } from '@discordjs/voice'
import { PassThrough } from 'node:stream'
import prism from 'prism-media'

let audioPlayer = null
let pcmInput = null
let voiceConn = null
let _pushCount = 0
const FRAME = 960 * 2 * 2
let _accumBuf = Buffer.alloc(0)

function _makeStream() {
  if (pcmInput) {
    try { pcmInput.destroy() } catch {}
  }
  pcmInput = new PassThrough({ highWaterMark: 960 * 2 * 2 * 200 })
  const encoder = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 })
  pcmInput.pipe(encoder)
  const resource = createAudioResource(encoder, { inputType: StreamType.Opus })
  return resource
}

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
    if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
      const resource = _makeStream()
      audioPlayer.play(resource)
    }
  })

  connection.subscribe(audioPlayer)

  const resource = _makeStream()
  audioPlayer.play(resource)
  console.log('[voice] player started')
}

function pushAudioFrame(f32Buffer) {
  if (!pcmInput || pcmInput.destroyed) return
  const f32 = f32Buffer instanceof Float32Array ? f32Buffer : new Float32Array(f32Buffer)
  const s16 = new Int16Array(f32.length)
  for (let i = 0; i < f32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, f32[i]))
    s16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767
  }
  const s16Buf = Buffer.from(s16.buffer, s16.byteOffset, s16.byteLength)
  if (_accumBuf.length === 0 && s16Buf.length >= FRAME) {
    let off = 0
    while (off + FRAME <= s16Buf.length) { pcmInput.write(s16Buf.subarray(off, off + FRAME)); off += FRAME; _pushCount++ }
    if (off < s16Buf.length) _accumBuf = Buffer.from(s16Buf.subarray(off))
  } else {
    _accumBuf = Buffer.concat([_accumBuf, s16Buf])
  }
  while (_accumBuf.length >= FRAME) {
    pcmInput.write(_accumBuf.subarray(0, FRAME))
    _accumBuf = _accumBuf.subarray(FRAME)
    _pushCount++
  }
}

function stopAudio() {
  if (pcmInput) {
    try { pcmInput.end() } catch {}
    pcmInput = null
  }
  if (audioPlayer) {
    audioPlayer.stop()
    audioPlayer = null
  }
  voiceConn = null
}

function flushAudio() {
  if (!audioPlayer) return
  _accumBuf = Buffer.alloc(0)
  const resource = _makeStream()
  audioPlayer.play(resource)
}

export { initVoicePlayer, pushAudioFrame, stopAudio, flushAudio }
