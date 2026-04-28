const components = {
  hero: (page) => `
    <section class="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 30%, #5865F2 0, transparent 40%), radial-gradient(circle at 80% 70%, #00d4ff 0, transparent 40%);"></div>
      <div class="relative z-10 text-center px-4 max-w-4xl py-24">
        <div class="inline-block mb-6 px-4 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-mono text-sm">🎙 v${page.pkgVersion || '1.0'} · MIT</div>
        <h1 class="text-7xl md:text-8xl font-bold text-white mb-4 tracking-tight font-mono">${page.content.heading}</h1>
        <p class="text-xl md:text-2xl text-indigo-100 mb-3 max-w-2xl mx-auto">${page.content.subheading}</p>
        <p class="text-base text-cyan-300 mb-10 font-mono">${page.content.tagline}</p>
        <div class="flex gap-4 justify-center flex-wrap">
          <a href="./api.html" class="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-indigo-500/30">${page.content.cta_text}</a>
          <a href="./install.html" class="inline-block bg-white/10 hover:bg-white/20 backdrop-blur text-white font-bold py-3 px-8 rounded-lg transition-all border border-white/20">Install</a>
          <a href="https://github.com/AnEntrypoint/dispipe" class="inline-block text-indigo-200 hover:text-white font-bold py-3 px-4 transition-all">GitHub →</a>
        </div>
      </div>
    </section>
    <section class="py-20 bg-slate-50">
      <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <div class="text-4xl mb-3">🔗</div>
          <h3 class="font-bold text-xl mb-2 text-slate-900">Voice Join with Retry</h3>
          <p class="text-slate-600">8-attempt loop with code-aware backoff. Op-4 leave clears stale sessions.</p>
        </div>
        <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <div class="text-4xl mb-3">🔊</div>
          <h3 class="font-bold text-xl mb-2 text-slate-900">Float32 ⇄ Opus</h3>
          <p class="text-slate-600">Bi-directional 48kHz stereo PCM pipeline. 20ms frames via prism-media.</p>
        </div>
        <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <div class="text-4xl mb-3">🪶</div>
          <h3 class="font-bold text-xl mb-2 text-slate-900">Headless & Standalone</h3>
          <p class="text-slate-600">No Electron requirement. Drops into bots, bridges, or Electron main.</p>
        </div>
      </div>
    </section>
  `,

  modules: (page) => `
    <section class="py-20 bg-slate-50 min-h-[80vh]">
      <div class="max-w-5xl mx-auto px-6">
        <div class="mb-12">
          <h2 class="text-5xl font-bold text-slate-900 mb-3 font-mono">${page.content.heading}</h2>
          <p class="text-lg text-slate-600">${page.content.description}</p>
        </div>
        <div class="space-y-8">
          ${page.content.modules.map(m => `
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                <code class="text-cyan-300 font-mono text-sm">import from '${m.path}'</code>
                <h3 class="text-2xl font-bold text-white mt-1">${m.title}</h3>
                <p class="text-indigo-100 text-sm mt-1">${m.summary}</p>
              </div>
              <div class="divide-y divide-slate-100">
                ${m.functions.map(f => `
                  <div class="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <code class="block text-indigo-700 font-mono font-bold mb-1">${f.sig}</code>
                    <p class="text-slate-600 text-sm">${f.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `,

  pipeline: (page) => `
    <section class="py-20 bg-slate-50 min-h-[80vh]">
      <div class="max-w-5xl mx-auto px-6">
        <div class="mb-12">
          <h2 class="text-5xl font-bold text-slate-900 mb-3 font-mono">${page.content.heading}</h2>
          <p class="text-lg text-slate-600">${page.content.description}</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-xl border border-slate-200 p-6">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xl">⬆</span>
              <h3 class="text-xl font-bold text-slate-900">${page.content.outbound.title}</h3>
            </div>
            <ol class="space-y-2">
              ${page.content.outbound.steps.map((s, i) => `
                <li class="flex gap-3 items-start">
                  <span class="flex-none w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-mono font-bold flex items-center justify-center">${i + 1}</span>
                  <span class="text-slate-700 pt-0.5">${s}</span>
                </li>
              `).join('')}
            </ol>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-6">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xl">⬇</span>
              <h3 class="text-xl font-bold text-slate-900">${page.content.inbound.title}</h3>
            </div>
            <ol class="space-y-2">
              ${page.content.inbound.steps.map((s, i) => `
                <li class="flex gap-3 items-start">
                  <span class="flex-none w-7 h-7 rounded-full bg-cyan-600 text-white text-sm font-mono font-bold flex items-center justify-center">${i + 1}</span>
                  <span class="text-slate-700 pt-0.5">${s}</span>
                </li>
              `).join('')}
            </ol>
          </div>
        </div>
        <div class="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-6 border border-indigo-500/30">
          <h3 class="text-xl font-bold mb-2 text-cyan-300">${page.content.recovery.title}</h3>
          <p class="text-slate-200 leading-relaxed">${page.content.recovery.body}</p>
        </div>
      </div>
    </section>
  `,

  install: (page) => `
    <section class="py-20 bg-slate-50 min-h-[80vh]">
      <div class="max-w-4xl mx-auto px-6">
        <div class="mb-10">
          <h2 class="text-5xl font-bold text-slate-900 mb-3 font-mono">${page.content.heading}</h2>
          <p class="text-lg text-slate-600">${page.content.description}</p>
        </div>
        <div class="bg-slate-900 rounded-xl p-6 mb-8 font-mono">
          <div class="text-slate-500 text-xs mb-2">$ install</div>
          <code class="text-cyan-300 text-lg">${page.content.install_cmd}</code>
        </div>
        <h3 class="text-2xl font-bold text-slate-900 mb-3 mt-10">Environment</h3>
        <div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 mb-3">
          ${page.content.env.map(e => `
            <div class="px-5 py-4">
              <code class="font-mono font-bold text-indigo-700">${e.name}</code>
              <p class="text-slate-600 text-sm mt-1">${e.desc}</p>
            </div>
          `).join('')}
        </div>
        <p class="text-sm text-slate-500 italic mb-10">${page.content.permissions}</p>
        <h3 class="text-2xl font-bold text-slate-900 mb-3">Example</h3>
        <pre class="bg-slate-900 text-slate-100 rounded-xl p-6 overflow-x-auto text-sm font-mono leading-relaxed mb-10"><code>${page.content.example.replace(/</g, '&lt;')}</code></pre>
        <h3 class="text-2xl font-bold text-slate-900 mb-3">Notes</h3>
        <ul class="space-y-2">
          ${page.content.notes.map(n => `
            <li class="flex gap-3 items-start">
              <span class="flex-none text-indigo-500">▸</span>
              <span class="text-slate-700">${n}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </section>
  `
};

const navbar = (site, navigation) => {
  const getLink = (href) => href === '/' ? './index.html' : `.${href}.html`;
  return `
  <nav class="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-indigo-500/20">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex items-center justify-between h-16">
        <a href="./index.html" class="text-2xl font-bold text-white font-mono tracking-tight">
          <span class="text-indigo-400">▶</span> dispipe
        </a>
        <div class="hidden md:flex space-x-1">
          ${navigation.map(item => `
            <a href="${getLink(item.href)}" class="px-4 py-2 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm">
              ${item.text}
            </a>
          `).join('')}
          <a href="https://github.com/AnEntrypoint/dispipe" class="ml-2 px-4 py-2 rounded-md text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-colors font-medium text-sm">
            GitHub
          </a>
        </div>
      </div>
    </div>
  </nav>
`;
};

const footerHtml = (nav) => `
  <footer class="bg-slate-950 text-slate-300 py-10 border-t border-indigo-500/20">
    <div class="max-w-7xl mx-auto px-6">
      <p class="text-slate-400 mb-4">${nav.footer.text}</p>
      <div class="flex flex-wrap gap-5 text-slate-400 text-sm">
        ${nav.footer.social.map(s => `
          <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="hover:text-indigo-400 transition-colors font-medium">
            ${s.name}
          </a>
        `).join(' · ')}
      </div>
    </div>
  </footer>
`;

const baseTemplate = (content, site, nav, pageTitle, pageId) => {
  const pageUrl = pageId === 'home' ? site.url : `${site.url}/${pageId}.html`;
  const fullTitle = pageId === 'home' ? site.title : `${pageTitle} · dispipe`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${site.description}">
    <meta name="author" content="${site.author}">
    <meta name="keywords" content="${site.keywords.join(', ')}">
    <meta property="og:title" content="${fullTitle}">
    <meta property="og:description" content="${site.description}">
    <meta property="og:url" content="${pageUrl}">
    <link rel="canonical" href="${pageUrl}">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>🎙</text></svg>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <style type="text/tailwindcss">
      @theme {
        --font-family-sans: 'Inter', system-ui, sans-serif;
        --font-family-mono: 'JetBrains Mono', ui-monospace, monospace;
      }
      html { scroll-behavior: smooth; }
      body { font-family: 'Inter', system-ui, sans-serif; }
    </style>
    <title>${fullTitle}</title>
</head>
<body class="bg-slate-50">
    ${navbar(site, nav.navigation)}
    ${content}
    ${footerHtml(nav)}
</body>
</html>`;
};

const pageOrder = ['home', 'api', 'pipeline', 'install'];

export default {
  render: async (ctx) => {
    const site = ctx.readGlobal('site');
    const nav = ctx.readGlobal('navigation');
    const { docs: pages } = ctx.read('pages');
    pages.sort((a, b) => pageOrder.indexOf(a.id) - pageOrder.indexOf(b.id));

    const outputs = [];

    outputs.push({
      path: 'robots.txt',
      html: `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`
    });

    const lastmod = new Date().toISOString().split('T')[0];
    outputs.push({
      path: 'sitemap.xml',
      html: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => {
        const url = p.id === 'home' ? site.url : `${site.url}/${p.id}.html`;
        return `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod><priority>${p.id === 'home' ? '1.0' : '0.8'}</priority></url>`;
      }).join('\n')}\n</urlset>`
    });

    pages.forEach((page, index) => {
      page.index = index;
      const templateFn = components[page.template];
      if (!templateFn) { console.error('Unknown template:', page.template); return; }
      outputs.push({
        path: page.id === 'home' ? 'index.html' : `${page.id}.html`,
        html: baseTemplate(templateFn(page), site, nav, page.title, page.id)
      });
    });

    return outputs;
  }
};
