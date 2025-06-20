// ─── IMPORTACIONES ────────────────────────────────────────────────
import abot from "abot-scraper";

// ─── COMANDO FACEBOOK ─────────────────────────────────────────────
export default {
  commands: ['fb', 'facebook', 'fbdl'],
  flags: [],
  handled: async (conn, { m, text, command, usedPrefix }) => {
    if (!text) {
      throw `📌 Uso correcto:\n${usedPrefix + command} <link de Facebook>\n\nEjemplo:\n${usedPrefix + command} https://www.facebook.com/watch/?v=1234567890`;
    }

    if (!isValidFacebookUrl(text)) {
      throw '❌ El enlace proporcionado no parece ser un enlace válido de Facebook.';
    }

    try {
      await conn.sendMessage(m.chat, { text: '⏳ Descargando video, por favor espera...' }, { quoted: m });

      const result = await abot.downloader.facebook(text);
      if (!result?.url || result.url.length === 0) {
        throw '⚠️ No se pudo obtener el video. Es posible que el enlace esté restringido o no sea público.';
      }

      const videoUrl = result.url[0]; // Elige la mejor opción (puedes cambiar por result.url[1] si deseas HD)
      const title = result.title || 'Facebook Video';
      const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;

      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        fileName,
        caption: `📥 ${title}`
      }, { quoted: m });

    } catch (error) {
      console.error('[❌ ERROR EN FB]', error);
      throw '❌ Error al procesar el video. Intenta con otro enlace o verifica que sea público.';
    }
  }
};

// ─── FUNCIONES AUXILIARES ─────────────────────────────────────────
function isValidFacebookUrl(url) {
  return /^(https?:\/\/)?(www\.)?(facebook|fb)\.(com|watch)\/.+$/i.test(url);
}