import yts from 'yt-search';

// Cooldown por usuario
const cooldown = new Map();
const COOLDOWN_TIME = 2 * 60 * 1000; // 2 minutos

export default {
  commands: ["buscar"],
  flags: [],
  handled: async (venus, { m, args, command, usedPrefix }) => {
    const userId = m.sender;
    const now = Date.now();

    // Verifica cooldown
    if (cooldown.has(userId)) {
      const timeLeft = cooldown.get(userId) - now;
      if (timeLeft > 0) {
        const seconds = Math.ceil(timeLeft / 1000);
        return venus.sendMessage(m.chat, {
          text: `🕒 Espera *${seconds} segundos* antes de volver a usar este comando.`
        }, { quoted: m });
      }
    }

    const text = args.join(" ").trim().toLowerCase();

    if (!text) {
      return venus.sendMessage(m.chat, {
        text: `╭━━•✰✰•━━╮\n*🎶 Búsqueda de Música 🎶*\n╰━━•✰✰•━━╯\n\n🔹 Ingresa el título de una canción o video para buscar en YouTube.\n\n🔍 Ejemplo:\n${usedPrefix + command} Bad Bunny - Tití Me Preguntó`
      }, { quoted: m });
    }

    await venus.sendMessage(m.chat, { react: { text: '🕓', key: m.key } });

    try {
      const searchResult = await yts(text);
      if (!searchResult?.videos?.length) {
        await venus.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return venus.sendMessage(m.chat, { text: '🚫 No se encontraron resultados. Intenta con otro título.' }, { quoted: m });
      }

      const video = searchResult.videos[0];
      const ytUrl = `https://youtu.be/${video.videoId}`;
      const y2mateUrl = `https://www.y2mate.com/youtube/${video.videoId}`;

      const info = `🎧 *Título:* ${video.title}
🎤 *Canal:* ${video.author.name || 'Desconocido'}
⏳ *Duración:* ${formatDuration(video.duration.seconds)}

🔗 *Ver en YouTube:* ${ytUrl}
📥 *Descargar desde Y2Mate:* ${y2mateUrl}`;

      await venus.sendMessage(m.chat, { text: info }, { quoted: m });
      await venus.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // Activar cooldown
      cooldown.set(userId, now + COOLDOWN_TIME);
      setTimeout(() => cooldown.delete(userId), COOLDOWN_TIME);

    } catch (error) {
      console.error('[❌ ERROR EN BUSCAR]', error);
      await venus.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
      await venus.sendMessage(m.chat, { text: '⚠️ Ocurrió un error al procesar la búsqueda. Intenta más tarde.' }, { quoted: m });
    }
  }
}

// Formatear duración
function formatDuration(seconds) {
  seconds = Number(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s]
    .map(v => v.toString().padStart(2, '0'))
    .filter((v, i) => !(v === '00' && i < 2))
    .join(':');
}