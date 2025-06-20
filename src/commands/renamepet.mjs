import db from "../lib/database/lowdb.mjs";

export default {
  commands: ["renombrarMascota", "renamepet", "cambiarnombre"],
  flags: ["isGroup"], // o los que uses
  handled: async (venus, { m, args }) => {
    const userId = m.sender;
    const chatId = m.chat;
    const nuevoNombre = args.join(" ").trim();

    if (!nuevoNombre) {
      return venus.sendMessage(chatId, { text: "❗️ Debes escribir el nuevo nombre para tu mascota. Ejemplo: /renamepet Firulais" }, { quoted: m });
    }

    await db.read();

    const users = db.data.users;
    const user = users[userId];

    if (!user || !user.pet) {
      return venus.sendMessage(chatId, { text: "❗️ No tienes una mascota registrada para renombrar." }, { quoted: m });
    }

    // Actualizar el nombre de la mascota
    user.pet.name = nuevoNombre;

    await db.write();

    return venus.sendMessage(chatId, { text: `✅ ¡Tu mascota ha sido renombrada a: *${nuevoNombre}*!` }, { quoted: m });
  }
};