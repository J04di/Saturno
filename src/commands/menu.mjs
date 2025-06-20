export default {
  commands: ["menu", "help"],
  flags: [],
  handled: async (venus, { m, usedPrefix }) => {
    const menu = `
╭━━━〔 *✨ Saturno-Bot 🪐 v1.0.0 ✨* 〕━━━╮

👋 Hola *@${m.sender.split("@")[0]}*, bienvenid@ al menú.
Explora las funciones estelares de Saturno.

📦 *Comandos disponibles:* 26

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭─〔 🧩 *Menú General* 〕─╮
│🧾 ${usedPrefix}menu / ${usedPrefix}help
│    Lista de comandos disponibles
│👤 ${usedPrefix}profile
│    Muestra tu perfil
│🖼️ ${usedPrefix}s / ${usedPrefix}sticker
│    Crea sticker de imagen o video
│🤗 ${usedPrefix}hug
│    Abraza a alguien
│💋 ${usedPrefix}kiss
│    Besa a alguien
│👊 ${usedPrefix}punch
│    Golpea a alguien
│🔫 ${usedPrefix}kill
│    Elimina ficticiamente a un usuario
│💃 ${usedPrefix}dance
│    Baila solo o con alguien
│📝 ${usedPrefix}presentar
│    Preséntate con estilo
│🎁 ${usedPrefix}rewards
│    Reclama recompensas cada 4 horas
│🎰 ${usedPrefix}ruleta
│    Juega a la ruleta con premios y riesgos
│🪙 ${usedPrefix}bet / ${usedPrefix}apostar
│    Apuesta tus puntos en un duelo
│🎼 ${usedPrefix}play
│    Busca y descarga canciones
╰──────────────────────╯

╭─〔 🛡️ *Menú Administración* 〕─╮
│❌ ${usedPrefix}kick
│    Expulsa a un miembro
│🗑️ ${usedPrefix}del / ${usedPrefix}delete
│    Borra un mensaje citado
│🔓 ${usedPrefix}open / ${usedPrefix}close
│    Abre o cierra el grupo
│🔔 ${usedPrefix}tagall / ${usedPrefix}invocar
│    Menciona a todos
│⚙️ ${usedPrefix}on / ${usedPrefix}off
│    Activa o desactiva funciones
│📊 ${usedPrefix}points
│    Ranking de puntos
│➕ ${usedPrefix}addpoints
│    Asigna puntos a un usuario
│⚠️ ${usedPrefix}warn
│    Advierte a un miembro
│😴 ${usedPrefix}inactivos
│    Muestra usuarios inactivos
╰──────────────────────╯

🔧 *Creado por Kogi 🌟*  
`.trim();

    await venus.sendMessage(
      m.chat,
      {
        image: { url: "./src/images/banner.jpeg" },
        mimetype: "image/jpeg",
        caption: menu,
        mentions: [m.sender],
      },
      { quoted: m }
    );
  },
};
