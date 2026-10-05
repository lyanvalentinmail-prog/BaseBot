// ═══════════════════════════════════════════════════════════════════
//   📦 SERIALIZADOR DE MENSAJES
//   ─────────────────────────────────────────────────────────────────
//   Convierte el mensaje "crudo" de Baileys en un objeto "m" fácil
//   de usar en los comandos:
//
//     m.chat        → id del chat donde llegó el mensaje
//     m.sender      → id de quien lo envió
//     m.senderNumber→ número limpio, ej: "521234567890"
//     m.pushName    → nombre del usuario
//     m.body        → texto del mensaje (también captions, botones…)
//     m.isGroup     → true si es un grupo
//     m.quoted      → mensaje citado (si existe)
//     m.mentionedJid→ usuarios mencionados
//     m.isMedia     → true si trae imagen/video/audio/documento
//     m.download()  → descarga el archivo del mensaje (o del citado)
//     m.reply(txt)  → responde al mensaje
//     m.react('⌛') → reacciona al mensaje con un emoji
//
//   👉 Normalmente NO necesitas editar este archivo.
// ═══════════════════════════════════════════════════════════════════

const { getContentType, downloadMediaMessage } = require('@whiskeysockets/baileys')
const pino = require('pino')

const logger = pino({ level: 'silent' })

const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage']

// Desenvuelve mensajes especiales (temporales, "ver una vez", editados…)
function unwrap(message) {
  let content = message
  for (let i = 0; i < 4 && content; i++) {
    if (content.ephemeralMessage) content = content.ephemeralMessage.message
    else if (content.viewOnceMessage) content = content.viewOnceMessage.message
    else if (content.viewOnceMessageV2) content = content.viewOnceMessageV2.message
    else if (content.documentWithCaptionMessage) content = content.documentWithCaptionMessage.message
    else if (content.editedMessage) content = content.editedMessage.message?.protocolMessage?.editedMessage || content.editedMessage.message || content
    else break
  }
  return content || {}
}

// Saca el texto de cualquier tipo de mensaje
function extractText(content, mtype, msg) {
  try {
    if (content.conversation) return content.conversation
    if (msg?.text) return msg.text
    if (msg?.caption) return msg.caption
    if (msg?.selectedButtonId) return msg.selectedButtonId                         // buttonsResponseMessage
    if (msg?.singleSelectReply?.selectedRowId) return msg.singleSelectReply.selectedRowId // listResponseMessage
    if (msg?.selectedId) return msg.selectedId                                     // templateButtonReplyMessage
    if (msg?.nativeFlowResponseButton?.paramsJson) {                               // interactiveResponseMessage
      const parsed = JSON.parse(msg.nativeFlowResponseButton.paramsJson)
      return parsed?.id || ''
    }
  } catch {}
  return ''
}

function serialize(conn, msg) {
  if (!msg?.message) return null

  const content = unwrap(msg.message)
  const mtype = getContentType(content)
  if (!mtype) return null
  const inner = content[mtype]

  const chat = msg.key.remoteJid
  const isGroup = chat.endsWith('@g.us')
  const sender = isGroup ? (msg.key.participant || msg.participant || chat) : chat

  // Mensaje citado (si existe)
  const contextInfo = inner?.contextInfo
  let quoted = null
  if (contextInfo?.quotedMessage) {
    const qContent = unwrap(contextInfo.quotedMessage)
    const qType = getContentType(qContent)
    const qMsg = qContent[qType]
    const qKey = {
      remoteJid: chat,
      fromMe: false,
      id: contextInfo.stanzaId,
      participant: contextInfo.participant
    }
    quoted = {
      key: qKey,
      mtype: qType,
      msg: qMsg,
      sender: contextInfo.participant || chat,
      text: extractText(qContent, qType, qMsg) || '',
      mime: qMsg?.mimetype || '',
      isMedia: MEDIA_TYPES.includes(qType),
      download: () => downloadMediaMessage(
        { key: qKey, message: qContent }, 'buffer', {},
        { logger, reuploadRequest: conn.updateMediaMessage }
      )
    }
  }

  const m = {
    raw: msg,                                   // mensaje original (para quoted)
    key: msg.key,
    id: msg.key.id,
    chat,
    fromMe: !!msg.key.fromMe,
    isGroup,
    sender,
    senderNumber: sender.split('@')[0].split(':')[0],
    pushName: msg.pushName || 'Usuario',
    messageTimestamp: (msg.messageTimestamp?.toString?.() || Date.now() / 1000),
    mtype,
    msg: inner,
    mime: inner?.mimetype || '',
    isMedia: MEDIA_TYPES.includes(mtype),
    body: (extractText(content, mtype, inner) || '').trim(),
    mentionedJid: contextInfo?.mentionedJid || [],
    quoted,

    // ── Atajos útiles ──
    reply(text, extra = {}) {
      // extra (mentions, viewOnce, etc.) se fusiona DENTRO del mensaje
      const payload = typeof text === 'string' ? { text, ...extra } : { ...text, ...extra }
      return conn.sendMessage(chat, payload, { quoted: msg })
    },
    react(emoji) {
      return conn.sendMessage(chat, { react: { text: emoji, key: msg.key } }).catch(() => {})
    },
    download() {
      if (this.isMedia) {
        return downloadMediaMessage(
          { key: msg.key, message: content }, 'buffer', {},
          { logger, reuploadRequest: conn.updateMediaMessage }
        )
      }
      if (this.quoted?.isMedia) return this.quoted.download()
      return Promise.reject(new Error('El mensaje no tiene ningún archivo para descargar'))
    }
  }

  return m
}

module.exports = { serialize }
