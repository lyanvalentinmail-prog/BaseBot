<div align="center">

# 🤖 BASEBOT ✦
### Bot base de WhatsApp con Baileys + API Akari 🌙

**Un bot completo, personalizable y fácil de usar: perfecto como BASE para crear tus propios bots de WhatsApp.**

`Node.js` • `@whiskeysockets/baileys` • `apiakari.vercel.app`

</div>

---

## 📑 ÍNDICE

1. [✨ Características](#-características)
2. [📋 Requisitos](#-requisitos)
3. [📱 Instalación en TERMUX (Android)](#-instalación-en-termux-android)
4. [💻 Instalación en WINDOWS](#-instalación-en-windows)
5. [🖥️ Instalación en VPS (Ubuntu/Debian)](#️-instalación-en-vps-ubuntudebian)
6. [📦 Instalación en PANELES de hosting](#-instalación-en-paneles-de-hosting-pterodactyl-etc)
7. [🔑 VINCULAR el bot con WhatsApp](#-vincular-el-bot-con-whatsapp)
8. [⚙️ PERSONALIZACIÓN (config.js)](#️-personalización-configjs)
9. [🌙 API KEY — qué es y cómo conseguirla](#-api-key--qué-es-y-cómo-conseguirla)
10. [📚 LISTA COMPLETA DE COMANDOS](#-lista-completa-de-comandos)
11. [➕ CÓMO AGREGAR TUS PROPIOS COMANDOS](#-cómo-agregar-tus-propios-comandos)
12. [🗂️ Estructura del proyecto](#️-estructura-del-proyecto)
13. [🔧 SOLUCIÓN DE ERRORES](#-solución-de-errores)
14. [❓ Preguntas frecuentes](#-preguntas-frecuentes)
15. [⚠️ Aviso importante](#️-aviso-importante)

---

## ✨ Características

- ✅ **Conexión por código de 8 dígitos** (sin QR) o por **código QR**.
- ✅ **45+ comandos listos** usando la API Akari ([apiakari.vercel.app](https://apiakari.vercel.app)):
  - 🤖 **IA:** Gemini, ChatGPT, DeepSeek, NovaAI
  - 📥 **Descargas:** TikTok, Facebook, Instagram, X/Twitter, Threads, Pinterest, Spotify, YouTube (MP3/MP4), Google Drive, Terabox, APKPure, Aptoide, stickers
  - 🖼️ **Imágenes:** wallpapers, quitar fondo (removebg), imágenes random
  - 🎨 **Creadores:** brat, nota falsa, iqc
  - 🔍 **Búsquedas:** letras de canciones, Pinterest, Spotify, Aptoide
  - 👤 **Stalk:** GitHub, TikTok, Threads
  - 🛠️ **Herramientas:** traductor, clima, hora mundial, letras bonitas, capturas de web, captura de tweets, info de YouTube y de grupos de WhatsApp
- ✅ **Comandos de grupo:** hidetag, link, kick, promote, demote
- ✅ **Menú automático** que se genera solo con tus comandos
- ✅ **Recarga en caliente:** edita un plugin y el bot lo recarga sin reiniciar 🔥
- ✅ **Súper personalizable:** todo se cambia desde **un solo archivo** (`config.js`)
- ✅ **Acepta imágenes citadas:** en `removebg`, `iqc` y `fakenote` puedes citar una foto y el bot la sube a internet por ti
- ✅ Cero dependencias pesadas (no necesita ffmpeg ni base de datos)

---

## 📋 Requisitos

| Requisito | Detalle |
|---|---|
| **Node.js** | Versión **18 o superior** (recomendado 20+) |
| **Un número de WhatsApp** | Puede ser tu número o un número secundario |
| **Internet** | Estable, obviamente 😄 |
| **API Key** | Ya viene una incluida (`UDYRB6`) para empezar |

> 💡 **NO necesitas** tarjeta de crédito, ni pagar nada, ni bases de datos.

---

## 📱 Instalación en TERMUX (Android)

**Paso a paso, desde cero:**

### 1️⃣ Instala Termux
Descarga Termux **solo desde F-Droid** (la versión de Play Store está desactualizada):
👉 https://f-droid.org/packages/com.termux/

### 2️⃣ Prepara Termux
Abre Termux y ejecuta estos comandos **uno por uno**:

```bash
pkg update && pkg upgrade -y
```
> Si pregunta algo (`Do you want to continue? [Y/n]`) escribe `Y` y Enter.

```bash
pkg install nodejs git -y
```

Verifica que Node.js quedó bien instalado:
```bash
node -v
```
> Debe mostrar `v18.x.x` o superior. ✅

### 3️⃣ Descarga el bot

**Opción A — con git (recomendada):**
```bash
git clone https://github.com/lyanvalentinmail-prog/BaseBot.git
cd BaseBot
```

**Opción B — sin git (descargar ZIP):**
1. En tu navegador entra al repositorio y pulsa **Code → Download ZIP**
2. En Termux:
```bash
termux-setup-storage
```
> Acepta el permiso de almacenamiento.
```bash
cd /sdcard/Download
pkg install unzip -y
unzip BaseBot-main.zip
cd BaseBot-main
```

### 4️⃣ Instala las dependencias
```bash
npm install
```
> Puede tardar 1-5 minutos. Si sale algún error, revisa la sección [🔧 SOLUCIÓN DE ERRORES](#-solución-de-errores).

### 5️⃣ Configura tu número
```bash
nano config.js
```
Busca la línea:

```js
pairingNumber: '',       // ⭐ Tu número con código de país
```

y pon tu número **con código de país, sin `+` ni espacios**. Ejemplo:
```js
pairingNumber: '521234567890',
```

> En `nano`: escribes, luego presionas `CTRL + X`, luego `Y`, luego `Enter` para guardar.

También aprovecha de cambiar:
```js
owner: ['521234567890'],   // 👈 tu mismo número (para ser el dueño del bot)
ownerName: 'Tu Nombre',
botName: 'El Nombre De Tu Bot',
```

### 6️⃣ ¡Inicia el bot!
```bash
npm start
```

Aparecerá algo como:

```
╔══════════════════════════════╗
   🔑 CÓDIGO DE VINCULACIÓN
        ➜  ABCD-1234
╚══════════════════════════════╝
```

### 7️⃣ Vincula WhatsApp
1. Abre **WhatsApp** en tu teléfono
2. Ve a **Ajustes → Dispositivos vinculados → Vincular un dispositivo**
3. Pulsa **«Vincular con número de teléfono»**
4. Escribe el **código de 8 dígitos** que aparece en Termux

✅ ¡Listo! El bot dirá **«BOT CONECTADO»**. Escríbete `.menu` a ti mismo o escribe el comando desde otro chat.

### 🔄 Mantenerlo encendido en Termux
Termux se puede cerrar si el teléfono se suspende. Para evitarlo:
- Ejecuta `termux-wake-lock` antes de `npm start`
- En las opciones de batería de Android, pon Termux como **«sin restricciones»**
- Para volver a encenderlo otro día: abre Termux → `cd BaseBot` → `npm start`

---

## 💻 Instalación en Windows

1. **Instala Node.js LTS:** https://nodejs.org (descarga el instalador, siguiente-siguiente-fin)
2. **Instala Git:** https://git-scm.com/download/win
3. Abre **CMD** o **PowerShell** y verifica:
   ```cmd
   node -v
   ```
4. Descarga el bot:
   ```cmd
   git clone https://github.com/lyanvalentinmail-prog/BaseBot.git
   cd BaseBot
   ```
   *(o descarga el ZIP y extráelo, luego `cd` a la carpeta)*
5. Instala dependencias:
   ```cmd
   npm install
   ```
6. Edita `config.js` con el Bloc de notas o VS Code (campo `pairingNumber`, `owner`, etc.)
7. Inicia:
   ```cmd
   npm start
   ```
8. Vincula con el código que aparece (ver [🔑 VINCULAR](#-vincular-el-bot-con-whatsapp))

---

## 🖥️ Instalación en VPS (Ubuntu/Debian)

```bash
# 1. Actualizar
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs git

# 3. Descargar el bot
git clone https://github.com/lyanvalentinmail-prog/BaseBot.git
cd BaseBot

# 4. Instalar dependencias
npm install

# 5. Configurar (pon tu número en pairingNumber)
nano config.js
```

### Mantenerlo encendido 24/7 con PM2 (recomendado):
```bash
npm install -g pm2
pm2 start index.js --name basebot
pm2 save
pm2 startup        # copia y ejecuta el comando que te muestra
```
Comandos útiles de PM2:
```bash
pm2 logs basebot    # ver registros
pm2 restart basebot # reiniciar
pm2 stop basebot    # detener
```

---

## 📦 Instalación en PANELES de hosting (Pterodactyl, etc.)

Si compras/usas un panel de hosting de bots:

1. Crea un servidor con el **egg de Node.js** (versión 18+)
2. Comprime todo el proyecto (sin `node_modules` ni `session`) en un **ZIP**
3. Súbelo en la pestaña **Files** del panel y descomprímelo
4. En **Startup** pon:
   - Archivo de arranque: `index.js`
   - o comando: `npm install && node index.js`
5. Edita `config.js` desde el propio panel (campo `pairingNumber`)
6. Inicia el servidor y vincula con el código que sale en la **consola**

---

## 🔑 VINCULAR el bot con WhatsApp

Hay **dos formas**. Se elige en `config.js`:

### Método 1: Código de 8 dígitos ⭐ (recomendado)
```js
usePairingCode: true,
pairingNumber: '521234567890',   // 👈 OBLIGATORIO: tu número con código de país
```
Al iniciar verás el código en consola. Luego en WhatsApp:
**Ajustes → Dispositivos vinculados → Vincular un dispositivo → «Vincular con número de teléfono»** → escribes el código.

### Método 2: Código QR
```js
usePairingCode: false,
```
Al iniciar aparecerá un **QR en la terminal**. Escanéalo desde:
**Ajustes → Dispositivos vinculados → Vincular un dispositivo** (apuntando con la cámara).

> 💡 Si dejaste `usePairingCode: true` pero no pusiste número, también puedes iniciar con `npm run qr` para forzar el modo QR.

### 📵 Cerrar sesión / cambiar de número
Borra la carpeta `session` y vuelve a iniciar:
```bash
rm -rf session
npm start
```

---

## ⚙️ PERSONALIZACIÓN (config.js)

**TODO esto se cambia en `config.js`, sin tocar nada más:**

| Opción | Qué hace | Ejemplo |
|---|---|---|
| `apiUrl` | URL base de la API Akari | `'https://apiakari.vercel.app'` |
| `apiKey` | ⭐ Tu API key | `'UDYRB6'` |
| `apiTimeout` | Tiempo máx. de espera de la API (ms) | `120000` |
| `owner` | Números de los dueños (array) | `['521234567890', '34612345678']` |
| `ownerName` | Nombre del creador | `'Leonel'` |
| `botName` | Nombre del bot (sale en el menú) | `'𝙼𝚒 𝙱𝚘𝚝 ✦'` |
| `packname` | Nombre del paquete | `'MiBot'` |
| `author` | Autor | `'Leonel'` |
| `wm` | Marca de agua en los captions | `'✦ Mi Bot ✦'` |
| `prefix` | Prefijo(s) de comandos | `'.'` — o varios: `['.', '#', '/', '!']` |
| `usePairingCode` | `true` = código 8 dígitos / `false` = QR | `true` |
| `pairingNumber` | Tu número para vincular | `'521234567890'` |
| `sessionName` | Carpeta de la sesión | `'session'` |
| `self` | `true` = solo el dueño usa el bot | `false` |
| `replyUnknown` | Responde cuando el comando no existe | `false` |
| `showErrors` | Muestra detalles técnicos de errores | `true` |
| `autoRead` | Marca los comandos como leídos (✓✓ azul) | `true` |
| `mess.*` | Todos los textos del bot (espera, errores, permisos…) | ¡Tradúcelos o cámbialos a tu estilo! |

> 🎨 **Tip:** puedes poner emojis y letras especiales en `botName`, `wm` y los mensajes. Usa el comando `.font tu texto` del propio bot para generar letras bonitas.

---

## 🌙 API KEY — qué es y cómo conseguirla

### ¿Qué es?
La API **Akari / Hoshino** ([apiakari.vercel.app](https://apiakari.vercel.app)) es el cerebro externo del bot: descargas, IA, imágenes, herramientas… Todo pasa por ella, y para usarla necesitas una **API key** (una contraseña corta que identifica tu cuenta).

### ✅ Ya tienes una incluida
El bot viene configurado con la key:
```
UDYRB6
```
Con ella puedes arrancar y probar **todos** los comandos inmediatamente.

### 🔑 Cómo conseguir tu PROPIA key (recomendado para uso serio)
Las keys compartidas pueden tener **límites de peticiones**. Para no depender de nadie:

1. Entra a 👉 **https://apiakari.vercel.app**
2. Crea una **cuenta** (regístrate con tu correo/usuario)
3. Ve a tu **Dashboard / Perfil**
4. Ahí encontrarás tu **API Key** personal (según tu plan: free o premium)
5. Cópiala y pégala en `config.js`:
   ```js
   apiKey: 'TU_NUEVA_KEY_AQUI',
   ```
6. Guarda y reinicia el bot.

### 🩺 Verifica que tu key funciona
Con el bot encendido, escribe en WhatsApp:
```
.apitest
```
Debe responder **«✅ API Akari conectada correctamente»**.

### 🔍 Otras APIs (opcional, si expandes el bot)
El bot **NO necesita más keys**, pero si algún día agregas otras APIs externas, el proceso siempre es igual: registrarte en la web de la API → copiar la key → pegarla en `config.js` (puedes crear más campos, ej: `openaiKey: '...'`).

---

## 📚 LISTA COMPLETA DE COMANDOS

> El prefijo por defecto es `.` (también `#` y `/`). Ejemplo: `.tiktok <url>`

### 🏠 Principal
| Comando | Descripción |
|---|---|
| `.menu` | Muestra este menú (se genera automático) |
| `.ping` | Velocidad del bot |
| `.uptime` | Tiempo activo |
| `.owner` | Tarjeta de contacto del creador |
| `.id` | Muestra los IDs del chat |
| `.apitest` | Verifica tu API key |

### 🤖 Inteligencia Artificial
| Comando | Uso | Descripción |
|---|---|---|
| `.gemini` | `<texto>` | Google Gemini |
| `.chatgpt` / `.gpt` / `.ia` | `<texto>` | ChatGPT |
| `.deepseek` / `.ds` | `<texto>` | DeepSeek |
| `.novaai` / `.nova` | `<texto>` | NovaAI |

### 📥 Descargas
| Comando | Uso | Descripción |
|---|---|---|
| `.tiktok` / `.tt` | `<url>` | Videos de TikTok |
| `.facebook` / `.fb` | `<url>` | Videos de Facebook |
| `.instagram` / `.ig` | `<url>` | Videos/fotos de Instagram |
| `.x` / `.twitter` | `<url>` | Videos de X/Twitter |
| `.threads` | `<url>` | Videos de Threads |
| `.pinterestdl` / `.pindl` | `<url>` | Media de Pinterest |
| `.spotifydl` / `.spdl` | `<url>` | Canción de Spotify |
| `.ytmp3` / `.mp3` | `<url>` | YouTube → audio |
| `.ytmp4` / `.mp4` | `<url>` | YouTube → video |
| `.gdrive` | `<url>` | Archivos de Google Drive |
| `.terabox` | `<url>` | Archivos de Terabox |
| `.apkpure` | `<paquete>` | APK desde APKPure (ej: `com.whatsapp`) |
| `.aptoidedl` | `<paquete>` | APK desde Aptoide |
| `.stickers` | `<búsqueda>` | Envía hasta 5 stickers |

### 🖼️ Imágenes
| Comando | Uso | Descripción |
|---|---|---|
| `.bluearchive` | — | Imagen random de Blue Archive |
| `.china` / `.korea` / `.vietnam` | — | Imágenes random asiáticas |
| `.wallpaper` / `.wp` | `<búsqueda>` | Fondos de pantalla |
| `.removebg` / `.nobg` | `<url>` o **cita una imagen** | Quita el fondo |

### 🎨 Creadores
| Comando | Uso | Descripción |
|---|---|---|
| `.brat` | `<texto>` | Imagen estilo "brat" |
| `.fakenote` | `nombre\|mensaje` | Nota falsa (acepta foto citada como avatar) |
| `.iqc` | `<url>` o **cita una imagen** | Burbuja estilo iPhone |

### 🔍 Búsquedas
| Comando | Uso | Descripción |
|---|---|---|
| `.aptoide` | `<búsqueda>` | Busca apps (luego usa `.aptoidedl`) |
| `.lyrics` / `.letra` | `<canción>` | Letras de canciones |
| `.pinterest` / `.pin` | `<búsqueda>` | Imágenes de Pinterest |
| `.spotify` | `<búsqueda>` | Canciones de Spotify |

### 👤 Stalk
| Comando | Uso | Descripción |
|---|---|---|
| `.githubstalk` / `.github` | `<usuario>` | Perfil de GitHub |
| `.threadsstalk` | `<usuario>` | Perfil de Threads |
| `.tiktokstalk` / `.ttstalk` | `<usuario>` | Perfil de TikTok |

### 🛠️ Herramientas
| Comando | Uso | Descripción |
|---|---|---|
| `.font` / `.letras` | `<texto>` | Letras bonitas |
| `.ssweb` | `<url>` | Captura de una página web |
| `.timezone` / `.hora` | `<país>` | Hora de un país |
| `.translate` / `.tr` | `<idioma> <texto>` | Traductor (ej: `.tr en hola`) |
| `.tweetss` | `<url>` | Captura de un tweet |
| `.weather` / `.clima` | `<país/ciudad>` | El clima |
| `.yt` / `.ytinfo` | `<url>` | Info de YouTube |
| `.wainfo` | `<enlace de grupo>` | Info de un grupo de WhatsApp |

### 👥 Grupo (solo admins)
| Comando | Uso | Descripción |
|---|---|---|
| `.hidetag` | `<texto>` | Menciona a todos (invisible) |
| `.link` | — | Enlace del grupo (bot debe ser admin) |
| `.kick` | `@usuario` | Expulsa a alguien |
| `.promote` | `@usuario` | Da admin |
| `.demote` | `@usuario` | Quita admin |

---

## ➕ CÓMO AGREGAR TUS PROPIOS COMANDOS

El bot está pensado para ser una **BASE**. Tienes 3 caminos:

### 🅰️ Con las fábricas (¡UNA línea por comando!)
Crea un archivo nuevo en la carpeta `plugins/` (ej: `plugins/miscomandos.js`):

```js
const { aiCommand, mediaCommand, textCommand } = require('../lib/commands')

module.exports = [

  // 🤖 Nueva IA (endpoint que devuelve texto con ?text=)
  aiCommand('llama', '/api/ai/llama', { ej: 'hola' }),

  // 📥 Nuevo descargador (endpoint que devuelve archivos con ?url=)
  mediaCommand('kwai', '/api/downloader/kwai', {
    param: 'url', prefer: 'video',
    ej: 'https://kwai.com/video/123'
  }),

  // 📄 Nueva búsqueda (endpoint que devuelve texto con ?q=)
  textCommand('mangas', '/api/search/manga', {
    param: 'q', paramName: '<nombre>', tag: 'busqueda',
    ej: 'naruto'
  })
]
```

**Guardas el archivo y el bot lo carga SOLO (recarga en caliente 🔥)** y aparece en `.menu`.

**Opciones de las fábricas:**
- `param` → nombre del parámetro de la API (`'url'`, `'q'`, `'query'`, `'text'`, `'user'`, `'pkg'`…). Pon `null` si no pide nada.
- `paramName` → cómo se ve en la ayuda (`'<url>'`, `'<búsqueda>'`…)
- `prefer` → `'video'` | `'audio'` | `'image'` | `'document'` | `'sticker'`
- `alias` → otros nombres: `alias: ['tt', 'tiktokdl']`
- `tag` → categoría del menú: `'descargas'`, `'ia'`, `'imagen'`, `'maker'`, `'busqueda'`, `'stalk'`, `'herramientas'`, `'grupo'`

### 🅱️ Comando manual (control total)
```js
const { akari, sendResult, pickAnswer } = require('../lib/akari')

let h = async (m, { conn, text, args, usedPrefix, command, isOwner }) => {
  if (!text) return m.reply(`❌ Uso: ${usedPrefix}${command} <texto>`)

  await m.react('⏳')                       // reacción de "cargando"

  // Llamar a la API (la key se agrega sola):
  const res = await akari('/api/ai/gemini', { text })

  // Opción 1: enviar respuesta automática (detecta imágenes/videos/texto)
  await sendResult(conn, m, res, { prefer: 'image' })

  // Opción 2 (solo texto de IA):
  // if (res.type === 'json') await m.reply(pickAnswer(res.data))
}
h.help = ['micomando <texto>']   // aparece en el menú
h.tags = ['herramientas']        // categoría
h.command = ['micomando', 'mc']  // nombres del comando
// h.rowner = true               // solo dueño (opcional)
// h.group = true                // solo grupos (opcional)
// h.admin = true                // solo admins (opcional)
// h.botAdmin = true             // bot admin requerido (opcional)
module.exports = h
```

### 🅲️ Comando SIN API (100% WhatsApp con Baileys)
```js
let h = async (m, { conn, participants }) => {
  // Ejemplo: contar miembros del grupo
  await m.reply(`👥 Este grupo tiene *${participants.length}* miembros.`)
}
h.help = ['miembros']
h.tags = ['grupo']
h.command = ['miembros']
h.group = true
module.exports = h
```

**Cosas útiles que tienes dentro de cualquier comando:**
| Variable | Contenido |
|---|---|
| `m.chat` | ID del chat |
| `m.sender` / `m.senderNumber` | Quién escribió |
| `m.pushName` | Su nombre |
| `m.isGroup` | Si es grupo |
| `m.quoted` | Mensaje citado (`.text`, `.download()`…) |
| `m.mentionedJid` | Menciones |
| `m.reply('hola')` | Responder |
| `m.react('🔥')` | Reaccionar |
| `m.download()` | Descargar imagen/video citado |
| `conn.sendMessage(m.chat, { image: buffer })` | Enviar imagen |
| `text` / `args` | Lo que escribió después del comando |
| `conn` | La conexión de Baileys (poder total) → [docs](https://github.com/WhiskeySockets/Baileys) |

---

## 🗂️ Estructura del proyecto

```
BaseBot/
├── 📄 index.js          → Arranque: conexión, sesión, carga de plugins
├── 📄 handler.js        → Lee mensajes y ejecuta comandos
├── 📄 config.js         → ⭐ TODA LA PERSONALIZACIÓN AQUÍ
├── 📄 package.json      → Dependencias del proyecto
├── 📂 lib/
│   ├── akari.js         → Cliente de la API + formateo/envío inteligente
│   ├── commands.js      → Fábricas: crea comandos con 1 línea
│   ├── serialize.js     → Convierte mensajes en objetos fáciles (m.reply…)
│   └── upload.js        → Sube imágenes citadas a internet (catbox)
├── 📂 plugins/          → 🔥 Cada archivo = comandos (recarga automática)
│   ├── main.js          → menu, ping, owner, apitest…
│   ├── ai.js            → gemini, chatgpt, deepseek, novaai
│   ├── downloader.js    → tiktok, ytmp3, terabox, stickers…
│   ├── image.js         → wallpaper, removebg, bluearchive…
│   ├── maker.js         → brat, fakenote, iqc
│   ├── search.js        → lyrics, pinterest, spotify, aptoide
│   ├── stalk.js         → github, tiktok, threads
│   ├── tools.js         → translate, weather, font, ssweb…
│   └── group.js         → hidetag, kick, promote, demote, link
└── 📂 session/          → (se crea sola) Sesión de WhatsApp ⚠️ NO LA COMPARTAS
```

---

## 🔧 SOLUCIÓN DE ERRORES

### 🔴 Al INSTALAR (`npm install`)

| Error | Solución |
|---|---|
| `node: command not found` / `-v` no muestra nada | No instalaste Node.js. En Termux: `pkg install nodejs`. En PC: instálalo de nodejs.org |
| Versión vieja de Node (< 18) | Termux: `pkg upgrade nodejs`. PC: descarga la LTS nueva de nodejs.org. VPS: reinstala con NodeSource (ver arriba) |
| `npm ERR!` genéricos en Termux | `pkg install python make clang libuuid -y` y reintenta `npm install` |
| `EACCES: permission denied` (VPS/Linux) | NO uses `sudo npm install`. Corrige permisos: `sudo chown -R $USER:$USER .` |
| `Cannot find module '@whiskeysockets/baileys'` | No corrió bien la instalación: borra `node_modules` y repite `rm -rf node_modules && npm install` |
| Error de red al instalar | Revisa tu internet, o prueba `npm install --no-audit --no-fund` |

### 🔴 Al INICIAR el bot

| Problema | Solución |
|---|---|
| **No aparece el código de emparejamiento** | Verifica que `pairingNumber` tenga tu número **con código de país** (ej: `52` México, `54` Argentina, `34` España) SIN `+`. Espera ~5 segundos tras iniciar |
| **Quiero QR y no código** | Pon `usePairingCode: false` en config.js o inicia con `npm run qr` |
| **El QR se ve deforme/no se puede escanear** | Agranda la ventana de la terminal. En Termux pellizca para alejar. O usa el código de 8 dígitos |
| `Connection Failure` / código `428`, `405`, `408` | Se perdió la sesión. Borra la carpeta `session` y vuelve a vincular: `rm -rf session && npm start` |
| `401` / `device_removed` / "sesión cerrada" | Cerraste sesión desde WhatsApp (Dispositivos vinculados). Borra `session` y vincula de nuevo |
| Se cierra apenas abre | Mira el error con `showErrors: true`. Casi siempre es `config.js` mal editado: revisa comas y comillas |
| "WhatsApp se queda en *esperando mensaje*" | Mensajes de cuentas recién vinculadas pueden tardar. Reenvía el comando. Si persiste, borra `session` y vincula otra vez |

### 🔴 Con los COMANDOS

| Problema | Solución |
|---|---|
| El bot **no responde** | 1) ¿Estás usando el prefijo? (`config.prefix`) 2) ¿Tienes `self: true`? (solo responde al dueño) 3) Revisa la consola: ahí verás el error real |
| `❌ Error de la API: key inválida...` | Tu API key venció o tiene límite → consigue una nueva en [apiakari.vercel.app](https://apiakari.vercel.app) y ponla en `config.apiKey` |
| `Falta el parámetro "key"` | La API no recibió key. El bot envía `key` **y** `apikey` automáticamente; si persiste, verifica `config.apiKey` con `.apitest` |
| Los comandos de descarga responden pero **no llega el archivo** | El servicio de origen bloqueó la descarga o el archivo es enorme. Prueba otro enlace. Para gdrive/terabox sube `apiTimeout` |
| `.removebg` / `.iqc` con foto citada falla | El hosting de imágenes (catbox) puede caer: reintenta, o pasa una URL directa |
| Comandos de grupo dicen «Necesito ser administrador» | Haz admin **al bot** en el grupo (para `kick`, `promote`, `link`…) |
| «Necesitas ser administrador» | Esos comandos son solo para admins (o el dueño del bot) |
| La IA responde cosas raras o vacías | La API puede estar saturada: reintenta. Si es siempre, revisa `.apitest` y tu key |

### 🔴 Misceláneos

| Problema | Solución |
|---|---|
| **Cambié algo y no se refleja** | Los archivos de `plugins/` se recargan solos al guardar. Los cambios en `config.js`, `lib/`, `index.js` o `handler.js` **sí requieren reiniciar** (`CTRL + C` y `npm start`) |
| Actualizar Baileys (si WhatsApp cambia algo) | `npm update @whiskeysockets/baileys` y reinicia |
| Actualizar el bot a la última versión | `git pull` (si lo clonaste con git) |
| ¿Cómo veo errores detallados? | `showErrors: true` en config (los manda al chat) y mira siempre la consola/terminal |

---

## ❓ Preguntas frecuentes

**¿Es gratis?**
Sí. Baileys es código abierto y la API Akari tiene plan gratuito (con límites por key).

**¿Puedo usar mi número personal?**
Sí, aunque se recomienda un número secundario (ver aviso abajo). El bot aparecerá como un «dispositivo vinculado» más.

**¿Puedo tener varios bots con esta base?**
¡Ese es el objetivo! 🎉 Clona el proyecto en otra carpeta, cambia `botName`, `prefix`, `sessionName` (ej: `'session2'`) y los comandos que quieras. Cada copia es un bot independiente.

**¿Necesito dejar la PC/Termux encendida?**
Sí: el bot funciona mientras el programa esté corriendo. Para 24/7 usa una **VPS con PM2** o un **panel de hosting**.

**¿Puedo cambiar el idioma de los mensajes?**
Sí, todos los textos están en `config.js` (`mess`) y dentro de cada plugin.

**¿Cómo apago el bot?**
`CTRL + C` en la terminal (o `pm2 stop basebot` si usas PM2).

---

## ⚠️ Aviso importante

- Este proyecto usa **Baileys**, una librería no oficial de WhatsApp. WhatsApp **puede banear números** que usan bots, aunque es poco común con uso moderado. **Úsalo bajo tu responsabilidad** y preferiblemente con un número secundario.
- **NUNCA compartas la carpeta `session/`**: quien la tenga puede entrar a tu WhatsApp.
- No uses el bot para spam ni actividades ilegales.
- Respeta los límites y términos de la API Akari.

---

<div align="center">

### 🌙 Créditos
**API Akari / Hoshino** → [apiakari.vercel.app](https://apiakari.vercel.app) • Creadora: *Moonlight*
**Librería** → [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)

**BASEBOT** — hecha con ❤️ para que crees tus propios bots ✦

</div>
