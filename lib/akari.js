// ═══════════════════════════════════════════════════════════════════
//   🌙 CLIENTE DE LA API AKARI / HOSHINO
//   ─────────────────────────────────────────────────────────────────
//   Este archivo se encarga de:
//     1. Llamar a cualquier endpoint de https://apiakari.vercel.app
//        (enviando automáticamente la API key).
//     2. Detectar si la respuesta es JSON o un archivo (imagen, etc).
//     3. Formatear los resultados para que se vean bonitos en WhatsApp.
//     4. Encontrar y enviar archivos multimedia (video, audio, imagen…)
//        dentro de las respuestas JSON de la API.
//
//   👉 Normalmente NO necesitas editar este archivo.
// ═══════════════════════════════════════════════════════════════════

const config = require('../config')

// Extensiones conocidas para saber qué tipo de archivo es un enlace
const EXT_KIND = {
  mp4: 'video', mkv: 'video', mov: 'video', webm: 'video', avi: 'video',
  mp3: 'audio', m4a: 'audio', ogg: 'audio', opus: 'audio', wav: 'audio', aac: 'audio', flac: 'audio',
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', jfif: 'image', bmp: 'image',
  webp: 'sticker',
  apk: 'document', zip: 'document', pdf: 'document', rar: 'document', '7z': 'document',
  doc: 'document', docx: 'document', xls: 'document', xlsx: 'document', txt: 'document'
}

const MIMES = {
  video: 'video/mp4', audio: 'audio/mpeg', image: 'image/jpeg',
  document: 'application/octet-stream', sticker: 'image/webp'
}

// ─────────────────────────────────────────────────────────────────
// 📡 akari(ruta, parámetros) — llama a la API
//    Ejemplo: await akari('/api/ai/gemini', { text: 'hola' })
//    Devuelve:  { type: 'json', data: {...} }
//           o   { type: 'buffer', buffer, mime }
// ─────────────────────────────────────────────────────────────────
async function akari(path, params = {}) {
  const base = config.apiUrl.replace(/\/+$/, '')
  const url = new URL(base + path)

  // Parámetros de la petición
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  }

  // ⭐ La API usa "key" en algunos endpoints y "apikey" en otros.
  //    Para que TODOS funcionen, enviamos los dos a la vez.
  url.searchParams.set('key', config.apiKey)
  url.searchParams.set('apikey', config.apiKey)

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10) BaseBot/1.0' },
    signal: AbortSignal.timeout(config.apiTimeout || 120000)
  })

  const contentType = (res.headers.get('content-type') || '').toLowerCase()

  // ✅ Respuesta JSON
  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => ({}))
    return { type: 'json', data }
  }

  // ✅ Respuesta binaria (imagen, audio, etc.)
  const buffer = Buffer.from(await res.arrayBuffer())

  // Algunas respuestas "binarias" pequeñas son en realidad JSON disfrazado
  if (buffer.length < 6000) {
    try {
      const data = JSON.parse(buffer.toString('utf8'))
      return { type: 'json', data }
    } catch {}
  }

  if (!res.ok) throw new Error(`La API respondió con el código HTTP ${res.status}`)

  return { type: 'buffer', buffer, mime: contentType.split(';')[0] || 'application/octet-stream' }
}

// ─────────────────────────────────────────────────────────────────
// 🧩 Funciones para analizar las respuestas JSON de la API
// ─────────────────────────────────────────────────────────────────

// ¿Es un error de la API?  { status: false, error: "..." }
function isApiError(json) {
  return json && (json.status === false || json.success === false) && (json.error || json.message)
}

// Desenvuelve la respuesta: la API usa a veces "data" y a veces "result"
function unwrap(json) {
  if (!json || typeof json !== 'object') return json
  if (json.data !== undefined) return json.data
  if (json.result !== undefined) return json.result
  if (json.results !== undefined) return json.results
  return json
}

const URL_RE = /https?:\/\/[^\s"'<>()\[\]{}]+/gi

// ¿Qué tipo de archivo es un enlace?
function kindOf(url, key = '') {
  const clean = url.split('?')[0].split('#')[0].toLowerCase()
  const ext = clean.split('.').pop()
  if (EXT_KIND[ext]) return EXT_KIND[ext]
  const k = key.toLowerCase()
  if (/video|mp4|nowm|play/.test(k)) return 'video'
  if (/audio|mp3|music|song/.test(k)) return 'audio'
  if (/image|img|photo|png|jpg|jpeg|foto|thumb/.test(k)) return 'image'
  if (/sticker|webp/.test(k)) return 'sticker'
  if (/apk|download|dl|file/.test(k)) return 'document'
  if (/tiktokcdn|douyinpic|muscdn/.test(url)) return 'video'
  return 'link' // enlaces normales (páginas web) NO se envían como archivo
}

// Busca TODOS los enlaces dentro de un objeto/array (recursivo)
function findMedia(obj, keyName = '', found = []) {
  if (typeof obj === 'string') {
    const matches = obj.match(URL_RE)
    if (matches) {
      for (const url of matches) {
        const kind = kindOf(url, keyName)
        found.push({ url, kind, key: keyName })
      }
    }
  } else if (Array.isArray(obj)) {
    for (const item of obj) findMedia(item, keyName, found)
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) findMedia(v, k, found)
  }
  return found
}

// Elige el mejor archivo para enviar (por prioridad o por preferencia)
function pickMedia(data, prefer = null) {
  const all = findMedia(data).filter(m => m.kind !== 'link')
  // quita duplicados
  const unique = [...new Map(all.map(m => [m.url, m])).values()]
  if (!unique.length) return null
  if (prefer) {
    const fav = unique.find(m => m.kind === prefer)
    if (fav) return fav
  }
  const order = ['video', 'audio', 'sticker', 'image', 'document']
  for (const kind of order) {
    const m = unique.find(x => x.kind === kind)
    if (m) return m
  }
  return null
}

// Todos los enlaces de un tipo (útil para stickers, wallpapers, etc.)
function mediaList(data, kinds = ['image', 'sticker']) {
  const all = findMedia(data).filter(m => kinds.includes(m.kind))
  return [...new Map(all.map(m => [m.url, m])).values()]
}

// Extrae la respuesta de texto de endpoints tipo IA
function pickAnswer(json) {
  const d = unwrap(json)
  if (typeof d === 'string') return d
  if (!d || typeof d !== 'object') return formatResult(json)
  const keys = ['answer', 'response', 'respuesta', 'reply', 'result', 'message',
    'completion', 'content', 'translation', 'translated', 'traduccion', 'text', 'lyrics', 'letra']
  for (const k of keys) {
    if (typeof d[k] === 'string' && d[k].trim()) return d[k]
  }
  return formatResult(d)
}

// Nombre de archivo a partir de una URL
function fileNameFromUrl(url, fallback = 'archivo') {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() || '')
    if (name && name.includes('.')) return name
  } catch {}
  const ext = url.split('?')[0].split('.').pop()
  return `${fallback}.${ext && ext.length <= 5 ? ext : 'bin'}`
}

// ─────────────────────────────────────────────────────────────────
// ✨ formatResult(obj) — convierte JSON en texto bonito para WhatsApp
// ─────────────────────────────────────────────────────────────────
function prettyKey(k) {
  return String(k).replace(/[_\-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const SKIP_KEYS = new Set(['creator', 'key', 'apikey', 'apiKey', 'status', 'success'])

function formatResult(obj, { skipUrls = true, indent = '', maxItems = 10, depth = 0 } = {}) {
  if (obj === null || obj === undefined) return ''
  if (typeof obj === 'string') {
    const s = obj.trim()
    if (skipUrls && /^https?:\/\//.test(s) && findMedia(s).some(m => m.kind !== 'link')) return ''
    return s
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)

  const lines = []

  if (Array.isArray(obj)) {
    const slice = obj.slice(0, maxItems)
    slice.forEach((item, i) => {
      if (item && typeof item === 'object') {
        lines.push(`${indent}*\`${i + 1}.\`*`)
        const inner = formatResult(item, { skipUrls, indent: indent + '  ', maxItems, depth: depth + 1 })
        if (inner) lines.push(inner)
      } else {
        const v = formatResult(item, { skipUrls, indent, maxItems, depth: depth + 1 })
        if (v) lines.push(`${indent}*\`${i + 1}.\`* ${v}`)
      }
    })
    if (obj.length > maxItems) lines.push(`${indent}_…y ${obj.length - maxItems} resultados más_`)
    return lines.filter(Boolean).join('\n')
  }

  for (const [k, v] of Object.entries(obj)) {
    if (SKIP_KEYS.has(k)) continue
    if (v === null || v === undefined || v === '') continue
    if (typeof v === 'object') {
      const inner = formatResult(v, { skipUrls, indent: indent + '  ', maxItems, depth: depth + 1 })
      if (inner) lines.push(`${indent}▸ *${prettyKey(k)}:*\n${inner}`)
    } else {
      const inner = formatResult(v, { skipUrls, indent, maxItems, depth: depth + 1 })
      if (inner) lines.push(`${indent}▸ *${prettyKey(k)}:* ${inner.length > 220 ? inner.slice(0, 220) + '…' : inner}`)
    }
  }
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────
// 📤 sendResult(conn, m, res, opciones)
//    Toma la respuesta de akari() y la ENVÍA a WhatsApp eligiendo
//    automáticamente entre: video, audio, imagen, documento o texto.
//    Devuelve true si todo fue bien.
// ─────────────────────────────────────────────────────────────────
async function sendResult(conn, m, res, { prefer = null, title = '', docName = null } = {}) {
  // ── Caso 1: la API devolvió un archivo directamente ──
  if (res.type === 'buffer') {
    const { buffer, mime } = res
    const caption = `${title ? `*${title}*\n\n` : ''}${config.wm}`
    if (mime.startsWith('image/')) {
      await conn.sendMessage(m.chat, { image: buffer, caption }, { quoted: m.raw })
    } else if (mime.startsWith('video/')) {
      await conn.sendMessage(m.chat, { video: buffer, caption }, { quoted: m.raw })
    } else if (mime.startsWith('audio/')) {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: mime || 'audio/mpeg' }, { quoted: m.raw })
    } else {
      await conn.sendMessage(m.chat, {
        document: buffer, mimetype: mime, fileName: docName || 'archivo', caption
      }, { quoted: m.raw })
    }
    return true
  }

  // ── Caso 2: JSON ──
  const json = res.data

  // Error reportado por la API (status: false)
  if (isApiError(json)) {
    let msg = `❌ *Error de la API:* ${json.error || json.message}`
    if (json.usage) msg += `\n\n▸ *Uso correcto:* \`${json.usage}\``
    await m.reply(msg)
    return false
  }

  const data = unwrap(json)
  const info = formatResult(data)
  const chosen = pickMedia(data, prefer)

  // 2a. Encontramos un archivo multimedia → lo enviamos
  if (chosen) {
    const captionBase = info ? `${title ? `*${title}*\n\n` : ''}${info}`.slice(0, 1000) : (title ? `*${title}*` : config.wm)
    const caption = `${captionBase}\n\n${config.wm}`.trim().slice(0, 1024)

    try {
      switch (chosen.kind) {
        case 'video':
          await conn.sendMessage(m.chat, { video: { url: chosen.url }, caption }, { quoted: m.raw })
          break
        case 'audio':
          if (info) await m.reply(`*${title || m.command || 'Resultado'}*\n\n${info}`.slice(0, 2000))
          await conn.sendMessage(m.chat, { audio: { url: chosen.url }, mimetype: 'audio/mpeg' }, { quoted: m.raw })
          break
        case 'image':
        case 'sticker': {
          // Los stickers sueltos se envían como imagen (vienen como URL)
          const buf = Buffer.from(await (await fetch(chosen.url, { signal: AbortSignal.timeout(60000) })).arrayBuffer())
          if (chosen.kind === 'sticker') {
            await conn.sendMessage(m.chat, { sticker: buf }, { quoted: m.raw })
          } else {
            await conn.sendMessage(m.chat, { image: buf, caption }, { quoted: m.raw })
          }
          break
        }
        default: {
          let mimetype = MIMES.document
          const ext = (chosen.url.split('?')[0].split('.').pop() || '').toLowerCase()
          if (ext === 'apk') mimetype = 'application/vnd.android.package-archive'
          if (ext === 'zip') mimetype = 'application/zip'
          if (ext === 'pdf') mimetype = 'application/pdf'
          await conn.sendMessage(m.chat, {
            document: { url: chosen.url },
            mimetype,
            fileName: docName || fileNameFromUrl(chosen.url, 'descarga'),
            caption
          }, { quoted: m.raw })
        }
      }
      return true
    } catch (e) {
      // Si falla el envío del archivo, al menos mandamos la información en texto
      console.error('No se pudo enviar el archivo:', e.message || e)
      await m.reply(`${info ? info + '\n\n' : ''}🔗 *Enlace:* ${chosen.url}`.slice(0, 3000))
      return true
    }
  }

  // 2b. No hay archivos → enviar información en texto
  if (!info || !info.trim()) {
    await m.reply(config.mess.apiError)
    return false
  }
  await m.reply(`${title ? `*${title}*\n\n` : ''}${info}`.slice(0, 4000))
  return true
}

module.exports = {
  akari,
  sendResult,
  isApiError,
  unwrap,
  findMedia,
  pickMedia,
  mediaList,
  pickAnswer,
  formatResult,
  fileNameFromUrl
}
