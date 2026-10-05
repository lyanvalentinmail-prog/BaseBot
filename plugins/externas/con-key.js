// ═══════════════════════════════════════════════════════════════════
//   🌐 APIs EXTERNAS GRATIS — CON API KEY (registro gratuito)
//   ─────────────────────────────────────────────────────────────────
//   Estas APIs son GRATIS pero piden registrarte para obtener tu key.
//   👉 Si NO pusiste la key en config.js, el comando te dice
//      EXACTAMENTE dónde conseguirla. 🙌
//
//   Comandos: pelicula (OMDb), gif (Giphy), futbol/envivo
//             (API-FOOTBALL), voz (ElevenLabs)
//
//   Las keys van en config.js:
//     omdbKey, giphyKey, footballKey, elevenlabsKey, elevenVoiceId
// ═══════════════════════════════════════════════════════════════════

const config = require('../../config')

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 BaseBot/1.0', ...headers }, signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

const enc = encodeURIComponent
const ejemplo = (usedPrefix, cmd, uso, ej) =>
  `❌ *Uso:* \`${usedPrefix}${cmd} ${uso}\`\n▸ *Ejemplo:* \`${usedPrefix}${cmd} ${ej}\``

// 🔑 Mensaje cuando falta la key (guía automática al usuario)
const faltaKey = (nombre, url) =>
  `🔑 *Este comando necesita una API key gratuita.*\n\n` +
  `▸ 1️⃣ Consíguela gratis aquí:\n${url}\n` +
  `▸ 2️⃣ Pégala en *config.js* → \`${nombre}\`\n` +
  `▸ 3️⃣ Reinicia el bot (CTRL+C y npm start)\n\n` +
  `_Es gratis y toma 2 minutos_ 😉`

module.exports = [

  // ── 🎬 PELÍCULAS Y SERIES (OMDb — 1.000 consultas/día gratis) ──
  //    Key gratis: https://www.omdbapi.com/apikey.aspx (llega por email)
  (() => {
    let h = async (m, { conn, text, usedPrefix, command }) => {
      if (!config.omdbKey) return m.reply(faltaKey('omdbKey', 'https://www.omdbapi.com/apikey.aspx'))
      const q = text || m.quoted?.text
      if (!q) return m.reply(ejemplo(usedPrefix, command, '<título>', 'titanic'))
      await m.react('⏳')
      const json = await getJson(`https://www.omdbapi.com/?apikey=${enc(config.omdbKey)}&t=${enc(q)}&plot=full`)
      if (json.Response === 'False') {
        await m.react('❌')
        return m.reply(`❌ No encontré *"${q}"*.\n▸ Prueba con el título en inglés o más exacto.`)
      }
      const ratings = (json.Ratings || []).map(r => `${r.Source}: ${r.Value}`).join(' · ')
      const caption =
        `🎬 *${json.Title}* (${json.Year})\n\n` +
        `▸ ⭐ *IMDb:* ${json.imdbRating}/10 (${json.imdbVotes} votos)\n` +
        (ratings ? `▸ 🏅 *Otras notas:* ${ratings}\n` : '') +
        `▸ 🎭 *Género:* ${json.Genre}\n` +
        `▸ 🕐 *Duración:* ${json.Runtime}\n` +
        `▸ 🎬 *Director:* ${json.Director}\n` +
        `▸ 🎞️ *Actores:* ${json.Actors}\n` +
        `▸ 🌎 *País:* ${json.Country}\n` +
        `▸ 🗣️ *Idioma:* ${json.Language}\n\n` +
        `📝 *Sinopsis:* ${json.Plot}`.slice(0, 900)
      if (json.Poster && json.Poster !== 'N/A') {
        await conn.sendMessage(m.chat, { image: { url: json.Poster }, caption: caption.slice(0, 1020) }, { quoted: m.raw })
      } else {
        await m.reply(caption.slice(0, 3500))
      }
      await m.react('✅')
    }
    h.help = ['pelicula <título>']
    h.tags = ['externas']
    h.command = ['pelicula', 'peli', 'movie', 'serie']
    return h
  })(),

  // ── 🎞️ GIFS (Giphy) ──
  //    Key gratis: https://developers.giphy.com → "Create an App"
  (() => {
    let h = async (m, { conn, text, usedPrefix, command }) => {
      if (!config.giphyKey) return m.reply(faltaKey('giphyKey', 'https://developers.giphy.com'))
      const q = text || m.quoted?.text
      if (!q) return m.reply(ejemplo(usedPrefix, command, '<búsqueda>', 'gato'))
      await m.react('⏳')
      const json = await getJson(`https://api.giphy.com/v1/gifs/search?api_key=${enc(config.giphyKey)}&q=${enc(q)}&limit=20&rating=g&lang=es&bundle=messaging_non_clips`)
      const gifs = json.data || []
      if (!gifs.length) {
        await m.react('❌')
        return m.reply(`❌ No encontré GIFs de *"${q}"*.`)
      }
      const pick = gifs[Math.floor(Math.random() * Math.min(gifs.length, 10))]
      const mp4 = pick.images?.fixed_height?.mp4 || pick.images?.original?.mp4
      // gifPlayback: true → se reproduce solo como GIF en WhatsApp 🎞️
      await conn.sendMessage(m.chat, {
        video: { url: mp4 },
        gifPlayback: true,
        caption: `🎞️ *${q}* ${pick.title && pick.title !== ' ' ? '· ' + pick.title : ''}`
      }, { quoted: m.raw })
      await m.react('✅')
    }
    h.help = ['gif <búsqueda>']
    h.tags = ['externas']
    h.command = ['gif', 'giphy']
    return h
  })(),

  // ── ⚽ FÚTBOL: PARTIDOS DE HOY (API-FOOTBALL) ──
  //    Key gratis: https://www.api-football.com → registro → Dashboard
  //    (devuelve 2 comandos: futbol + envivo → por eso lleva "..." delante)
  ...(() => {
    const EN_VIVO = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'])

    function estado(fx) {
      const s = fx.fixture.status.short
      if (EN_VIVO.has(s)) return `🔴 EN VIVO ${fx.fixture.status.elapsed ?? ''}'`
      if (['FT', 'AET', 'PEN'].includes(s)) return '✅ Final'
      if (s === 'NS') return `🕐 ${new Date(fx.fixture.date).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}`
      if (s === 'PST') return '⏸️ Aplazado'
      if (['CANC', 'ABD', 'AWD', 'WO'].includes(s)) return '🚫 Cancelado'
      return s
    }

    function formatoPartidos(list) {
      const porLiga = {}
      for (const fx of list.slice(0, 25)) {
        const liga = `${fx.league.country} · ${fx.league.name}`.slice(0, 45)
        if (!porLiga[liga]) porLiga[liga] = []
        const marcador = fx.goals.home === null ? 'vs' : `*${fx.goals.home} - ${fx.goals.away}*`
        porLiga[liga].push(`  ◦ ${fx.teams.home.name} ${marcador} ${fx.teams.away.name}  _${estado(fx)}_`)
      }
      return Object.entries(porLiga)
        .map(([liga, partidos]) => `🏆 *${liga}*\n${partidos.join('\n')}`)
        .join('\n\n')
    }

    async function pedir(url) {
      const json = await getJson(url, { 'x-apisports-key': config.footballKey })
      if (json.errors && Object.keys(json.errors).length) {
        const e = Object.values(json.errors)[0]
        throw new Error(`API-FOOTBALL: ${e}`)
      }
      return json.response || []
    }

    let hoy = async (m, { text }) => {
      if (!config.footballKey) return m.reply(faltaKey('footballKey', 'https://www.api-football.com'))
      await m.react('⏳')
      const fecha = new Date().toISOString().slice(0, 10)
      const list = await pedir(`https://v3.football.api-sports.io/fixtures?date=${fecha}`)
      if (!list.length) {
        await m.react('❌')
        return m.reply(`⚽ No hay partidos programados para hoy (${fecha}).\n▸ Prueba con \`.envivo\` para ver si hay alguno jugándose.`)
      }
      await m.reply(`⚽ *Partidos de hoy* (${fecha})\n\n${formatoPartidos(list)}`.slice(0, 3800))
      await m.react('✅')
    }
    hoy.help = ['futbol']
    hoy.tags = ['externas']
    hoy.command = ['futbol', 'partidos', 'football']

    let vivo = async (m) => {
      if (!config.footballKey) return m.reply(faltaKey('footballKey', 'https://www.api-football.com'))
      await m.react('⏳')
      const list = await pedir('https://v3.football.api-sports.io/fixtures?live=all')
      if (!list.length) {
        await m.react('😴')
        return m.reply('😴 No hay partidos en vivo ahora mismo.\n▸ Usa `.futbol` para ver los de hoy.')
      }
      await m.reply(`🔴 *EN VIVO AHORA*\n\n${formatoPartidos(list)}`.slice(0, 3800))
      await m.react('✅')
    }
    vivo.help = ['envivo']
    vivo.tags = ['externas']
    vivo.command = ['envivo', 'livescore', 'endirecto']

    return [hoy, vivo]
  })(),

  // ── 🔊 TEXTO A VOZ (ElevenLabs — 10.000 caracteres/mes gratis) ──
  //    Key gratis: https://elevenlabs.io → Profile → API Keys
  (() => {
    let h = async (m, { conn, text, usedPrefix, command }) => {
      if (!config.elevenlabsKey) return m.reply(faltaKey('elevenlabsKey', 'https://elevenlabs.io'))
      const q = text || m.quoted?.text
      if (!q) return m.reply(ejemplo(usedPrefix, command, '<texto>', 'Hola, soy tu bot de WhatsApp'))
      if (q.length > 500) return m.reply('❌ Máximo *500 caracteres* por mensaje (para no gastar tu cuota gratis).')
      await m.react('⏳')

      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.elevenVoiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': config.elevenlabsKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg'
        },
        body: JSON.stringify({
          text: q,
          model_id: 'eleven_multilingual_v2', // ✨ soporta español
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        }),
        signal: AbortSignal.timeout(60000)
      })

      if (!res.ok) {
        const err = await res.text().catch(() => '')
        await m.react('❌')
        if (res.status === 401) return m.reply('❌ Tu `elevenlabsKey` es inválida. Revísala en config.js')
        if (res.status === 429) return m.reply('❌ Se acabó tu cuota gratis del mes de ElevenLabs.')
        return m.reply(`❌ ElevenLabs respondió HTTP ${res.status}:\n\`\`\`${err.slice(0, 200)}\`\`\``)
      }

      const buf = Buffer.from(await res.arrayBuffer())
      await conn.sendMessage(m.chat, { audio: buf, mimetype: 'audio/mpeg' }, { quoted: m.raw })
      await m.react('✅')
    }
    h.help = ['voz <texto>']
    h.tags = ['externas']
    h.command = ['voz', 'tts', 'decir']
    return h
  })()
]
