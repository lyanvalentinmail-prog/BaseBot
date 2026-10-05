// ═══════════════════════════════════════════════════════════════════
//   👥 COMANDOS DE GRUPO
//   ─────────────────────────────────────────────────────────────────
//   Estos comandos NO usan la API: usan funciones propias de WhatsApp
//   a través de Baileys. Sirven como ejemplo de todo lo que puedes
//   programar con el bot en grupos.
//
//   Restricciones usadas:
//     h.group = true    → solo funciona en grupos
//     h.admin = true    → solo admins del grupo (el dueño siempre puede)
//     h.botAdmin = true → el bot necesita ser admin
// ═══════════════════════════════════════════════════════════════════

module.exports = [

  // ── 📢 HIDETAG — menciona a todos sin que salga la lista ──
  (() => {
    let h = async (m, { conn, text, groupMetadata }) => {
      const users = groupMetadata?.participants?.map(p => p.id) || []
      const message = text || m.quoted?.text || '📢 ¡Atención a todos!'
      await conn.sendMessage(m.chat, { text: message, mentions: users }, { quoted: m.raw })
    }
    h.help = ['hidetag <texto>']
    h.tags = ['grupo']
    h.command = ['hidetag', 'notify', 'tagall2']
    h.group = true
    h.admin = true
    return h
  })(),

  // ── 🔗 LINK — enlace de invitación del grupo ──
  (() => {
    let h = async (m, { conn }) => {
      const code = await conn.groupInviteCode(m.chat)
      await m.reply(`🔗 *Enlace del grupo:*\nhttps://chat.whatsapp.com/${code}`)
    }
    h.help = ['link']
    h.tags = ['grupo']
    h.command = ['link', 'grouplink', 'enlace']
    h.group = true
    h.botAdmin = true
    return h
  })(),

  // ── 👢 KICK — expulsar a alguien (mención o citando) ──
  (() => {
    let h = async (m, { conn }) => {
      const who = m.mentionedJid[0] || m.quoted?.sender
      if (!who) {
        return m.reply('❌ *Menciona* a la persona o *cita* su mensaje.\n▸ Ejemplo: `.kick @usuario`')
      }
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
      await m.reply(`✅ Usuario @${who.split('@')[0]} *expulsado* del grupo.`, {
        mentions: [who]
      }).catch(() => {})
    }
    h.help = ['kick <@usuario>']
    h.tags = ['grupo']
    h.command = ['kick', 'ban', 'expulsar', 'sacar']
    h.group = true
    h.admin = true
    h.botAdmin = true
    return h
  })(),

  // ── ⬆️ PROMOTE — dar admin ──
  (() => {
    let h = async (m, { conn }) => {
      const who = m.mentionedJid[0] || m.quoted?.sender
      if (!who) return m.reply('❌ *Menciona* a la persona o *cita* su mensaje.')
      await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
      await m.reply(`✅ @${who.split('@')[0]} ahora es *administrador*. 👑`, { mentions: [who] })
    }
    h.help = ['promote <@usuario>']
    h.tags = ['grupo']
    h.command = ['promote', 'daradmin']
    h.group = true
    h.admin = true
    h.botAdmin = true
    return h
  })(),

  // ── ⬇️ DEMOTE — quitar admin ──
  (() => {
    let h = async (m, { conn }) => {
      const who = m.mentionedJid[0] || m.quoted?.sender
      if (!who) return m.reply('❌ *Menciona* a la persona o *cita* su mensaje.')
      await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
      await m.reply(`✅ @${who.split('@')[0]} ya *no es administrador*.`, { mentions: [who] })
    }
    h.help = ['demote <@usuario>']
    h.tags = ['grupo']
    h.command = ['demote', 'quitaradmin']
    h.group = true
    h.admin = true
    h.botAdmin = true
    return h
  })()
]
