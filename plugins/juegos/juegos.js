// ═══════════════════════════════════════════════════════════════════
//   🎮 JUEGOS
//   ─────────────────────────────────────────────────────────────────
//   Estos comandos NO usan la API: funcionan 100% con Node.js y
//   Baileys. Son el ejemplo perfecto de cómo crear comandos propios.
//
//   Fíjate en las técnicas que usan:
//     • Números aleatorios (Math.random)
//     • Menciones (@usuario) con "mentions"
//     • Datos del grupo (participants)
//     • Validar texto del usuario
// ═══════════════════════════════════════════════════════════════════

module.exports = [

  // ── 🎲 DADO ──
  (() => {
    let h = async (m) => {
      const n = Math.floor(Math.random() * 6) + 1
      const caras = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
      await m.reply(`🎲 El dado cayó en: *${n}* ${caras[n - 1]}`)
    }
    h.help = ['dado']
    h.tags = ['juegos']
    h.command = ['dado', 'dice']
    return h
  })(),

  // ── 🪙 MONEDA (cara o cruz) ──
  (() => {
    let h = async (m) => {
      const resultado = Math.random() < 0.5 ? 'CARA 🌝' : 'CRUZ 🌚'
      await m.reply(`🪙 La moneda cayó en: *${resultado}*`)
    }
    h.help = ['moneda']
    h.tags = ['juegos']
    h.command = ['moneda', 'coin', 'caracruz']
    return h
  })(),

  // ── 🍀 SUERTE (tuya, de quien menciones o cites) ──
  (() => {
    let h = async (m) => {
      const who = m.mentionedJid[0] || m.quoted?.sender || m.sender
      const suerte = Math.floor(Math.random() * 101)
      await m.reply(`🍀 La suerte de @${who.split('@')[0]} hoy es de *${suerte}%*`, { mentions: [who] })
    }
    h.help = ['suerte <@usuario>']
    h.tags = ['juegos']
    h.command = ['suerte', 'luck']
    return h
  })(),

  // ── ✊✋✌️ PIEDRA, PAPEL O TIJERA (contra el bot) ──
  (() => {
    const opciones = ['piedra', 'papel', 'tijera']
    const emojis = { piedra: '🪨', papel: '📄', tijera: '✂️' }
    let h = async (m, { text }) => {
      const you = (text || '').toLowerCase().trim()
      if (!opciones.includes(you)) {
        return m.reply('🎮 *Piedra, Papel o Tijera*\n\n❌ Uso: `.ppt piedra` · `.ppt papel` · `.ppt tijera`')
      }
      const bot = opciones[Math.floor(Math.random() * opciones.length)]
      let resultado
      if (you === bot) {
        resultado = '😅 ¡*EMPATE!*'
      } else if (
        (you === 'piedra' && bot === 'tijera') ||
        (you === 'papel' && bot === 'piedra') ||
        (you === 'tijera' && bot === 'papel')
      ) {
        resultado = '🎉 ¡*GANASTE!*'
      } else {
        resultado = '😎 ¡*PERDISTE!* Yo gano.'
      }
      await m.reply(
        `🎮 *Piedra, Papel o Tijera*\n\n` +
        `▸ Tú: ${emojis[you]} ${you}\n` +
        `▸ Bot: ${emojis[bot]} ${bot}\n\n` +
        resultado
      )
    }
    h.help = ['ppt <piedra/papel/tijera>']
    h.tags = ['juegos']
    h.command = ['ppt', 'rps']
    return h
  })(),

  // ── 💕 SHIP / COMPATIBILIDAD ──
  //   .ship @a @b   ·   .ship @a (contigo)   ·   .ship (2 del azar en grupo)
  (() => {
    let h = async (m, { participants }) => {
      let a, b
      const men = m.mentionedJid.filter(u => u !== m.sender)

      if (m.mentionedJid.length >= 2) [a, b] = m.mentionedJid
      else if (men.length === 1) { [a] = men; b = m.sender }
      else if (m.quoted) { a = m.quoted.sender; b = m.sender }
      else if (m.isGroup && participants.length >= 2) {
        const shuffled = [...participants].sort(() => Math.random() - 0.5)
        a = shuffled[0].id
        b = shuffled[1].id
      } else {
        return m.reply('❌ Uso: `.ship @usuario1 @usuario2` (o menciona a 1 persona, o úsalo en un grupo para elegir 2 al azar)')
      }

      const porcentaje = Math.floor(Math.random() * 101)
      const corazones = Math.round(porcentaje / 10)
      const barra = '❤️'.repeat(corazones) + '🖤'.repeat(10 - corazones)
      const frase =
        porcentaje > 80 ? '¡Pareja perfecta! 💍' :
        porcentaje > 60 ? 'Hay mucha química 😳' :
        porcentaje > 40 ? 'Podría funcionar… 🤔' :
        porcentaje > 20 ? 'Mejor solo amigos 😅' : 'No hay futuro ahí 💀'

      await m.reply(
        `💕 *Test de compatibilidad*\n\n` +
        `@${a.split('@')[0]}  ✚  @${b.split('@')[0]}\n\n` +
        `${barra}  *${porcentaje}%*\n\n` +
        `_${frase}_`,
        { mentions: [a, b] }
      )
    }
    h.help = ['ship <@usuario1> <@usuario2>']
    h.tags = ['juegos']
    h.command = ['ship', 'pareja', 'compatibilidad']
    return h
  })(),

  // ── 🏆 TOP 5 (al azar entre miembros del grupo) ──
  (() => {
    const medallas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
    let h = async (m, { text, participants }) => {
      if (!text) return m.reply('❌ Uso: `.top <tema>`\n▸ Ejemplo: `.top bellos`')
      const elegidos = [...participants].sort(() => Math.random() - 0.5).slice(0, 5)
      const lista = elegidos.map((p, i) => `${medallas[i]} @${p.id.split('@')[0]}`).join('\n')
      await m.reply(
        `🏆 *TOP 5 — ${text.toUpperCase()}* 🏆\n\n${lista}`,
        { mentions: elegidos.map(p => p.id) }
      )
    }
    h.help = ['top <tema>']
    h.tags = ['juegos']
    h.command = ['top', 'top5']
    h.group = true
    return h
  })()
]
