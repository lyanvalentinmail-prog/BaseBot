// ═══════════════════════════════════════════════════════════════════
//   🛠️ HERRAMIENTAS
//   ─────────────────────────────────────────────────────────────────
//   Comandos de la sección /api/tools de la API Akari:
//
//     font      → convierte tu texto a letras bonitas/estilos
//     ssweb     → captura de pantalla de una página web
//     timezone  → hora actual de un país
//     translate → traduce texto a otro idioma
//     tweetss   → captura de un tweet (X)
//     weather   → clima de un país/ciudad
//     yt        → información/búsqueda de YouTube
//     wainfo    → información de un grupo de WhatsApp por su enlace
// ═══════════════════════════════════════════════════════════════════

const { textCommand, mediaCommand, usageMsg } = require('../../lib/commands')
const { akari, pickAnswer, isApiError, formatResult, unwrap } = require('../../lib/akari')
const config = require('../../config')

module.exports = [

  // ── 🔠 Letras bonitas ──
  textCommand('font', '/api/tools/font', {
    param: 'text', paramName: '<texto>', tag: 'herramientas',
    desc: 'Convierte tu texto a estilos bonitos',
    ej: 'Hola mundo',
    alias: ['fonts', 'letras', 'estilo']
  }),

  // ── 📸 Captura de pantalla web ──
  mediaCommand('ssweb', '/api/tools/ssweb', {
    param: 'url', prefer: 'image', tag: 'herramientas',
    desc: 'Captura de pantalla de una web',
    ej: 'https://google.com',
    alias: ['screenshot', 'capweb']
  }),

  // ── 🕐 Hora de un país ──
  textCommand('timezone', '/api/tools/timezone', {
    param: 'country', paramName: '<país>', tag: 'herramientas',
    desc: 'Hora actual de un país',
    ej: 'Mexico',
    alias: ['hora', 'time']
  }),

  // ── 🌐 Traductor ──
  // Uso: .translate <idioma> <texto>   — ej: .translate en Hola, ¿cómo estás?
  (() => {
    let h = async (m, { args, usedPrefix, command }) => {
      const to = args[0] || ''
      let text = args.slice(1).join(' ')
      if (!text && m.quoted?.text) text = m.quoted.text

      if (!/^[a-zA-Z-]{2,8}$/.test(to) || !text) {
        return m.reply(
          `❌ *Uso:* \`${usedPrefix}${command} <idioma> <texto>\`\n` +
          `▸ *Ejemplo:* \`${usedPrefix}${command} en Hola, ¿cómo estás?\`\n` +
          `▸ _También puedes citar un mensaje:_ \`${usedPrefix}${command} en\`\n\n` +
          `Idiomas comunes: es (español), en (inglés), pt (portugués), fr (francés), id (indonesio), ja (japonés)`
        )
      }
      await m.react('⏳')

      const res = await akari('/api/tools/translate', { text, to })
      if (res.type !== 'json') return m.reply(config.mess.apiError)
      const json = res.data
      if (isApiError(json)) {
        return m.reply(`❌ *Error de la API:* ${json.error || json.message}`)
      }
      await m.reply(`🌐 *Traducción (${to}):*\n\n${pickAnswer(json)}`)
      await m.react('✅')
    }
    h.help = ['translate <idioma> <texto>']
    h.tags = ['herramientas']
    h.desc = 'Traduce texto a otro idioma'
    h.command = ['translate', 'traducir', 'tr']
    return h
  })(),

  // ── 🐦 Captura de tweet ──
  mediaCommand('tweetss', '/api/tools/tweetss', {
    param: 'url', prefer: 'image', tag: 'herramientas',
    desc: 'Captura falsa de un tweet',
    ej: 'https://x.com/usuario/status/123456',
    alias: ['tweet']
  }),

  // ── ⛅ Clima ──
  textCommand('weather', '/api/tools/weather', {
    param: 'country', paramName: '<país/ciudad>', tag: 'herramientas',
    desc: 'Clima de un país o ciudad',
    ej: 'Argentina',
    alias: ['clima', 'tiempo']
  }),

  // ── ▶️ YouTube (info del endpoint /api/tools/youtube) ──
  // La API pide el parámetro "url". Si pasas un enlace de YouTube
  // devuelve información del video/canal.
  mediaCommand('yt', '/api/tools/youtube', {
    param: 'url', prefer: 'image', tag: 'herramientas',
    desc: 'Información de YouTube',
    ej: 'https://youtu.be/dQw4w9WgXcQ',
    alias: ['ytinfo', 'youtube']
  }),

  // ── 💬 Info de grupo de WhatsApp por enlace ──
  (() => {
    let h = async (m, { conn, text, usedPrefix, command }) => {
      const url = (text || m.quoted?.text || '').match(/https?:\/\/[^\s"'<>]+/)?.[0]
      if (!url || !url.includes('chat.whatsapp.com')) {
        return m.reply(usageMsg(usedPrefix, command, '<enlace del grupo>', 'https://chat.whatsapp.com/ABC123'))
      }
      await m.react('⏳')
      const res = await akari('/api/tools/whatsapp', { url })
      const ok = await sendResult(conn, m, res, { prefer: 'image', title: 'Grupo de WhatsApp' })
      await m.react(ok ? '✅' : '❌')
    }
    h.help = ['wainfo <enlace de grupo>']
    h.tags = ['herramientas']
    h.desc = 'Info de un grupo de WhatsApp por enlace'
    h.command = ['wainfo', 'wagroup', 'grupoinfo']
    return h
  })()
]
