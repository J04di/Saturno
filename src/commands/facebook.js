// Don't delete this credit!!!
// Script by ShirokamiRyzen (adaptado por ChatGPT)

import axios from 'axios';

export default {
  commands: ["fb", "facebook", "fbdownload", "fbdl"],
  flags: [],
  handled: async (venus, { m, args }) => {
    const sender = m.sender.split('@')[0];

    if (!args[0]) {
      return await venus.sendMessage(m.chat, {
        text: '📎 Por favor, proporciona la URL de un video de *Facebook* para descargarlo.'
      }, { quoted: m });
    }

    const url = args[0];

    if (!/^https?:\/\/(www\.)?facebook\.com/.test(url)) {
      return await venus.sendMessage(m.chat, {
        text: '❌ La URL proporcionada no parece ser válida para Facebook.'
      }, { quoted: m });
    }

    await venus.sendMessage(m.chat, {
      react: {
        text: '📥',
        key: m.key
      }
    });

    try {
      const { data } = await axios.get(`https://api.ryzendesu.vip/api/downloader/fbdl?url=${encodeURIComponent(url)}`);

      if (!data.status || !data.data || data.data.length === 0) {
        throw 'No se encontró ningún video disponible para descargar.';
      }

      const video = data.data.find(v => v.resolution === '720p (HD)') || data.data.find(v => v.resolution === '360p (SD)');

      if (!video?.url) {
        throw 'No se pudo obtener la URL del video.';
      }

      const videoBuffer = await axios.get(video.url, { responseType: 'arraybuffer', timeout: 15000 }).then(res => res.data);

      await venus.sendMessage(m.chat, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        fileName: `facebook_video.mp4`,
        caption: `📽️ Aquí tienes tu video, @${sender}`,
        mentions: [m.sender]
      }, { quoted: m });

    } catch (err) {
      console.error('Error al descargar video de Facebook:', err);
      let errorMsg = typeof err === 'string' ? err : '❌ Ocurrió un error al intentar descargar el video. Intenta con otro enlace o más tarde.';
      await venus.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
    }
  }
};