// ═══════════════════════════════════════════════════════════════════
//   📥 DESCARGAS
//   ─────────────────────────────────────────────────────────────────
//   Todos los comandos de descarga de la API Akari.
//
//   mediaCommand('comando', '/api/endpoint', opciones)
//
//   Opciones:
//     param   → qué parámetro pide la API ('url', 'query', 'pkg', 'id')
//     prefer  → tipo de archivo preferido: 'video' | 'audio' | 'image' | 'document'
//     alias   → otros nombres para el mismo comando
//     ej      → ejemplo que se muestra si el usuario no escribe nada
//
//   👉 PARA AGREGAR UN NUEVO DESCARGADOR copia una línea y edítala.
// ═══════════════════════════════════════════════════════════════════

const { mediaCommand, usageMsg } = require('../lib/commands')
const { akari, unwrap, isApiError, mediaList, formatResult } = require('../lib/akari')
const config = require('../config')

module.exports = [

  // ── 🎵 Redes sociales (video) ──────────────────────────────
  mediaCommand('tiktok', '/api/downloader/tiktok', {
    param: 'url', prefer: 'video', alias: ['tt', 'tiktokdl'],
    desc: 'TikTok',
    ej: 'https://www.tiktok.com/@usuario/video/123456'
  }),
  mediaCommand('facebook', '/api/downloader/facebook', {
    param: 'url', prefer: 'video', alias: ['fb', 'fbdl'],
    desc: 'Facebook',
    ej: 'https://www.facebook.com/watch/?v=123456'
  }),
  mediaCommand('instagram', '/api/downloader/instagram', {
    param: 'url', prefer: 'video', alias: ['ig', 'igdl'],
    desc: 'Instagram',
    ej: 'https://www.instagram.com/reel/ABC123'
  }),
  mediaCommand('x', '/api/downloader/x', {
    param: 'url', prefer: 'video', alias: ['twitter', 'tw'],
    desc: 'X (Twitter)',
    ej: 'https://x.com/usuario/status/123456'
  }),
  mediaCommand('threads', '/api/downloader/threads', {
    param: 'url', prefer: 'video', alias: ['threadsdl'],
    desc: 'Threads',
    ej: 'https://www.threads.net/@usuario/post/ABC123'
  }),
  mediaCommand('pinterestdl', '/api/downloader/pinterest', {
    param: 'url', prefer: 'video', alias: ['pindl'],
    desc: 'Pinterest',
    ej: 'https://pin.it/ABC123'
  }),

  // ── 🎧 Música ──────────────────────────────────────────────
  mediaCommand('spotifydl', '/api/downloader/spotify', {
    param: 'url', prefer: 'audio', alias: ['spdl'],
    desc: 'Spotify (música)',
    ej: 'https://open.spotify.com/track/ABC123'
  }),

  // ── ▶️ YouTube ─────────────────────────────────────────────
  mediaCommand('ytmp3', '/api/downloader/ytmp3', {
    param: 'url', prefer: 'audio', alias: ['ytaudio', 'mp3'],
    desc: 'YouTube → MP3',
    ej: 'https://youtu.be/dQw4w9WgXcQ'
  }),
  mediaCommand('ytmp4', '/api/downloader/ytmp4', {
    param: 'url', prefer: 'video', alias: ['ytvideo', 'mp4'],
    desc: 'YouTube → MP4',
    ej: 'https://youtu.be/dQw4w9WgXcQ'
  }),

  // ── 📦 Archivos / Apps ─────────────────────────────────────
  mediaCommand('gdrive', '/api/downloader/gdrive', {
    param: 'url', prefer: 'document', alias: ['gdrivedl'],
    desc: 'Google Drive',
    ej: 'https://drive.google.com/file/d/ABC123/view'
  }),
  mediaCommand('terabox', '/api/downloader/terabox', {
    param: 'url', prefer: 'video', alias: ['tera'],
    desc: 'Terabox',
    ej: 'https://terabox.com/s/ABC123'
  }),
  mediaCommand('apkpure', '/api/downloader/apkpure', {
    param: 'pkg', paramName: '<paquete>', prefer: 'document',
    desc: 'APK desde Apkpure',
    ej: 'com.whatsapp'
  }),
  mediaCommand('aptoidedl', '/api/downloader/aptoide', {
    param: 'id', paramName: '<id del paquete>', prefer: 'document',
    desc: 'APK desde Aptoide',
    ej: 'com.whatsapp'
  }),

  // ── 🎴 Stickers (comando especial: envía varios stickers) ──
  (() => {
    let h = async (m, { conn, text, usedPrefix, command }) => {
      const q = text || m.quoted?.text
      if (!q) return m.reply(usageMsg(usedPrefix, command, '<búsqueda>', 'gato'))
      await m.react('⏳')

      const res = await akari('/api/downloader/stickers', { query: q })
      if (res.type !== 'json') return m.reply(config.mess.apiError)
      if (isApiError(res.data)) {
        return m.reply(`❌ *Error de la API:* ${res.data.error || res.data.message}`)
      }

      const data = unwrap(res.data)
      // Buscar URLs de stickers (webp) o imágenes
      let urls = mediaList(data, ['sticker'])
      if (!urls.length) urls = mediaList(data, ['sticker', 'image'])
      urls = urls.slice(0, 5) // máximo 5 stickers por búsqueda

      if (!urls.length) {
        const info = formatResult(data)
        await m.react('❌')
        return m.reply(info ? `No encontré stickers enviables, pero esto respondió la API:\n\n${info}` : '❌ No encontré stickers con esa búsqueda.')
      }

      let enviados = 0
      for (const { url } of urls) {
        try {
          const buf = Buffer.from(await (await fetch(url, { signal: AbortSignal.timeout(30000) })).arrayBuffer())
          await conn.sendMessage(m.chat, { sticker: buf }, { quoted: enviados === 0 ? m.raw : undefined })
          enviados++
          await new Promise(r => setTimeout(r, 1200)) // pausa anti-spam
        } catch (e) {
          console.error('Error enviando sticker:', e.message)
        }
      }
      await m.react(enviados ? '✅' : '❌')
      if (!enviados) await m.reply('❌ No se pudieron enviar los stickers. Intenta más tarde.')
    }
    h.help = ['stickers <búsqueda>']
    h.tags = ['descargas']
    h.desc = 'Busca y envía stickers (máx. 5)'
    h.command = ['stickers', 'stickersearch', 'stickly']
    return h
  })()
]
