// dispipe marketing site — single SPA rendered through the
// anentrypoint-design SDK (window.ds.h / applyDiff / components).
// All visual chrome (Topbar, Crumb, Side, AppShell, Panel, Row, Hero,
// Lede, Install, Receipt) comes from the SDK.

const SECTIONS = [
    ['overview', '#overview'],
    ['api', '#api'],
    ['pipeline', '#pipeline'],
    ['install', '#install'],
];

const state = {
    section: (location.hash.slice(1) || 'overview'),
    copied: false,
};

const apiModules = [
    {
        path: 'dispipe/client',
        title: 'Client & voice join',
        summary: 'discord.js v14 wrapper. voice join with retry/backoff, inbound speaker subscription.',
        functions: [
            { sig: 'createClient()', desc: 'Instantiate a configured discord.js Client (Guilds + GuildVoiceStates intents).' },
            { sig: 'joinDiscordVoice(client, guildId, channelId)', desc: '8-attempt retry loop. Code-aware backoff: 4017 → 10s, 4006 → 8s, else 4s.' },
            { sig: 'subscribeToSpeaker(userId, onPcmChunk)', desc: 'Subscribe to a user\'s inbound Opus stream. Decodes to Float32 48kHz stereo and invokes callback.' },
            { sig: 'leaveVoice()', desc: 'Tear down voice connection and clean up subscriptions.' },
        ],
    },
    {
        path: 'dispipe/voice',
        title: 'Outbound audio player',
        summary: 'AudioPlayer pipeline. Float32 PCM → s16le → Opus encode → Discord voice connection.',
        functions: [
            { sig: 'initVoicePlayer(connection)', desc: 'Wire a voice connection to the AudioPlayer. Sets up the encoder pipeline.' },
            { sig: 'pushAudioFrame(f32Buffer)', desc: 'Enqueue a Float32 PCM frame. 48kHz stereo, 960 samples (20ms).' },
            { sig: 'stopAudio()', desc: 'Stop playback, drain encoder, release streams.' },
        ],
    },
];

const outboundSteps = [
    'Float32 input at 48kHz stereo',
    'Clamp to [−1, 1]',
    'Convert to Int16 (scaled by ±32767/32768)',
    'Accumulate into 960-sample (20ms) frames',
    'Pipe to prism Opus encoder',
    'Feed Opus stream to AudioPlayer',
    'AudioPlayer publishes to Discord voice connection',
];

const inboundSteps = [
    'VoiceReceiver subscribes to user Opus stream',
    'prism Opus decoder → Int16 buffer',
    'Convert Int16 → Float32 (divide by 32768)',
    'Emit via callback at 48kHz stereo',
];

const features = [
    { glyph: '⤴', title: 'Voice join with retry', body: '8-attempt loop with code-aware backoff. Op-4 leave clears stale sessions before retry.' },
    { glyph: '⇄', title: 'Float32 ⇄ Opus', body: 'Bi-directional 48kHz stereo PCM pipeline. 20ms frames via prism-media.' },
    { glyph: '◇', title: 'Headless & standalone', body: 'No Electron, no browser-only APIs. Drops into bots, bridges, or Electron main.' },
    { glyph: '↻', title: 'Connection recovery', body: 'Listens for the Disconnected voice state and rejoin()s immediately.' },
];

const exampleCode = `import { createClient, joinDiscordVoice, subscribeToSpeaker } from 'dispipe/client'
import { initVoicePlayer, pushAudioFrame } from 'dispipe/voice'

const client = createClient()
await client.login(process.env.DISCORD_BOT_TOKEN)

const { voiceConnection } = await joinDiscordVoice(
  client,
  process.env.GUILD_ID,
  process.env.CHANNEL_ID
)

initVoicePlayer(voiceConnection)

subscribeToSpeaker(userId, (uid, f32) => {
  console.log('inbound', uid, f32.length)
})

pushAudioFrame(new Float32Array(960))`;

const envRows = [
    ['DISCORD_BOT_TOKEN', 'Official Discord bot token (discord.js v14).'],
    ['GUILD_ID', 'Snowflake of the target guild.'],
    ['CHANNEL_ID', 'Snowflake of the voice channel to join.'],
];

const sideSections = [
    {
        group: 'project',
        items: [
            { glyph: '◆', label: 'overview', active: () => state.section === 'overview', onClick: navTo('overview') },
            { glyph: '§', label: 'api', active: () => state.section === 'api', onClick: navTo('api') },
            { glyph: '§', label: 'pipeline', active: () => state.section === 'pipeline', onClick: navTo('pipeline') },
            { glyph: '§', label: 'install', active: () => state.section === 'install', onClick: navTo('install') },
        ],
    },
    {
        group: 'links',
        items: [
            { glyph: '↗', label: 'github', onClick: extLink('https://github.com/AnEntrypoint/dispipe') },
            { glyph: '↗', label: 'npm', onClick: extLink('https://www.npmjs.com/package/dispipe') },
            { glyph: '↗', label: 'discord.js', onClick: extLink('https://discord.js.org') },
        ],
    },
];

function navTo(name) {
    return (e) => { if (e) e.preventDefault(); state.section = name; location.hash = name; render(); };
}
function extLink(url) {
    return () => window.open(url, '_blank', 'noopener');
}

function render() {
    const ds = window.ds;
    if (!ds || !ds.applyDiff) return;
    const root = document.getElementById('app');
    if (!root) return;
    if (!root.classList.contains('ds-247420')) root.classList.add('ds-247420');
    ds.applyDiff(root, view());
}

function view() {
    const { h, components: C } = window.ds;
    return C.AppShell({
        topbar: C.Topbar({
            brand: 'dispipe',
            leaf: 'discord audio connector',
            items: [
                ...SECTIONS.map(([label, href]) => [label, href]),
                ['source ↗', 'https://github.com/AnEntrypoint/dispipe'],
            ],
            active: state.section,
            onNav: (label) => { if (SECTIONS.some(s => s[0] === label)) navTo(label)(); },
        }),
        crumb: C.Crumb({
            trail: ['247420', 'projects'],
            leaf: 'dispipe',
            right: [
                C.Chip({ tone: 'accent', children: '● live' }),
                C.Chip({ tone: 'dim', children: 'voice · opus · pcm' }),
            ],
        }),
        side: C.Side({
            sections: sideSections.map(sec => ({
                group: sec.group,
                items: sec.items.map(it => ({
                    glyph: it.glyph,
                    label: it.label,
                    active: typeof it.active === 'function' ? it.active() : false,
                    onClick: it.onClick,
                })),
            })),
        }),
        main: sectionView(),
        status: C.Status({
            left: ['dispipe', 'v1.x', 'MIT'],
            right: ['discord.js@^14.25', 'prism-media@^1.3', '48kHz stereo'],
        }),
    });
}

function sectionView() {
    const { h, components: C } = window.ds;
    switch (state.section) {
        case 'api': return apiSection();
        case 'pipeline': return pipelineSection();
        case 'install': return installSection();
        default: return overviewSection();
    }
}

function overviewSection() {
    const { h, components: C } = window.ds;
    return [
        C.Hero({
            title: 'dispipe.',
            body: 'a tiny discord voice connector — voice channel join, opus encode/decode, float32 pcm pipeline. headless. standalone. drops into bots, bridges, or electron main without ceremony.',
            accent: 'no electron required.',
        }),
        h('div', { style: 'padding:0 32px 24px' },
            C.Panel({
                title: 'features',
                count: features.length,
                style: 'max-width:860px;margin:0',
                children: h('div', { class: 'feature-grid' },
                    ...features.map((f, i) =>
                        h('div', { class: 'feature-tile', key: i },
                            h('span', { class: 'glyph' }, f.glyph),
                            h('h4', {}, f.title),
                            h('p', {}, f.body),
                        )
                    )
                ),
            })
        ),
        h('div', { style: 'padding:0 32px 24px' },
            C.Panel({
                title: 'currently shipping',
                style: 'max-width:560px;margin:0',
                children: [
                    C.Row({ code: '●', title: 'dispipe', sub: 'discord audio connector', meta: 'live' }),
                    C.Row({ code: '●', title: 'voice join retry', sub: '8-attempt with backoff', meta: 'stable' }),
                    C.Row({ code: '●', title: 'bi-directional pcm', sub: 'float32 ⇄ opus', meta: 'stable' }),
                ],
            })
        ),
    ];
}

function apiSection() {
    const { h, components: C } = window.ds;
    return [
        C.Hero({
            title: '// api',
            body: 'two import paths. each owns one half of the audio pipeline.',
        }),
        ...apiModules.map((m, i) => h('div', { key: m.path, style: 'padding:0 32px 20px' },
            C.Panel({
                title: m.path,
                right: h('span', { class: 'meta' }, m.title),
                style: 'max-width:900px;margin:0',
                children: [
                    h('p', { style: 'padding:12px 16px;margin:0;color:var(--panel-text-2);font-size:13px;line-height:1.55;border-bottom:1px solid var(--panel-3)' }, m.summary),
                    ...m.functions.map((f, j) => h('div', { class: 'api-fn', key: j },
                        h('code', {}, f.sig),
                        h('p', {}, f.desc),
                    )),
                ],
            })
        )),
    ];
}

function pipelineSection() {
    const { h, components: C } = window.ds;
    return [
        C.Hero({
            title: '// pipeline',
            body: 'how frames move between your app and discord — outbound encode and inbound decode.',
        }),
        h('div', { style: 'padding:0 32px 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;max-width:900px' },
            C.Panel({
                title: '⬆ outbound · app → discord',
                style: 'margin:0',
                children: h('ol', { class: 'step-list' }, ...outboundSteps.map((s, i) => h('li', { key: i }, s))),
            }),
            C.Panel({
                title: '⬇ inbound · discord → app',
                style: 'margin:0',
                children: h('ol', { class: 'step-list' }, ...inboundSteps.map((s, i) => h('li', { key: i }, s))),
            }),
        ),
        h('div', { style: 'padding:0 32px 24px' },
            C.Panel({
                title: 'connection recovery',
                style: 'max-width:900px;margin:0',
                children: h('p', { style: 'padding:14px 16px;margin:0;font-size:13px;line-height:1.6;color:var(--panel-text)' },
                    'Listens for the Disconnected voice state and calls rejoin() immediately. ',
                    'Complements any host-app reconnect timer. Voice join sends an op-4 leave first ',
                    'to clear stale sessions before retry.'
                ),
            })
        ),
    ];
}

function installSection() {
    const { h, components: C } = window.ds;
    return [
        C.Hero({
            title: '// install',
            body: 'install from npm, set three env vars, wire two functions.',
        }),
        h('div', { style: 'padding:0 32px 18px;max-width:860px' },
            C.Install({
                cmd: 'npm install dispipe',
                copied: state.copied,
                onCopy: (cmd) => {
                    navigator.clipboard?.writeText(cmd);
                    state.copied = true;
                    render();
                    setTimeout(() => { state.copied = false; render(); }, 1200);
                },
            })
        ),
        h('div', { style: 'padding:0 32px 18px' },
            C.Panel({
                title: 'environment',
                count: envRows.length,
                style: 'max-width:860px;margin:0',
                children: C.Receipt({ rows: envRows }),
            })
        ),
        h('div', { style: 'padding:0 32px 18px' },
            C.Panel({
                title: 'permissions',
                style: 'max-width:860px;margin:0',
                children: h('p', { style: 'padding:14px 16px;margin:0;font-size:13px;color:var(--panel-text);line-height:1.55' },
                    'Bot must hold ', h('code', { style: 'color:var(--panel-accent)' }, 'CONNECT'),
                    ' and ', h('code', { style: 'color:var(--panel-accent)' }, 'SPEAK'),
                    ' permissions in the target voice channel.'
                ),
            })
        ),
        h('div', { style: 'padding:0 32px 18px' },
            C.Panel({
                title: 'example',
                style: 'max-width:860px;margin:0',
                children: h('div', { style: 'padding:14px 16px' }, h('pre', { class: 'code-block' }, exampleCode)),
            })
        ),
        h('div', { style: 'padding:0 32px 28px' },
            C.Panel({
                title: 'notes',
                style: 'max-width:860px;margin:0',
                children: [
                    C.Row({ code: '▸', title: 'standalone', sub: 'no Electron, no browser-only APIs.' }),
                    C.Row({ code: '▸', title: 'frame size', sub: 'exactly 960 samples (20ms @ 48kHz).' }),
                    C.Row({ code: '▸', title: 'amplitude', sub: 'Float32 clamps at envelope; no overflow.' }),
                ],
            })
        ),
    ];
}

async function waitForSdk(timeoutMs = 5000) {
    const start = Date.now();
    while (!window.ds || !window.ds.applyDiff) {
        if (Date.now() - start > timeoutMs) throw new Error('design SDK failed to load');
        await new Promise(r => setTimeout(r, 16));
    }
}

window.addEventListener('hashchange', () => {
    state.section = (location.hash.slice(1) || 'overview');
    render();
});

window.__debug = window.__debug || {};
window.__debug.dispipe = { state, render };

waitForSdk().then(render).catch(err => {
    document.getElementById('app').innerHTML =
        '<pre style="color:#f55;font-family:monospace;padding:24px">' + err.message + '</pre>';
});
