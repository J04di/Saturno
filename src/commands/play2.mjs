import axios from "axios";
import yts from "yt-search";

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;

export default {
  commands: ["play", "yta", "ytmp3", "play2", "ytv", "ytmp4", "playaudio", "mp4"],
  flags: ["isGroup"],
  handled: async (venus, { m, args, usedCommand }) => {
    try {
      const text = args.join(" ");
      if (!text.trim()) {
        return venus.sendMessage(m.chat, { text: "❀ Por favor, ingresa el nombre de la música a descargar." }, { quoted: m });
      }

      const videoIdMatch = text.match(youtubeRegexID);
      const searchTerm = videoIdMatch ? `https://youtu.be/${videoIdMatch[1]}` : text;
      const searchResults = await yts(searchTerm);

      let videoInfo;
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        videoInfo = searchResults.all.find(v => v.videoId === videoId) || searchResults.videos.find(v => v.videoId === videoId);
      } else {
        videoInfo = searchResults.all?.[0] || searchResults.videos?.[0];
      }

      if (!videoInfo) {
        return venus.sendMessage(m.chat, { text: "✧ No se encontraron resultados para tu búsqueda." }, { quoted: m });
      }

      const { title = "Desconocido", thumbnail, timestamp = "Desconocido", views = "Desconocido", ago = "Desconocido", url = "Desconocido", author = {} } = videoInfo;
      const canal = author.name || "Desconocido";
      const vistas = formatViews(views);

      const infoMessage = `「✦」Descargando *<${title}>*\n\n> ✧ Canal » *${canal}*\n> ✰ Vistas » *${vistas}*\n> ⴵ Duración » *${timestamp}*\n> ✐ Publicado » *${ago}*\n> 🜸 Link » ${url}`;

      // Obtener miniatura como buffer
      let thumbBuffer = null;
      try {
        const { data } = await axios.get(thumbnail, { responseType: "arraybuffer" });
        thumbBuffer = data;
      } catch {
        thumbBuffer = null;
      }

      // Enviar información del video
      await venus.sendMessage(
        m.chat,
        { text: infoMessage },
        {
          quoted: m,
          contextInfo: {
            externalAdReply: {
              title: "YouTube Downloader",
              body: "Desarrollado por GataBot",
              mediaType: 1,
              previewType: 0,
              mediaUrl: url,
              sourceUrl: url,
              thumbnail: thumbBuffer,
              renderLargerThumbnail: true,
            },
          },
        }
      );

      // Determinar tipo de comando
      if (["play", "yta", "ytmp3", "playaudio"].includes(usedCommand)) {
        // AUDIO
        try {
          const { data: api } = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${url}`);
          const audioUrl = api?.result?.download?.url;

          if (!audioUrl) throw new Error("⚠ El enlace de audio no se generó correctamente.");

          await venus.sendMessage(
            m.chat,
            {
              audio: { url: audioUrl },
              fileName: `${api.result.title}.mp3`,
              mimetype: "audio/mpeg",
            },
            { quoted: m }
          );
        } catch (e) {
          return venus.sendMessage(m.chat, { text: "⚠︎ No se pudo enviar el audio. Puede que el archivo sea demasiado grande o falló la descarga." }, { quoted: m });
        }
      } else if (["play2", "ytv", "ytmp4", "mp4"].includes(usedCommand)) {
        // VIDEO
        try {
          const { data: json } = await axios.get(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=480p&apikey=GataDios`);
          const videoUrl = json?.data?.url;

          if (!videoUrl) throw new Error("⚠ El enlace de video no se generó correctamente.");

          await venus.sendMessage(
            m.chat,
            {
              video: { url: videoUrl },
              caption: title,
              fileName: `${json.title}.mp4`,
              mimetype: "video/mp4",
            },
            { quoted: m }
          );
        } catch (e) {
          return venus.sendMessage(m.chat, { text: "⚠︎ No se pudo enviar el video. Puede que sea muy pesado o haya fallado la descarga." }, { quoted: m });
        }
      }

    } catch (err) {
      return venus.sendMessage(m.chat, { text: `⚠︎ Ocurrió un error: ${err.message}` }, { quoted: m });
    }
  },
};

function formatViews(views) {
  if (!views || views === "Desconocido") return "No disponible";
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`;
  return views.toString();
}