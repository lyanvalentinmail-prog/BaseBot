// ═══════════════════════════════════════════════════════════════════
//   🌐 APIs EXTERNAS GRATIS — ¡SIN API KEY!
//   ─────────────────────────────────────────────────────────────────
//   Estas APIs NO necesitan registro ni key: funcionan al instante.
//   (Recomendadas de https://freeapihub.com/apis)
//
//   A diferencia de los comandos de la API Akari, aquí llamamos
//   DIRECTAMENTE a cada API con fetch() — así aprendes cómo usar
//   cualquier API del mundo en tus propios comandos. 💪
//
//   Comandos: fraseanime, pais, quees, definir, comida, libro,
//             anime, clima2
// ═══════════════════════════════════════════════════════════════════

const config = require('../../config')

// 📡 Helper: pide JSON de cualquier URL (con timeout de 30 s)
async function getJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 BaseBot/1.0' },
    signal: AbortSignal.timeout(30000)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

const enc = encodeURIComponent
const ejemplo = (usedPrefix, cmd, uso, ej) =>
  `❌ *Uso:* \`${usedPrefix}${cmd} ${uso}\`\n▸ *Ejemplo:* \`${usedPrefix}${cmd} ${ej}\``

module.exports = [

  // ── 🌸 FRASE RANDOM DE ANIME (AnimeChan) ──
  (() => {
    let h = async (m) => {
      await m.react('⏳')
      let json
      try {
        json = await getJson('https://animechan.io/api/v1/quotes/random')
      } catch {
        json = await getJson('https://animechan.xyz/api/random') // API vieja de respaldo
      }
      const d = json.data || json
      const frase = d.content || d.quote
      const personaje = d.character?.name || d.character || '¿?'
      const anime = d.anime?.name || d.anime || '¿?'
      await m.reply(`🌸 *Frase de anime*\n\n❝ _${frase}_ ❞\n\n▸ 👤 *${personaje}*\n▸ 🎬 *${anime}*`)
      await m.react('✅')
    }
    h.help = ['fraseanime']
    h.tags = ['externas']
    h.command = ['fraseanime', 'animequote', 'frasean']
    return h
  })(),

  // ── 🌍 INFO DE UN PAÍS (REST Countries) ──
  (() => {
    let h = async (m, { conn, text, usedPrefix, command }) => {
      const q = text || m.quoted?.text
      if (!q) return m.reply(ejemplo(usedPrefix, command, '<país>', 'uruguay'))
      await m.react('⏳')
      try {
        const arr = await getJson(`https://restcountries.com/v3.1/name/${enc(q)}?fields=name,capital,region,subregion,population,area,flags,currencies,languages,timezones`)
        const c = arr[0]
        const monedas = Object.entries(c.currencies || {}).map(([cod, m2]) => `${m2.name} (${m2.symbol || cod})`).join(', ') || 'N/D'
        const idiomas = Object.values(c.languages || {}).join(', ') || 'N/D'
        const caption =
          `🌍 *${c.name?.common}* — ${c.name?.official}\n\n` +
          `▸ 🏛️ *Capital:* ${(c.capital || []).join(', ') || 'N/D'}\n` +
          `▸ 🗺️ *Región:* ${c.region} (${c.subregion || 'N/D'})\n` +
          `▸ 👥 *Población:* ${(c.population || 0).toLocaleString('es')}\n` +
          `▸ 📐 *Área:* ${(c.area || 0).toLocaleString('es')} km²\n` +
          `▸ 💰 *Moneda:* ${monedas}\n` +
          `▸ 🗣️ *Idiomas:* ${idiomas}\n` +
          `▸ 🕐 *Zonas horarias:* ${(c.timezones || []).slice(0, 4).join(', ')}${(c.timezones || []).length > 4 ? '…' : ''}`
        // Envía la bandera como imagen con los datos de caption
        await conn.sendMessage(m.chat, { image: { url: c.flags.png }, caption }, { quoted: m.raw })
        await m.react('✅')
      } catch {
        await m.react('❌')
        await m.reply(`❌ No encontré el país *"${q}"*. Escríbelo bien (ej: uruguay, argentina, japan).`)
      }
    }
    h.help = ['pais <nombre>']
    h.tags = ['externas']
    h.command = ['pais', 'country']
    return h
  })(),

  // ── 💡 ¿QUÉ ES…? (DuckDuckGo Instant Answer) ──
  (() => {
    let h = async (m, { text, usedPrefix, command }) => {
      const q = text || m.quoted?.text
      if (!q) return m.reply(ejemplo(usedPrefix, command, '<tema>', 'whatsapp'))
      await m.react('⏳')
      const json = await getJson(`https://api.duckduckgo.com/?q=${enc(q)}&format=json&no_html=1&skip_disambig=1`)
      const titulo = json.Heading
      const resumen = json.AbstractText
      const relacionados = (json.RelatedTopics || []).filter(t => t.Text).slice(0, 3)

      if (!resumen && !relacionados.length) {
        await m.react('❓')
        return m.reply(`❌ No hay respuesta instantánea para *"${q}"*.\n▸ Esta API funciona mejor *en inglés* (es gratis, sin key).\n▸ Prueba ser más específico, ej: \`${usedPrefix}${command} Lionel Messi\``)
      }
      let out = `💡 *${titulo || q}*\n\n${resumen ? resumen + '\n' : ''}`
      if (json.AbstractSource && json.AbstractURL) out += `\n▸ *Fuente:* ${json.AbstractSource}\n`
      if (relacionados.length) {
        out += `\n▸ *Relacionado:*\n` + relacionados.map((t, i) => `  ${i + 1}. ${t.Text}`).join('\n')
      }
      await m.reply(out.slice(0, 3500))
      await m.react('✅')
    }
    h.help = ['quees <tema>']
    h.tags = ['externas']
    h.command = ['quees', 'wiki', 'ddg']
    return h
  })(),

  // ── 📖 DEFINICIÓN DE PALABRA INGLESA (Free Dictionary) ──
  (() => {
    let h = async (m, { conn, text, usedPrefix, command }) => {
      const q = (text || m.quoted?.text || '').trim().split(/\s+/)[0]
      if (!q) return m.reply(ejemplo(usedPrefix, command, '<palabra en inglés>', 'serendipity'))
      await m.react('⏳')
      try {
        const arr = await getJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${enc(q.toLowerCase())}`)
        const w = arr[0]
        let out = `📖 *${w.word}*${w.phonetic ? `  _${w.phonetic}_` : ''}\n`
        for (const meaning of (w.meanings || []).slice(0, 3)) {
          out += `\n▸ *${meaning.partOfSpeech}*\n`
          for (const def of (meaning.definitions || []).slice(0, 2)) {
            out += `  ◦ ${def.definition}\n`
            if (def.example) out += `  _Ej: ${def.example}_\n`
          }
        }
        await m.reply(out.slice(0, 3500))
        // 🔊 Si hay audio de pronunciación, también lo manda
        const audio = (w.phonetics || []).find(p => p.audio)?.audio
        if (audio) {
          await conn.sendMessage(m.chat, { audio: { url: audio }, mimetype: 'audio/mpeg' }, { quoted: m.raw }).catch(() => {})
        }
        await m.react('✅')
      } catch {
        await m.react('❌')
        await m.reply(`❌ No encontré la palabra *"${q}"* (el diccionario es solo en inglés).`)
      }
    }
    h.help = ['definir <palabra en inglés>']
    h.tags = ['externas']
    h.command = ['definir', 'define', 'significado']
    return h
  })(),

  // ── 🍕 FOTO RANDOM DE COMIDA (Foodish) ──
  (() => {
    let h = async (m, { conn }) => {
      await m.react('⏳')
      const json = await getJson('https://foodish-api.com/api/')
      await conn.sendMessage(m.chat, { image: { url: json.image }, caption: `🍕 ¡Se me antojó!\n\n${config.wm}` }, { quoted: m.raw })
      await m.react('✅')
    }
    h.help = ['comida']
    h.tags = ['externas']
    h.command = ['comida', 'food', 'foodish']
    return h
  })(),

  // ── 📚 BUSCAR LIBROS (Open Library) ──
  (() => {
    let h = async (m, { conn, text, usedPrefix, command }) => {
      const q = text || m.quoted?.text
      if (!q) return m.reply(ejemplo(usedPrefix, command, '<título>', 'harry potter'))
      await m.react('⏳')
      const json = await getJson(`https://openlibrary.org/search.json?q=${enc(q)}&limit=5&fields=title,author_name,first_publish_year,cover_i`)
      const docs = (json.docs || []).filter(d => d.title)
      if (!docs.length) {
        await m.react('❌')
        return m.reply(`❌ No encontré libros de *"${q}"*.`)
      }
      const lista = docs.map((d, i) =>
        `*\`${i + 1}.\`* *${d.title}*${d.first_publish_year ? ` (${d.first_publish_year})` : ''}\n    ✍️ ${(d.author_name || ['¿?']).slice(0, 2).join(', ')}`
      ).join('\n')
      const caption = `📚 *Libros encontrados:* ${q}\n\n${lista}\n\n${config.wm}`
      const coverId = docs.find(d => d.cover_i)?.cover_i
      if (coverId) {
        await conn.sendMessage(m.chat, { image: { url: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` }, caption }, { quoted: m.raw })
      } else {
        await m.reply(caption)
      }
      await m.react('✅')
    }
    h.help = ['libro <título>']
    h.tags = ['externas']
    h.command = ['libro', 'book', 'libros']
    return h
  })(),

  // ── 🎌 BUSCAR ANIME (Kitsu) ──
  (() => {
    let h = async (m, { conn, text, usedPrefix, command }) => {
      const q = text || m.quoted?.text
      if (!q) return m.reply(ejemplo(usedPrefix, command, '<nombre>', 'attack on titan'))
      await m.react('⏳')
      const json = await getJson(`https://kitsu.io/api/edge/anime?filter[text]=${enc(q)}&page[limit]=5`)
      const items = json.data || []
      if (!items.length) {
        await m.react('❌')
        return m.reply(`❌ No encontré el anime *"${q}"*.`)
      }
      const lista = items.map((it, i) => {
        const a = it.attributes
        return `*\`${i + 1}.\`* *${a.canonicalTitle}*\n    ⭐ ${a.averageRating || 'N/D'} · ${a.subtype} · ${a.episodeCount || '?'} eps · ${a.status}`
      }).join('\n')
      const primero = items[0].attributes
      const sinopsis = (primero.synopsis || '').slice(0, 350)
      const caption = `🎌 *Animes encontrados:* ${q}\n\n${lista}\n\n📖 *Sinopsis (${primero.canonicalTitle}):*\n${sinopsis}…`.slice(0, 1020)
      if (primero.posterImage?.small) {
        await conn.sendMessage(m.chat, { image: { url: primero.posterImage.original || primero.posterImage.small }, caption }, { quoted: m.raw })
      } else {
        await m.reply(caption)
      }
      await m.react('✅')
    }
    h.help = ['anime <nombre>']
    h.tags = ['externas']
    h.command = ['anime', 'kitsu', 'buscaranime']
    return h
  })(),

  // ── ⛅ CLIMA PRO (Open-Meteo, sin key) ──
  (() => {
    // Traduce el código WMO del clima a emoji + texto
    function wmo(code) {
      if (code === 0) return { e: '☀️', t: 'Despejado' }
      if (code <= 3) return { e: '⛅', t: 'Parcialmente nublado' }
      if (code === 45 || code === 48) return { e: '🌫️', t: 'Niebla' }
      if (code >= 51 && code <= 57) return { e: '🌦️', t: 'Llovizna' }
      if (code >= 61 && code <= 67) return { e: '🌧️', t: 'Lluvia' }
      if (code >= 71 && code <= 77) return { e: '❄️', t: 'Nieve' }
      if (code >= 80 && code <= 82) return { e: '🌦️', t: 'Chubascos' }
      if (code >= 85 && code <= 86) return { e: '🌨️', t: 'Nevadas' }
      if (code >= 95) return { e: '⛈️', t: 'Tormenta' }
      return { e: '🌡️', t: 'Desconocido' }
    }
    let h = async (m, { text, usedPrefix, command }) => {
      const q = text || m.quoted?.text
      if (!q) return m.reply(ejemplo(usedPrefix, command, '<ciudad>', 'Maldonado'))
      await m.react('⏳')
      try {
        const geo = await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${enc(q)}&count=1&language=es&format=json`)
        const g = geo.results?.[0]
        if (!g) {
          await m.react('❌')
          return m.reply(`❌ No encontré la ciudad *"${q}"*.`)
        }
        const wx = await getJson(`https://api.open-meteo.com/v1/forecast?latitude=${g.latitude}&longitude=${g.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`)
        const c = wx.current
        const clima = wmo(c.weather_code)
        await m.reply(
          `⛅ *Clima en ${g.name}, ${g.country}*\n\n` +
          `▸ ${clima.e} *Estado:* ${clima.t}\n` +
          `▸ 🌡️ *Temperatura:* ${c.temperature_2m}°C\n` +
          `▸ 🥵 *Sensación:* ${c.apparent_temperature}°C\n` +
          `▸ 💧 *Humedad:* ${c.relative_humidity_2m}%\n` +
          `▸ 💨 *Viento:* ${c.wind_speed_10m} km/h`
        )
        await m.react('✅')
      } catch (e) {
        await m.react('❌')
        throw e
      }
    }
    h.help = ['clima2 <ciudad>']
    h.tags = ['externas']
    h.command = ['clima2', 'weather2']
    return h
  })()
]
