// ═══════════════════════════════════════════════════════════════════
//   🏠 COMANDOS PRINCIPALES
//   ─────────────────────────────────────────────────────────────────
//   Aquí ves cómo se escribe un comando MANUAL (sin fábricas):
//
//   let h = async (m, { conn, text, args, command, usedPrefix }) => { … }
//   h.help = ['menu']          → cómo aparece en el menú
//   h.tags = ['principal']     → categoría del menú
//   h.command = ['menu']       → palabras que activan el comando
//   module.exports = h (o un array de varios)
//
//   Opciones extra disponibles:
//     h.rowner = true   → solo el dueño
//     h.group = true    → solo en grupos
//     h.admin = true    → solo admins del grupo
//     h.botAdmin = true → el bot debe ser admin
// ═══════════════════════════════════════════════════════════════════

const config = require('../config')
const { akari, pickAnswer } = require('../lib/akari')

// ⏱️ Función para mostrar el tiempo activo
function uptime() {
  const s = Math.floor(process.uptime())
  const h = Math.floor(s / 3600)
  const mi = Math.floor((s % 3600) / 60)
  const se = s % 60
  return `${h}h ${mi}m ${se}s`
}

// Nombres "bonitos" para las categorías del menú
const TAG_NAMES = {
  principal: '🏠 Principal',
  ia: '🤖 Inteligencia Artificial',
  descargas: '📥 Descargas',
  imagen: '🖼️ Imágenes',
  maker: '🎨 Creadores',
  busqueda: '🔍 Búsquedas',
  stalk: '👤 Stalk',
  herramientas: '🛠️ Herramientas',
  grupo: '👥 Grupo'
}

// ─────────────────────────────────────────────
// 📜 MENÚ — se genera SOLO a partir de los plugins
// ─────────────────────────────────────────────
let menu = async (m, { conn, usedPrefix }) => {
  const firstPrefix = Array.isArray(config.prefix) ? config.prefix[0] : config.prefix

  // Recolectar comandos de todos los plugins
  const byTag = {}
  let total = 0
  for (const plugin of Object.values(global.plugins || {})) {
    for (const p of (Array.isArray(plugin) ? plugin : [plugin])) {
      if (!p?.help?.length || !p?.tags?.length) continue
      const tag = p.tags[0]
      if (!byTag[tag]) byTag[tag] = []
      byTag[tag].push(p.help[0])
      total += (Array.isArray(p.command) ? p.command : [p.command]).length
    }
  }

  let text = `╭═══ ≪ *${config.botName}* ≫ ═══╮
│
│ 👤 *Hola:* ${m.pushName}
│ ⏱️ *Activo:* ${uptime()}
│ 📚 *Comandos:* ${total}
│ 🔑 *Prefijo:* ${(Array.isArray(config.prefix) ? config.prefix.join(' ') : config.prefix)}
│ 👑 *Creador:* ${config.ownerName}
│ 🌙 *API:* Akari
│
╰═══════════════════╯`

  // Ordenar categorías según TAG_NAMES y luego las demás
  const orderedTags = [
    ...Object.keys(TAG_NAMES).filter(t => byTag[t]),
    ...Object.keys(byTag).filter(t => !TAG_NAMES[t])
  ]

  for (const tag of orderedTags) {
    const title = TAG_NAMES[tag] || `✨ ${tag}`
    const lines = byTag[tag].sort().map(h => `│ ◦ ${firstPrefix}${h}`)
    text += `\n\n╭─「 ${title} 」\n${lines.join('\n')}\n╰──────────────`
  }

  text += `\n\n> ${config.wm}`
  await m.reply(text)
}
menu.help = ['menu']
menu.tags = ['principal']
menu.command = ['menu', 'help', 'ayuda', 'comandos']

// ─────────────────────────────────────────────
// 🏓 PING — velocidad de respuesta
// ─────────────────────────────────────────────
let ping = async (m, { conn }) => {
  const start = Date.now()
  const latency = start - (Number(m.messageTimestamp) * 1000)
  const sent = await m.reply('🏓 *Pong!*')
  await conn.sendMessage(m.chat, {
    text: `🏓 *Pong!*\n▸ 📶 Velocidad: *${Math.max(latency, 0)} ms*\n▸ ⏱️ Activo: *${uptime()}*`,
    edit: sent.key
  }).catch(() => {})
}
ping.help = ['ping']
ping.tags = ['principal']
ping.command = ['ping', 'speed']

// ─────────────────────────────────────────────
// ⏱️ UPTIME — tiempo activo del bot
// ─────────────────────────────────────────────
let runtime = async (m) => {
  await m.reply(`⏱️ *Tiempo activo:* ${uptime()}`)
}
runtime.help = ['uptime']
runtime.tags = ['principal']
runtime.command = ['uptime', 'runtime']

// ─────────────────────────────────────────────
// 👑 OWNER — contacto del creador
// ─────────────────────────────────────────────
let owner = async (m, { conn }) => {
  const num = (Array.isArray(config.owner) ? config.owner[0] : config.owner) || '0'
  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${config.ownerName}\nTEL;waid=${num}:${num}\nEND:VCARD`
  await conn.sendMessage(m.chat, {
    contacts: { displayName: config.ownerName, contacts: [{ vcard }] }
  }, { quoted: m.raw })
}
owner.help = ['owner']
owner.tags = ['principal']
owner.command = ['owner', 'creador', 'dueño']

// ─────────────────────────────────────────────
// 🆔 ID — muestra los IDs del chat (útil para depurar)
// ─────────────────────────────────────────────
let id = async (m) => {
  await m.reply(`🆔 *IDs de este chat:*\n\n▸ *Chat:* \`${m.chat}\`\n▸ *Tu ID:* \`${m.sender}\`${m.isGroup ? '\n▸ *Es grupo:* Sí' : ''}`)
}
id.help = ['id']
id.tags = ['principal']
id.command = ['id', 'cekid']

// ─────────────────────────────────────────────
// 🌙 APITEST — verifica que tu API key funciona
// ─────────────────────────────────────────────
let apitest = async (m) => {
  await m.react('⏳')
  try {
    const res = await akari('/api/ai/gemini', { text: 'Di solo: ok' })
    const json = res.type === 'json' ? res.data : null
    if (json && (json.status === true || json.success === true)) {
      await m.reply(`✅ *API Akari conectada correctamente.*\n\n▸ *URL:* ${config.apiUrl}\n▸ *Key:* \`${config.apiKey}\`\n▸ *Respuesta:* ${pickAnswer(json).slice(0, 100)}`)
    } else {
      await m.reply(`⚠️ *La API respondió con error:*\n${json?.error || json?.message || 'respuesta inesperada'}\n\nRevisa tu API key en config.js`)
    }
    await m.react('✅')
  } catch (e) {
    await m.reply(`❌ *No se pudo conectar con la API:*\n\`\`\`${e.message}\`\`\``)
    await m.react('❌')
  }
}
apitest.help = ['apitest']
apitest.tags = ['principal']
apitest.command = ['apitest', 'apistatus']

// ⭐ Un archivo puede exportar UN comando o UN ARRAY de comandos:
module.exports = [menu, ping, runtime, owner, id, apitest]
