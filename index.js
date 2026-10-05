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
// ═════════════════════════════════════════════════════════════════
global.plugins = {}
const pluginsDir = path.join(__dirname, 'plugins')

function loadAllPlugins() {
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true })
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
  global.plugins = {}
  for (const file of files) {
    const filepath = path.join(pluginsDir, file)
    try {
      delete require.cache[require.resolve(filepath)]
      global.plugins[file] = require(filepath)
    } catch (e) {
      console.error(`⚠️  Error al cargar el plugin "${file}":`, e.message)
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

// Recarga automática cuando editas un archivo de /plugins
let reloadTimer = null
fs.watch(pluginsDir, (event, filename) => {
  if (!filename || !filename.endsWith('.js')) return
  clearTimeout(reloadTimer)
  reloadTimer = setTimeout(() => {
    console.log(`♻️  Plugin modificado (${filename}) → recargando plugins…`)
    loadAllPlugins()
    console.log(`✅ ${countCommands()} comandos listos.`)
  }, 600)
})

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
