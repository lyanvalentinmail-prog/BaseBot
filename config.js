// ═══════════════════════════════════════════════════════════════════
//   ⚙️  CONFIGURACIÓN PRINCIPAL DE BASEBOT
//   ─────────────────────────────────────────────────────────────────
//   👉 ESTE ES EL ÚNICO ARCHIVO QUE NECESITAS TOCAR PARA PERSONALIZAR
//      TU BOT. Lee los comentarios de cada opción.
// ═══════════════════════════════════════════════════════════════════

module.exports = {

  // ──────────────────────────────────────────────
  // 🔑 API AKARI / HOSHINO  (https://apiakari.vercel.app)
  // ──────────────────────────────────────────────
  apiUrl: 'https://apiakari.vercel.app',   // URL base de la API (sin "/" al final)
  apiKey: 'UDYRB6',                        // ⭐ TU API KEY. Cámbiala por la tuya cuando quieras
  apiTimeout: 120000,                      // Tiempo máx. de espera de la API en ms (120 s)

  // ──────────────────────────────────────────────
  // 👑 DUEÑOS DEL BOT
  // ──────────────────────────────────────────────
  owner: ['51999999999'],                  // Números de los dueños SIN "+", SIN espacios y CON código de país
                                           // Ejemplo: ['521234567890', '34612345678']
  ownerName: 'Tu Nombre',                  // Nombre que se mostrará del creador

  // ──────────────────────────────────────────────
  // 🤖 IDENTIDAD DEL BOT
  // ──────────────────────────────────────────────
  botName: '𝘽𝙖𝙨𝙚𝘽𝙤𝙩 ✦',               // Nombre del bot (aparece en el menú)
  packname: 'BaseBot',                     // Nombre del "paquete" (se usa en captions)
  author: 'Tu Nombre',                     // Autor del bot
  wm: '✦ BaseBot ✦',                       // Marca de agua (se agrega a los captions)

  // Prefijo(s) de comandos. Puedes poner uno o varios:
  // prefix: '.'        →  solo punto
  // prefix: ['.', '#', '/', '!']  →  varios
  prefix: ['.', '#', '/'],

  // ──────────────────────────────────────────────
  // 🔐 VINCULACIÓN (cómo conectar el bot a WhatsApp)
  // ──────────────────────────────────────────────
  usePairingCode: true,    // true = código de 8 dígitos (RECOMENDADO) | false = escanear QR
  pairingNumber: '',       // ⭐ Tu número con código de país, ej: '521234567890'
                           //    Solo se usa si usePairingCode = true y preguntará el código al iniciar
  sessionName: 'session',  // Nombre de la carpeta donde se guarda la sesión

  // ──────────────────────────────────────────────
  // 🌐 MODO DEL BOT
  // ──────────────────────────────────────────────
  self: false,             // true = SOLO el dueño puede usar comandos | false = todos pueden usarlos
  replyUnknown: false,     // true = responde "comando no encontrado" cuando el comando no existe
  showErrors: true,        // true = muestra detalles técnicos cuando un comando falla
  autoRead: true,          // true = marca como leídos los mensajes con comandos (palomitas azules)

  // ──────────────────────────────────────────────
  // 💬 MENSAJES PERSONALIZABLES
  // ──────────────────────────────────────────────
  mess: {
    wait: '⏳ *Procesando...* un momento.',
    owner: '👑 Este comando es *solo para mi creador*.',
    group: '👥 Este comando *solo funciona en grupos*.',
    admin: '🛡️ Necesitas ser *administrador* del grupo para usar este comando.',
    botAdmin: '🤖 Necesito ser *administrador* del grupo para hacer eso.',
    error: '❌ *Ocurrió un error inesperado.* Inténtalo de nuevo más tarde.',
    apiError: '❌ *La API no respondió correctamente.* Verifica tu API key o inténtalo luego.'
  },

  // ──────────────────────────────────────────────
  // 🎨 ESTILO DEL MENÚ  (cámbialo a tu gusto)
  // ──────────────────────────────────────────────
  //  Usa {placeholders}: se reemplazan solos por la info real.
  //
  //  Disponibles en el HEADER y FOOTER:
  //    {botName}  {user}  {uptime}  {commands}  {prefix}
  //    {prefixes} {owner} {api}     {wm}        {date}  {time}
  //  Disponibles en catTop/catCmd/catBottom (además de los de arriba):
  //    {icon}  {name}  {tag}  {help}
  //
  //  👉 Así se ve tu menú actual:
  //  ╭═══ ≪ *𝘽𝙖𝙨𝙚𝘽𝙤𝙩 ✦* ≫ ═══╮
  //  │ 👤 *Hola:* Leonel ...
  //  ╰═══════════════════╯
  //  ╭─「 🤖 *Inteligencia Artificial* 」
  //  │ ◦ .gemini <texto>
  //  ╰──────────────
  // ──────────────────────────────────────────────
  menu: {
    // Encabezado del menú
    header: `╭═══ ≪ *{botName}* ≫ ═══╮
│
│ 👤 *Hola:* {user}
│ ⏱️ *Activo:* {uptime}
│ 📚 *Comandos:* {commands}
│ 🔑 *Prefijo:* {prefixes}
│ 👑 *Creador:* {owner}
│ 🌙 *API:* {api}
│
╰═══════════════════╯`,

    // Línea de arriba de cada categoría
    catTop: '╭─「 {icon} *{name}* 」',
    // Cada línea de comando
    catCmd: '│ ◦ {prefix}{help}',
    // Línea de cierre de cada categoría
    catBottom: '╰──────────────',
    // Final del menú
    footer: '> {wm}',

    // Nombre, icono y ORDEN de las categorías (agréguelas al crear grupos nuevos)
    // La "etiqueta" (izquierda) es la que usan los plugins en:  h.tags = ['etiqueta']
    tags: {
      principal:    { name: 'Principal',               icon: '🏠' },
      ia:           { name: 'Inteligencia Artificial', icon: '🤖' },
      descargas:    { name: 'Descargas',               icon: '📥' },
      imagen:       { name: 'Imágenes',                icon: '🖼️' },
      maker:        { name: 'Creadores',               icon: '🎨' },
      busqueda:     { name: 'Búsquedas',               icon: '🔍' },
      stalk:        { name: 'Stalk',                   icon: '👤' },
      herramientas: { name: 'Herramientas',            icon: '🛠️' },
      grupo:        { name: 'Grupo',                   icon: '👥' }
    }
  }
}
