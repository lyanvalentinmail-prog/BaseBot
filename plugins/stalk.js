// ═══════════════════════════════════════════════════════════════════
//   👤 STALK (información de perfiles)
//   ─────────────────────────────────────────────────────────────────
//   Comandos de la sección /api/stalk de la API Akari.
//
//     githubstalk   → info de un usuario de GitHub
//     threadsstalk  → busca perfiles/posts de Threads
//     tiktokstalk   → info de un perfil de TikTok
// ═══════════════════════════════════════════════════════════════════

const { textCommand } = require('../lib/commands')

module.exports = [
  textCommand('githubstalk', '/api/stalk/github', {
    param: 'user', paramName: '<usuario>', tag: 'stalk',
    desc: 'Stalkea un perfil de GitHub',
    ej: 'octocat',
    alias: ['github', 'ghstalk']
  }),
  textCommand('threadsstalk', '/api/stalk/threads', {
    param: 'q', paramName: '<usuario>', tag: 'stalk',
    desc: 'Stalkea perfiles de Threads',
    ej: 'google',
    alias: ['thstalk']
  }),
  textCommand('tiktokstalk', '/api/stalk/tiktokstalk', {
    param: 'username', paramName: '<usuario>', tag: 'stalk',
    desc: 'Stalkea un perfil de TikTok',
    ej: 'cristiano',
    alias: ['ttstalk', 'ttuser']
  })
]
