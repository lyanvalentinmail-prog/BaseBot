// ═══════════════════════════════════════════════════════════════════
//   🎨 CREADORES (MAKER)
//   ─────────────────────────────────────────────────────────────────
//   Comandos de la sección /api/maker de la API Akari:
//
//     brat     → genera la típica imagen verde "brat" con tu texto
//     fakenote → nota falsa estilo iPhone con nombre + mensaje + avatar
//     iqc      → imagen estilo "notificación/burbuja" a partir de una foto
//
//   Los dos últimos aceptan imagen CITADA (el bot la sube a internet).
// ═══════════════════════════════════════════════════════════════════

const { mediaCommand, usageMsg } = require('../../lib/commands')
const { akari, sendResult } = require('../../lib/akari')
const { uploadBuffer } = require('../../lib/upload')
const config = require('../../config')

module.exports = [

  // ── 🟩 BRAT ──
  mediaCommand('brat', '/api/maker/brat', {
    param: 'text', paramName: '<texto>', prefer: 'image', tag: 'maker',
    desc: 'Imagen estilo "brat"',
    ej: 'hola mundo'
  }),

  // ── 📝 FAKE NOTE ──
  // Uso: .fakenote nombre|mensaje        (citando una foto opcionalmente)
  //      .fakenote nombre|mensaje|https://url-del-avatar.jpg
  (() => {
    let h = async (m, { conn, text, usedPrefix, command }) => {
      const parts = (text || '').split('|').map(s => s.trim())
      const [name, message] = parts
      let avatar = parts[2]?.match(/https?:\/\/[^\s"'<>]+/)?.[0] || null

      if (!name || !message) {
        return m.reply(
          `❌ *Uso:* \`${usedPrefix}${command} nombre|mensaje\`\n` +
          `▸ *Ejemplo:* \`${usedPrefix}${command} Leonel|Hola, ¿qué haces?\`\n` +
          `▸ Puedes citar una imagen para usarla como avatar, o agregar |url-avatar`
        )
      }
      await m.react('⏳')

      // Si citó una imagen → usarla como avatar
      if (!avatar && m.quoted?.isMedia && /image/.test(m.quoted.mime || '')) {
        try {
          await m.reply('☁️ *Subiendo el avatar…*')
          const buffer = await m.download()
          avatar = await uploadBuffer(buffer, 'avatar.jpg')
        } catch (e) {
          console.error('Error subiendo avatar:', e.message)
        }
      }

      const params = { name, message }
      if (avatar) params.avatar = avatar

      const res = await akari('/api/maker/fake-note', params)
      const ok = await sendResult(conn, m, res, { prefer: 'image', title: 'Nota falsa' })
      await m.react(ok ? '✅' : '❌')
    }
    h.help = ['fakenote <nombre|mensaje>']
    h.tags = ['maker']
    h.desc = 'Nota falsa estilo iPhone'
    h.command = ['fakenote', 'notafalsa']
    return h
  })(),

  // ── 📱 IQC ──
  // Uso: .iqc <url-de-imagen>   o   citando una imagen
  (() => {
    let h = async (m, { conn, text, usedPrefix, command }) => {
      let imageUrl = text?.match(/https?:\/\/[^\s"'<>]+/)?.[0] || null

      if (!imageUrl) {
        if (!m.quoted?.isMedia || !/image/.test(m.quoted.mime || '')) {
          return m.reply(usageMsg(usedPrefix, command, '<url> | cita una imagen', 'https://i.imgur.com/foto.jpg'))
        }
        await m.react('⏳')
        await m.reply('☁️ *Subiendo la imagen…*')
        try {
          const buffer = await m.download()
          imageUrl = await uploadBuffer(buffer, 'imagen.jpg')
        } catch (e) {
          await m.react('❌')
          return m.reply(`❌ No se pudo subir la imagen:\n\`\`\`${e.message}\`\`\``)
        }
      } else {
        await m.react('⏳')
      }

      const res = await akari('/api/maker/iqc', { image: imageUrl })
      const ok = await sendResult(conn, m, res, { prefer: 'image', title: 'IQC' })
      await m.react(ok ? '✅' : '❌')
    }
    h.help = ['iqc <url | imagen citada>']
    h.tags = ['maker']
    h.desc = 'Imagen estilo burbuja de iPhone'
    h.command = ['iqc']
    return h
  })()
]
