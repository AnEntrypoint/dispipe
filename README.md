# Jeeves — Discord Audio Connector

Minimal Discord voice connectivity module set. Handles bot client instantiation, voice channel join/leave, and bi-directional audio PCM pipelines (encode Float32→Opus, decode Opus→Float32).

## Modules

- **`./client`** — `discord.js` v14 client wrapper with voice join retry logic, session recovery, and speaker subscription
  - `createClient()` — instantiate bot client
  - `joinDiscordVoice(client, guildId, channelId)` — join voice channel with 8-attempt retry loop
  - `subscribeToSpeaker(userId, onPcmChunk)` — subscribe to inbound Discord user audio (Opus→PCM Float32)
  - `leaveVoice()` — destroy voice connection

- **`./voice`** — AudioPlayer pipeline (Float32 PCM → s16le → Opus encode → Discord)
  - `initVoicePlayer(connection)` — wire voice connection to audio player
  - `pushAudioFrame(f32Buffer)` — enqueue Float32 PCM frame (48kHz stereo)
  - `stopAudio()` — stop playback and clean up streams

## Usage

```js
import { createClient, joinDiscordVoice, subscribeToSpeaker } from 'jeeves/client'
import { initVoicePlayer, pushAudioFrame } from 'jeeves/voice'

const client = createClient()
await client.login(process.env.DISCORD_BOT_TOKEN)

const { voiceConnection, voiceReceiver } = await joinDiscordVoice(
  client,
  process.env.GUILD_ID,
  process.env.CHANNEL_ID
)

initVoicePlayer(voiceConnection)

// Inbound: receive from Discord
subscribeToSpeaker(userId, (userId, f32Buffer) => {
  console.log('inbound audio frame', userId, f32Buffer.length)
})

// Outbound: send to Discord
const f32 = new Float32Array(48000) // 1s @ 48kHz stereo
pushAudioFrame(f32)
```

## Environment

- `DISCORD_BOT_TOKEN` — official bot token (discord.js v14)
- `GUILD_ID` — guild snowflake
- `CHANNEL_ID` — voice channel snowflake

Bot must have CONNECT + SPEAK permissions in the target channel.

## Dependencies

- `discord.js@^14.25.1` — gateway, voice intents
- `@discordjs/voice@^0.19.2` — voice connection, encryption
- `prism-media@^1.3.4` — Opus encode/decode
- `tweetnacl@^1.0.3` — voice encryption (Curve25519)

## Design

### Voice Join Retry

On join attempt, first sends a voice leave (op 4) to Discord to clear any stale session. Then retries up to 8 times with backoff:
- Close code 4017 (invalid token) → 10s delay
- Close code 4006 (stale session) → 8s delay
- Other → 4s delay

### Audio Pipeline

**Outbound** (page/app → Discord):
1. Float32 input at 48kHz stereo
2. Clamp to [−1, 1]
3. Convert to Int16 (scaled by ±32767/32768)
4. Accumulate into 960-sample (20ms) frames
5. Pipe to prism Opus encoder
6. Feed Opus stream to AudioPlayer
7. AudioPlayer publishes to Discord voice connection

**Inbound** (Discord → app):
1. VoiceReceiver subscribes to user Opus stream
2. prism Opus decoder → Int16 buffer
3. Convert Int16 → Float32 (divide by 32768)
4. Emit via callback

### Connection Recovery

Listens for `Disconnected` state on voice connection and calls `rejoin()` immediately. Complements the 15s reconnect timer in host app.

## Notes

- Both modules are standalone — no Electron, no browser-specific APIs.
- Suitable for headless bots, companion bridges, and Electron main process.
- Audio frames must be exactly 960 samples (20ms @ 48kHz).
- Float32 clipping happens at envelope (no amplitude overflow).
