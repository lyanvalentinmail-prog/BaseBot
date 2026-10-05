// ═══════════════════════════════════════════════════════════════════
//   🚀 BASEBOT — Bot base de WhatsApp
//   ─────────────────────────────────────────────────────────────────
//   Punto de entrada del bot. Se encarga de:
//     1. Conectar con WhatsApp (código de emparejamiento o QR).
//     2. Cargar todos los plugins de la carpeta /plugins.
//     3. Recargar los plugins automáticamente cuando los editas.
//     4. Reconectar si se cae la conexión.
//
//   👉 Normalmente NO necesitas editar este archivo.
//      Toda la personalización está en config.js
// ═══════════════════════════════════════════════════════════════════

const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers
} = require('@whiskeysockets/baileys')
const pino = require('pino')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const path = require('path')
const config = require('./config')
const handler = require('./handler')

const logger = pino({ level: 'silent' })

// ═════════════════════════════════════════════════════════════════
// 🔌 CARGA DE PLUGINS (con recarga en caliente al editar)
//    Lee TODAS las subcarpetas de /plugins — cada carpeta es un
//    GRUPO de comandos: principal, ia, descargas, imagen, maker…
//    Puedes crear carpetas nuevas con archivos .js dentro y el
//    bot los cargará automáticamente. 🔥
// ═════════════════════════════════════════════════════════════════
global.plugins = {}
const pluginsDir = path.join(__dirname, 'plugins')

// Busca todos los archivos .js (recursivo: plugins/grupo/archivo.js)
function findJsFiles(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...findJsFiles(full))
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full)
  }
  return out
}

// Lista todas las carpetas dentro de /plugins (para vigilarlas)
function findDirs(dir) {
  const out = [dir]
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...findDirs(path.join(dir, entry.name)))
  }
  return out
}

function loadAllPlugins() {
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true })
  global.plugins = {}
  for (const filepath of findJsFiles(pluginsDir)) {
    const rel = path.relative(pluginsDir, filepath)
    try {
      delete require.cache[require.resolve(filepath)]
      global.plugins[rel] = require(filepath)
    } catch (e) {
      console.error(`⚠️  Error al cargar el plugin "${rel}":`, e.message)
    }
  }
}

function countCommands() {
  let total = 0
  for (const plugin of Object.values(global.plugins)) {
    for (const p of (Array.isArray(plugin) ? plugin : [plugin])) {
      if (p?.command) total += (Array.isArray(p.command) ? p.command : [p.command]).filter(c => typeof c === 'string').length
    }
  }
  return total
}

loadAllPlugins()

// ♻️ Recarga automática al editar/crear/borrar plugins
//    (vigila /plugins y todas sus subcarpetas)
let watchers = []
let reloadTimer = null

function scheduleReload(reason) {
  clearTimeout(reloadTimer)
  reloadTimer = setTimeout(() => {
    console.log(`♻️  Cambio detectado en plugins (${reason}) → recargando…`)
    loadAllPlugins()
    setupWatchers()
    console.log(`✅ ${countCommands()} comandos listos.`)
  }, 600)
}

function setupWatchers() {
  watchers.forEach(w => { try { w.close() } catch {} })
  watchers = []
  for (const dir of findDirs(pluginsDir)) {
    try {
      watchers.push(fs.watch(dir, (event, filename) => {
        if (filename && !filename.endsWith('.js')) return
        scheduleReload(filename || 'plugins')
      }))
    } catch {}
  }
}
setupWatchers()

// ═════════════════════════════════════════════════════════════════
// 📱 CONEXIÓN CON WHATSAPP
// ═════════════════════════════════════════════════════════════════
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionName || 'session')

  // Versión de WhatsApp Web (si falla la descarga, usa la por defecto de Baileys)
  let version
  try {
    ({ version } = await fetchLatestBaileysVersion())
    console.log(`🌐 Usando la versión de WA Web: ${version}`)
  } catch {
    console.log('🌐 Usando la versión de WA Web por defecto de Baileys.')
  }

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    markOnlineOnConnect: true,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true
  })

  // ── 🔑 Vinculación con código de 8 dígitos ──
  const wantPairing = config.usePairingCode && !process.argv.includes('--qr')
  if (wantPairing && !sock.authState.creds.registered) {
    const number = String(config.pairingNumber || '').replace(/\D/g, '')
    if (!number) {
      console.log('\n⚠️  Tienes activado "usePairingCode" pero NO pusiste tu número en config.js (pairingNumber).')
      console.log('    👉 Edita config.js o inicia con: npm run qr\n')
    } else if (number.length < 8 || number.length > 15) {
      console.log(`\n⚠️  El pairingNumber "${number}" parece estar incompleto.`)
      console.log('    Debe ser el número COMPLETO: código de país + número, todo junto.')
      console.log('    Ejemplo Uruguay: 59896719709  |  México: 521234567890\n')
    } else {
      setTimeout(async () => {
        try {
          const rawCode = await sock.requestPairingCode(number)
          const pretty = rawCode?.match(/.{1,4}/g)?.join('-') || rawCode
          console.log('\n╔══════════════════════════════╗')
          console.log('   🔑 CÓDIGO DE VINCULACIÓN')
          console.log(`        ➜  ${pretty}`)
          console.log('╚══════════════════════════════╝')
          console.log(`▸ Escríbelo en WhatsApp SIN el guion:  ${rawCode}`)
          console.log(`▸ Debe escribirse en el WhatsApp del número: ${number}`)
          console.log('▸ ⚠️  El código EXPIRA en ~2 minutos: úsalo enseguida.')
          console.log('    Si falla, reinicia el bot (CTRL+C y npm start) y usa el código NUEVO.\n')
          console.log('Abre WhatsApp › Ajustes › Dispositivos vinculados ›')
          console.log('Vincular dispositivo › «Vincular con número de teléfono»\n')
        } catch (e) {
          console.error('❌ No se pudo generar el código de emparejamiento:', e?.message || e)
          console.log('    👉 Verifica que pairingNumber tenga código de país (ej: 521234567890)\n')
        }
      }, 3000)
    }
  }

  sock.ev.on('creds.update', saveCreds)

  // ── 🔄 Estado de la conexión ──
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    // Mostrar QR si corresponde
    if (qr && !wantPairing) {
      console.log('\n📱 Escanea este QR con WhatsApp (Ajustes › Dispositivos vinculados):\n')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      console.log(`🔌 Conexión cerrada (código: ${statusCode || 'desconocido'})`)
      if (statusCode !== DisconnectReason.loggedOut) {
        console.log('🔁 Reconectando…\n')
        startBot()
      } else {
        console.log('🚪 La sesión fue cerrada. Borrando carpeta de sesión…')
        try { fs.rmSync(config.sessionName || 'session', { recursive: true, force: true }) } catch {}
        console.log('✅ Sesión eliminada. Vuelve a iniciar el bot para vincular de nuevo.')
        process.exit(0)
      }
    }

    if (connection === 'open') {
      const name = sock.user?.name || sock.user?.id?.split(':')[0] || 'desconocido'
      console.log('\n════════════════════════════════════════')
      console.log(`✅ ¡BOT CONECTADO como: ${name}!`)
      console.log(`📚 Comandos cargados: ${countCommands()}`)
      console.log(`🔑 Prefijo(s): ${prefixesText()}`)
      console.log(`🌙 API: ${config.apiUrl}`)
      console.log('════════════════════════════════════════\n')
    }
  })

  // ── 📨 Mensajes entrantes ──
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const msg of messages) {
      if (!msg.message) continue
      try {
        await handler(sock, msg)
      } catch (e) {
        console.error('❌ Error procesando un mensaje:', e)
      }
    }
  })

  // ── 🎉 Bienvenida / despedida cuando alguien entra o sale ──
  //    Se activa/desactiva y se personaliza en config.js
  sock.ev.on('group-participants.update', async (update) => {
    if (!config.welcome) return
    try {
      const { id, participants, action } = update
      if (action !== 'add' && action !== 'remove') return

      const metadata = await sock.groupMetadata(id).catch(() => null)
      const data = {
        group: metadata?.subject || 'el grupo',
        count: metadata?.participants?.length ?? '?'
      }

      for (const user of participants) {
        const template = action === 'add' ? config.welcomeMsg : config.goodbyeMsg
        if (!template) continue
        const text = String(template)
          .replace(/@user|\{user\}/g, `@${user.split('@')[0]}`)
          .replace(/\{group\}/g, data.group)
          .replace(/\{count\}/g, String(data.count))
        await sock.sendMessage(id, { text, mentions: [user] }).catch(() => {})
      }
    } catch (e) {
      console.error('Error en bienvenida/despedida:', e)
    }
  })

  return sock
}

function prefixesText() {
  return Array.isArray(config.prefix) ? config.prefix.join('  ') : config.prefix
}

// ═════════════════════════════════════════════════════════════════
// ▶️ ARRANQUE
// ═════════════════════════════════════════════════════════════════
console.log(`
╭─────────────────────────────────╮
│     🤖  B A S E B O T  ✦       │
│  WhatsApp Bot con API Akari 🌙  │
╰─────────────────────────────────╯
`)

startBot().catch(e => {
  console.error('❌ Error fatal al iniciar:', e)
  process.exit(1)
})

// Evita que el bot se cierre por errores no controlados
process.on('uncaughtException', e => console.error('⚠️ uncaughtException:', e))
process.on('unhandledRejection', e => console.error('⚠️ unhandledRejection:', e))
