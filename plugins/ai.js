// ═══════════════════════════════════════════════════════════════════
//   🤖 INTELIGENCIA ARTIFICIAL
//   ─────────────────────────────────────────────────────────────────
//   Endpoints de IA de la API Akari. Todos reciben ?text=<tu pregunta>
//   y devuelven la respuesta del modelo.
//
//   👉 PARA AGREGAR OTRA IA solo copia una línea y cámbiala:
//      aiCommand('nombredelcomando', '/api/ai/endpoint-de-la-api')
// ═══════════════════════════════════════════════════════════════════

const { aiCommand } = require('../lib/commands')

module.exports = [
  aiCommand('gemini', '/api/ai/gemini', {
    desc: 'Habla con Google Gemini',
    ej: '¿Cuál es la capital de Francia?'
  }),
  aiCommand('chatgpt', '/api/ai/chatgpt', {
    desc: 'Habla con ChatGPT',
    alias: ['gpt', 'ia', 'openai'],
    ej: 'Escríbeme un poema corto'
  }),
  aiCommand('deepseek', '/api/ai/deepseek', {
    desc: 'Habla con DeepSeek AI',
    alias: ['ds'],
    ej: 'Explícame la fotosíntesis'
  }),
  aiCommand('novaai', '/api/ai/novaai', {
    desc: 'Habla con Nova AI',
    alias: ['nova'],
    ej: 'Dame un consejo de vida'
  })
]
