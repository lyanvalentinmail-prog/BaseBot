// ═══════════════════════════════════════════════════════════════════
//   🖼️ IMÁGENES
//   ─────────────────────────────────────────────────────────────────
//   Comandos de la sección /api/image de la API Akari.
//
//   • bluearchive, china, korea, vietnam → imágenes aleatorias
//     (no piden texto: mediaCommand con param: null)
//   • wallpaper → busca wallpapers por texto
//   • removebg  → quita el fondo de una imagen
//     (acepta URL o una imagen CITADA: el bot la sube por ti)
// ═══════════════════════════════════════════════════════════════════

const { mediaCommand, usageMsg } = require('../lib/commands')
const { akari, sendResult } = require('../lib/akari')
const { uploadBuffer } = require('../lib/upload')
const config = require('../config')

// Función reutilizable para comandos que aceptan URL o imagen citada
function urlOrUploadCommand(command, endpoint, { desc, ej, alias = [] }) {
  let h = async (m, { conn, text, usedPrefix, command: cmd }) => {
    let imageUrl = text?.match(/https?:\/\/[^\s"'<>]+/)?.[0] || null

    // Si no hay URL pero citó una imagen → la descargamos y la subimos
    if (!imageUrl) {
      if (!m.quoted?.isMedia || !/image/.test(m.quoted.mime || '')) {
        return m.reply(usageMsg(usedPrefix, cmd, '<url> | cita una imagen', ej))
      }
      await m.react('⏳')
      await m.reply('☁️ *Subiendo la imagen…* (esto tarda unos segundos)')
      try {
        const buffer = await m.download()
        imageUrl = await uploadBuffer(buffer, 'imagen.jpg')
      } catch (e) {
        await m.react('❌')
        return m.reply(`❌ No se pudo subir la imagen:\n\`\`\`${e.message}\`\`\`\n\nTambién puedes usar: \`${usedPrefix}${cmd} ${ej}\``)
      }
    } else {
      await m.react('⏳')
    }

    const res = await akari(endpoint, { url: imageUrl })
    const ok = await sendResult(conn, m, res, { prefer: 'image', title: desc })
    await m.react(ok ? '✅' : '❌')
  }
  h.help = [`${command} <url | imagen citada>`]
  h.tags = ['imagen']
  h.desc = desc
  h.command = [command, ...alias]
  return h
}

module.exports = [

  // ── 🎲 Imágenes aleatorias (no piden texto) ──
  mediaCommand('bluearchive', '/api/image/blue-archive', {
    param: null, prefer: 'image', tag: 'imagen',
    desc: 'Imagen random de Blue Archive'
  }),
  mediaCommand('china', '/api/image/china', {
    param: null, prefer: 'image', tag: 'imagen',
    desc: 'Imagen random estilo China'
  }),
  mediaCommand('korea', '/api/image/korea', {
    param: null, prefer: 'image', tag: 'imagen',
    desc: 'Imagen random estilo Corea'
  }),
  mediaCommand('vietnam', '/api/image/vietnam', {
    param: null, prefer: 'image', tag: 'imagen',
    desc: 'Imagen random estilo Vietnam'
  }),

  // ── 🌆 Wallpapers por búsqueda ──
  mediaCommand('wallpaper', '/api/image/wallpaper', {
    param: 'query', paramName: '<búsqueda>', prefer: 'image', tag: 'imagen',
    desc: 'Busca wallpapers',
    ej: 'Goku',
    alias: ['wp', 'fondo']
  }),

  // ── ✂️ Quitar fondo (URL o imagen citada) ──
  urlOrUploadCommand('removebg', '/api/image/removebg', {
    desc: 'Imagen sin fondo',
    ej: 'https://i.imgur.com/foto.jpg',
    alias: ['nobg', 'sinfondo', 'rb']
  })
]
