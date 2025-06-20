import fetch from 'node-fetch'
import { loadCache } from './helpers/cache.js'

export default {
  commands: ['audio', 'yta'],
  flags: [],
  handled: async (venus, { m }) => {
    const cache = loadCache()
    const data = cache[m.chat]

    if (!data) {
      return venus.sendMessage(m.chat, { text: '🎵 No hay búsqueda reciente.\nUsa /play primero.' }, { quoted: m })
    }

    try {
      await venus.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })

      const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${data.url}`)
      const json = await res.json()

      if (!json?.result?.download?.url) throw '⚠️ Fallo la conversión'

      await venus.sendMessage(m.chat, {
        audio: { url: json.result.download.url },
        mimetype: 'audio/mpeg',
        fileName: `${json.result.title}.mp3`
      }, { quoted: m })

      await venus.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (err) {
      console.error('❌ AUDIO ERROR', err)
      await venus.sendMessage(m.chat, { text: '❌ Error al enviar el audio.' }, { quoted: m })
    }
  }
}