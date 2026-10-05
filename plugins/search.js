// ═══════════════════════════════════════════════════════════════════
//   🔍 BÚSQUEDAS
//   ─────────────────────────────────────────────────────────────────
//   Comandos de la sección /api/search de la API Akari.
//
//     aptoide   → busca apps en Aptoide (usa .aptoidedl para descargar)
//     lyrics    → letra de canciones
//     pinterest → busca imágenes en Pinterest (envía la primera imagen)
//     spotify   → busca canciones en Spotify
// ═══════════════════════════════════════════════════════════════════

const { textCommand, mediaCommand } = require('../lib/commands')

module.exports = [
  textCommand('aptoide', '/api/search/aptoide', {
    param: 'q', paramName: '<búsqueda>', tag: 'busqueda',
    desc: 'Busca apps en Aptoide',
    ej: 'whatsapp'
  }),
  textCommand('lyrics', '/api/search/lyrics', {
    param: 'query', paramName: '<canción>', tag: 'busqueda',
    desc: 'Letra de canciones',
    ej: 'Bohemian Rhapsody',
    alias: ['letra', 'lirik']
  }),
  // Pinterest: busca y además ENVÍA la primera imagen encontrada
  mediaCommand('pinterest', '/api/search/pinterest', {
    param: 'q', paramName: '<búsqueda>', prefer: 'image', tag: 'busqueda',
    desc: 'Busca imágenes en Pinterest',
    ej: 'gatos bonitos',
    alias: ['pin', 'pinterestsearch']
  }),
  textCommand('spotify', '/api/search/spotify', {
    param: 'q', paramName: '<canción>', tag: 'busqueda',
    desc: 'Busca canciones en Spotify',
    ej: 'Despacito',
    alias: ['spotifysearch', 'spsearch']
  })
]
