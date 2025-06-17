const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const os = require('os');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.get('/convertir', async (req, res) => {
  const url = req.query.url;
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send('❌ URL de YouTube inválida.');
  }

  const filePath = path.join(os.tmpdir(), `audio_${Date.now()}.mp3`);

  try {
    const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

    ffmpeg(stream)
      .audioBitrate(128)
      .save(filePath)
      .on('end', () => {
        res.download(filePath, 'audio.mp3', () => {
          fs.unlinkSync(filePath); // borra el archivo temporal
        });
      })
      .on('error', err => {
        console.error(err);
        res.status(500).send('⚠️ Error al convertir el video.');
      });
  } catch (err) {
    console.error(err);
    res.status(500).send('⚠️ Error inesperado.');
  }
});

app.listen(PORT, () => {
  console.log(`✅ API funcionando en http://localhost:${PORT}`);
});