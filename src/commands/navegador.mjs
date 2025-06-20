import axios from 'axios';

// API KEY de SerpAPI (gratis desde serpapi.com)
const SERPAPI_KEY = '839ef9aef471e50b6ac56d5a0e565996a32c6ebefb85046f36a1f4e53571fb6e'; // 🔁 REEMPLAZA ESTO

// Cooldown por usuario (2 minutos)
const cooldown = new Map();
const COOLDOWN_TIME = 1 * 60 * 60 * 1000;

export default {
  commands: ["navegar"],
  flags: [],
  handled: async (venus, { m, args, command, usedPrefix }) => {
    const userId = m.sender;
    const now = Date.now();

    // Sistema de cooldown
    if (cooldown.has(userId)) {
      const timeLeft = cooldown.get(userId) - now;
      if (timeLeft > 0) {
        const seconds = Math.ceil(timeLeft / 1000);
        return venus.sendMessage(m.chat, {
          text: `🕒 Espera *${seconds} segundos* antes de volver a usar este comando.`
        }, { quoted: m });
      }
    }

    const query = args.join(" ").trim();
    if (!query) {
      return venus.sendMessage(m.chat, {
        text: `🌐 *Buscar en Google*\n\n🔎 Usa el comando así:\n${usedPrefix + command} Coin Master noticias\n${usedPrefix + command} gato rescatado en un árbol`
      }, { quoted: m });
    }

    await venus.sendMessage(m.chat, { react: { text: '🌐', key: m.key } });

    try {
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          q: query,
          hl: 'es',
          gl: 'es',
          api_key: SERPAPI_KEY
        }
      });

      const results = response.data.organic_results || [];

      if (!results.length) {
        return venus.sendMessage(m.chat, {
          text: `❌ No se encontraron resultados para: "${query}"`
        }, { quoted: m });
      }

      const top = results.slice(0, 3); // Solo 3 resultados
      let responseText = '';

      for (const [i, r] of top.entries()) {
        responseText += `*${i + 1}.* ${r.title}\n${r.link}\n\n`;
      }

      await venus.sendMessage(m.chat, { text: responseText }, { quoted: m });
      await venus.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // Activar cooldown
      cooldown.set(userId, now + COOLDOWN_TIME);
      setTimeout(() => cooldown.delete(userId), COOLDOWN_TIME);

    } catch (err) {
      console.error('[❌ ERROR EN SERPAPI]', err);
      await venus.sendMessage(m.chat, {
        text: '⚠️ Ocurrió un error al buscar. Verifica tu API key o intenta más tarde.',
      }, { quoted: m });
    }
  }
};