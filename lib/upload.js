// ═══════════════════════════════════════════════════════════════════
//   ☁️  SUBIDA DE ARCHIVOS A INTERNET
//   ─────────────────────────────────────────────────────────────────
//   Algunos endpoints de la API (removebg, iqc, fakenote…) necesitan
//   la URL de una imagen. Cuando el usuario CITA una imagen en lugar
//   de pasar una URL, la subimos a un hosting gratuito (catbox.moe)
//   y usamos esa URL.
//
//   Catbox es gratis, sin registro y sin API key.
// ═══════════════════════════════════════════════════════════════════

/**
 * Sube un buffer a catbox.moe y devuelve la URL pública.
 * @param {Buffer} buffer  contenido del archivo
 * @param {string} filename nombre con extensión, ej: "foto.jpg"
 * @returns {Promise<string>} URL pública
 */
async function uploadBuffer(buffer, filename = 'imagen.jpg') {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', new Blob([buffer]), filename)

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(60000)
  })

  const text = (await res.text()).trim()
  if (!res.ok || !/^https?:\/\//.test(text)) {
    throw new Error(`No se pudo subir el archivo (catbox): ${text || res.status}`)
  }
  return text
}

module.exports = { uploadBuffer }
