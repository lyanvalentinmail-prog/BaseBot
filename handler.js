// ═══════════════════════════════════════════════════════════════════
//   🧠 HANDLER — cerebro del bot
//   ─────────────────────────────────────────────────────────────────
//   Recibe cada mensaje de WhatsApp y:
//     1. Lo convierte en un objeto "m" fácil de usar (serialize).
//     2. Detecta el prefijo y el comando.
//     3. Verifica permisos (dueño, grupo, admin…).
//     4. Ejecuta el plugin correspondiente.
//
//   👉 Normalmente NO necesitas editar este archivo.
// ═══════════════════════════════════════════════════════════════════

const config = require('./config')
const { serialize } = require('./lib/serialize')

module.exports = async function handler(conn, raw) {
  // 1️⃣ Serializar el mensaje
  const m = serialize(conn, raw)
  if (!m || !m.body) return
  if (m.chat === 'status@broadcast') return          // ignorar estados

  // 2️⃣ Detectar prefijo
  const prefixes = Array.isArray(config.prefix) ? config.prefix : [config.prefix]
  const usedPrefix = prefixes.find(p => p && m.body.startsWith(p))
  if (!usedPrefix) return

  // 3️⃣ Separar comando y argumentos
  const [cmdRaw, ...args] = m.body.slice(usedPrefix.length).trim().split(/\s+/)
  if (!cmdRaw) return
  const command = cmdRaw.toLowerCase()
  const text = args.join(' ')
  m.command = command

  // 4️⃣ ¿Es el dueño?
  const owners = (Array.isArray(config.owner) ? config.owner : [config.owner])
    .map(n => String(n).replace(/\D/g, ''))
  const isOwner = m.fromMe || owners.includes(m.senderNumber)

  // 5️⃣ Modo "self": solo el dueño usa el bot
  if (config.self && !isOwner) return

  // 6️⃣ Marcar como leído (opcional)
  if (config.autoRead) conn.readMessages([m.key]).catch(() => {})

  // 7️⃣ Datos del grupo (si aplica)
  let groupMetadata = null
  let isAdmin = false
  let isBotAdmin = false
  if (m.isGroup) {
    try {
      groupMetadata = await conn.groupMetadata(m.chat)
      const botNumber = conn.user.id.split(':')[0]
      const admins = groupMetadata.participants
        .filter(p => p.admin)
        .flatMap(p => [p.id, p.phoneNumber].filter(Boolean))
        .map(id => id.split('@')[0].split(':')[0])
      isAdmin = admins.includes(m.senderNumber)
      isBotAdmin = admins.includes(botNumber)
    } catch {}
  }
  if (isOwner) isAdmin = true   // el dueño siempre cuenta como admin

  // 8️⃣ Buscar y ejecutar el plugin
  const ctx = {
    conn, args, text, command, usedPrefix,
    isOwner, isAdmin, isBotAdmin,
    groupMetadata,
    participants: groupMetadata?.participants || []
  }

  for (const file of Object.keys(global.plugins || {})) {
    const plugin = global.plugins[file]
    // .flat(Infinity) acepta exports de un objeto, un array, o arrays anidados
    const list = [plugin].flat(Infinity)

    for (const p of list) {
      if (!p || !p.command) continue
      const cmds = Array.isArray(p.command) ? p.command : [p.command]
      const match = cmds.some(c => (c instanceof RegExp ? c.test(command) : c === command))
      if (!match) continue

      // ── Restricciones del comando ──
      if (p.rowner && !isOwner) return m.reply(config.mess.owner)
      if (p.group && !m.isGroup) return m.reply(config.mess.group)
      if (p.admin && !isAdmin) return m.reply(config.mess.admin)
      if (p.botAdmin && !isBotAdmin) return m.reply(config.mess.botAdmin)

      // ── Ejecutar ──
      try {
        await p(m, ctx)
      } catch (e) {
        console.error(`❌ Error en el comando "${command}":`, e)
        let msg = config.mess.error
        if (config.showErrors) msg += `\n\n\`\`\`${String(e?.message || e).slice(0, 500)}\`\`\``
        await m.reply(msg).catch(() => {})
        await m.react('❌').catch(() => {})
      }
      return
    }
  }

  // 9️⃣ Comando no encontrado (opcional)
  if (config.replyUnknown) {
    await m.reply(`❓ El comando *${command}* no existe.\nEscribe *${usedPrefix}menu* para ver la lista de comandos.`)
  }
}
