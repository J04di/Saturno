export default {
  commands: ["menu", "help"],
  flags: [],
  handled: async (venus, { m, usedPrefix }) => {
    const menu = `
╭━━━〔 *✨ Saturno-Bot 🪐 v1.0.0 ✨* 〕━━━╮

👋 Hola *@${m.sender.split("@")[0]}*, bienvenid@ al menú.
Disfruta de todas las funciones que ofrece el bot.

📦 *Caja de Comandos:* 26 disponibles

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭─〔 🧩 *Menú General* 〕─╮
│🧾 ${usedPrefix}menu / ${usedPrefix}help
│    Lista de comandos disponibles
│👤 ${usedPrefix}profile
│    Muestra tu perfil
│🖼️ ${usedPrefix}s / ${usedPrefix}sticker
│    Crea sticker de imagen o video
│🤗 ${usedPrefix}hug
│    Abraza a una persona
│💋 ${usedPrefix}kiss
│    Besa a una persona
│👊 ${usedPrefix}punch
│    Pega a alguien
│🔫 ${usedPrefix}kill
│    Elimina a un usuario ficticiamente
│💃 ${usedPrefix}dance
│    Baila sol@ o con alguien
│📝 ${usedPrefix}presentar
│    Preséntate en el grupo con estilo
│🎁 ${usedPrefix}rewards
│    Reclama tus recompensas cada 4 horas
│🎰 ${usedPrefix}ruleta
│    Juega a la ruleta con premios y riesgos
│🪙 ${usedPrefix}bet o ${usedPrefix}apostar
│    Apuesta tus puntos en un duelo
│🎼 ${usedPrefix}Buscar Canciones de YouTube y descargar.
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
│⚙️ ${usedPrefix}on / ${usedPrefix}enable
│⚙️ ${usedPrefix}off / ${usedPrefix}disable
│    Activa o desactiva funciones del grupo
│📊 ${usedPrefix}points
│    Ranking de puntos
│➕ ${usedPrefix}addpoints
│    Asigna puntos a un usuario
│⚠️ ${usedPrefix}warn
│    Advierte a un miembro
│😴 ${usedPrefix}inactivos
│    Muestra a los usuarios inactivos del grupo
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