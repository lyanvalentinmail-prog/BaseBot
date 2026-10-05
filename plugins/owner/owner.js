// ═══════════════════════════════════════════════════════════════════
//   👑 COMANDOS DE OWNER (solo el dueño del bot)
//   ─────────────────────────────────────────────────────────────────
//   Todos usan  h.rowner = true  → solo funcionan si los escribe el
//   dueño (los números de config.owner o el propio bot).
//
//   ⚠️ Los cambios que hacen (.setprefix, .setbotname, .self, .public)
//      son EN MEMORIA: al reiniciar el bot vuelve lo de config.js.
//      Para hacerlos permanentes, edita config.js.
// ═══════════════════════════════════════════════════════════════════

const config = require('../../config')

module.exports = [

  // ── 🔒 MODO SELF (solo el dueño usa el bot) ──
  (() => {
    let h = async (m) => {
      config.self = true
      await m.reply('🔒 *Modo SELF activado.*\nAhora solo el dueño puede usar comandos.\n\n▸ Vuelve a público con: `.public`\n▸ Permanente: `self: true` en config.js')
    }
    h.help = ['self']
    h.tags = ['owner']
    h.command = ['self', 'privado']
    h.rowner = true
    return h
  })(),

  // ── 🌐 MODO PÚBLICO (todos usan el bot) ──
  (() => {
    let h = async (m) => {
      config.self = false
      await m.reply('🌐 *Modo PÚBLICO activado.*\nAhora cualquiera puede usar comandos.\n\n▸ Permanente: `self: false` en config.js')
    }
    h.help = ['public']
    h.tags = ['owner']
    h.command = ['public', 'publico']
    h.rowner = true
    return h
  })(),

  // ── 🔑 CAMBIAR PREFIJO (en memoria) ──
  (() => {
    let h = async (m, { text }) => {
      const p = (text || '').trim()
      if (!p || /\s/.test(p)) {
        return m.reply('❌ Uso: `.setprefix <nuevo>`\n▸ Ejemplo: `.setprefix !`\n_(sin espacios — puede ser uno o varios símbolos)_')
      }
      config.prefix = [p]
      await m.reply(`✅ Prefijo cambiado a: *${p}*\nAhora los comandos se usan así: \`${p}menu\`\n\n_Al reiniciar vuelve el de config.js_`)
    }
    h.help = ['setprefix <símbolo>']
    h.tags = ['owner']
    h.command = ['setprefix', 'cambiarprefijo']
    h.rowner = true
    return h
  })(),

  // ── ✏️ CAMBIAR NOMBRE DEL BOT (en memoria) ──
  (() => {
    let h = async (m, { text }) => {
      if (!text) return m.reply('❌ Uso: `.setbotname <nuevo nombre>`')
      config.botName = text
      await m.reply(`✅ Nombre del bot cambiado a: *${text}*\n\n_Al reiniciar vuelve el de config.js_`)
    }
    h.help = ['setbotname <nombre>']
    h.tags = ['owner']
    h.command = ['setbotname', 'setname', 'cambiarnombre']
    h.rowner = true
    return h
  })(),

  // ── 🧩 VER PLUGINS CARGADOS ──
  (() => {
    let h = async (m) => {
      const files = Object.keys(global.plugins || {})
      let total = 0
      for (const plugin of Object.values(global.plugins)) {
        for (const p of [plugin].flat(Infinity)) {
          if (p?.command) total += (Array.isArray(p.command) ? p.command : [p.command]).filter(c => typeof c === 'string').length
        }
      }
      const lista = files.sort().map(f => `▸ \`${f}\``).join('\n')
      await m.reply(`🧩 *Plugins cargados:* ${files.length}\n📚 *Comandos:* ${total}\n\n${lista}`)
    }
    h.help = ['plugins']
    h.tags = ['owner']
    h.command = ['plugins', 'verplugins']
    h.rowner = true
    return h
  })(),

  // ── ➕ UNIRSE A UN GRUPO (con enlace) ──
  (() => {
    let h = async (m, { conn, text }) => {
      const code = (text || '').match(/chat\.whatsapp\.com\/([\w-]+)/)?.[1]
      if (!code) {
        return m.reply('❌ Uso: `.join <enlace del grupo>`\n▸ Ejemplo: `.join https://chat.whatsapp.com/ABC123`')
      }
      try {
        await conn.groupAcceptInvite(code)
        await m.reply('✅ ¡Listo! Ya estoy dentro del grupo. 🎉')
      } catch (e) {
        await m.reply(`❌ No pude unirme:\n\`\`\`${e.message}\`\`\`\n_(enlace inválido, expiró, o el grupo está lleno)_`)
      }
    }
    h.help = ['join <enlace>']
    h.tags = ['owner']
    h.command = ['join', 'unirse']
    h.rowner = true
    return h
  })(),

  // ── 🚪 SALIR DEL GRUPO ──
  (() => {
    let h = async (m, { conn }) => {
      await m.reply('👋 ¡Adiós a todos! Me voy del grupo…')
      await conn.groupLeave(m.chat)
    }
    h.help = ['leave']
    h.tags = ['owner']
    h.command = ['leave', 'salir']
    h.rowner = true
    h.group = true
    return h
  })(),

  // ── ♻️ REINICIAR EL BOT ──
  //    Con PM2/panel reinicia solo; en Termux/PC hay que volver a npm start
  (() => {
    let h = async (m) => {
      await m.reply('♻️ *Reiniciando el bot…*\n\n▸ Si usas *PM2* o un *panel*, volverá solo en segundos.\n▸ Si estás en *Termux/PC*, inicia de nuevo con `npm start`.')
      setTimeout(() => process.exit(0), 1500)
    }
    h.help = ['restart']
    h.tags = ['owner']
    h.command = ['restart', 'reiniciar']
    h.rowner = true
    return h
  })()
]
