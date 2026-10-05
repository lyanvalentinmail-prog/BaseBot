// ═══════════════════════════════════════════════════════════════════
//   🧰 FÁBRICAS DE COMANDOS
//   ─────────────────────────────────────────────────────────────────
//   Estas funciones permiten crear comandos NUEVOS con UNA SOLA LÍNEA.
//   Son las que usan los archivos de la carpeta /plugins.
//
//   ┌─ aiCommand    → endpoints de IA (devuelven texto)
//   ├─ mediaCommand → endpoints que devuelven archivos o enlaces
//   │                 (descargas, imágenes, stickers, wallpapers…)
//   └─ textCommand  → endpoints que devuelven información en texto
//                     (clima, fuentes, stalk, letras, búsquedas…)
//
//   Ejemplo de comando nuevo:
//     mediaCommand('tiktok', '/api/downloader/tiktok', {
//       param: 'url', prefer: 'video',
//       ej: 'https://www.tiktok.com/@user/video/123'
//     })
// ═══════════════════════════════════════════════════════════════════

const config = require('../config')
const { akari, sendResult, pickAnswer } = require('./akari')

// Mensaje de ayuda cuando falta texto:  ❌ Uso: .tiktok <url> …
function usageMsg(usedPrefix, command, uso, ej) {
  let msg = `❌ *Uso:* \`${usedPrefix}${command} ${uso || ''}\``
  if (ej) msg += `\n▸ *Ejemplo:* \`${usedPrefix}${command} ${ej}\``
  return msg
}

// ─────────────────────────────────────────────────────────────────
// 🤖 Comando de IA  (texto → texto)
//    aiCommand('gemini', '/api/ai/gemini')
// ─────────────────────────────────────────────────────────────────
function aiCommand(command, endpoint, { desc = '', alias = [], ej = '¿Quién eres?' } = {}) {
  const h = async (m, { conn, text, usedPrefix, command: cmd }) => {
    const q = text || m.quoted?.text
    if (!q) return m.reply(usageMsg(usedPrefix, cmd, '<texto>', ej))
    await m.react('⏳')

    const res = await akari(endpoint, { text: q })
    if (res.type !== 'json') return m.reply(config.mess.apiError)
    const json = res.data
    if (json.status === false || json.success === false) {
      return m.reply(`❌ *Error de la API:* ${json.error || json.message || 'desconocido'}`)
    }
    const answer = pickAnswer(json)
    await m.reply(`🤖 *${cmd.toUpperCase()}:*\n\n${answer}`)
    await m.react('✅')
  }
  h.help = [`${command} <texto>`]
  h.tags = ['ia']
  h.desc = desc
  h.command = [command, ...alias]
  return h
}

// ─────────────────────────────────────────────────────────────────
// 📥 Comando de descargas / multimedia
//    mediaCommand('tiktok', '/api/downloader/tiktok', { param: 'url' })
//
//    Opciones:
//      param   → nombre del parámetro que pide la API ('url', 'query'…)
//                Si es null, el comando no pide texto (imágenes random)
//      paramName → cómo se muestra en la ayuda ('<url>', '<búsqueda>'…)
//      prefer  → 'video' | 'audio' | 'image' | 'document' | 'sticker'
// ─────────────────────────────────────────────────────────────────
function mediaCommand(command, endpoint, {
  param = null, paramName, prefer = null, desc = '', alias = [],
  tag = 'descargas', ej = '', docName = null
} = {}) {
  const h = async (m, { conn, text, usedPrefix, command: cmd }) => {
    let value = null

    if (param) {
      const input = text || m.quoted?.text || ''
      if (!input) return m.reply(usageMsg(usedPrefix, cmd, paramName || `<${param}>`, ej))
      // Si el usuario pegó una URL entre texto, extraemos solo la URL
      const urlMatch = input.match(/https?:\/\/[^\s"'<>]+/)
      value = urlMatch ? urlMatch[0] : input
    }

    await m.react('⏳')
    const res = await akari(endpoint, param ? { [param]: value } : {})
    const ok = await sendResult(conn, m, res, { prefer, title: desc, docName: docName || command })
    await m.react(ok ? '✅' : '❌')
  }
  h.help = [`${command}${param ? ' ' + (paramName || `<${param}>`) : ''}`]
  h.tags = [tag]
  h.desc = desc
  h.command = [command, ...alias]
  return h
}

// ─────────────────────────────────────────────────────────────────
// 📄 Comando de texto / información
//    textCommand('weather', '/api/tools/weather', { param: 'country' })
// ─────────────────────────────────────────────────────────────────
function textCommand(command, endpoint, {
  param = 'query', paramName, desc = '', alias = [],
  tag = 'herramientas', ej = '', title = null
} = {}) {
  const h = async (m, { conn, text, usedPrefix, command: cmd }) => {
    const q = text || m.quoted?.text
    if (!q) return m.reply(usageMsg(usedPrefix, cmd, paramName || `<${param}>`, ej))
    await m.react('⏳')

    const res = await akari(endpoint, { [param]: q })
    const ok = await sendResult(conn, m, res, { title: title ?? undefined })
    await m.react(ok ? '✅' : '❌')
  }
  h.help = [`${command} ${paramName || `<${param}>`}`]
  h.tags = [tag]
  h.desc = desc
  h.command = [command, ...alias]
  return h
}

module.exports = { aiCommand, mediaCommand, textCommand, usageMsg }
