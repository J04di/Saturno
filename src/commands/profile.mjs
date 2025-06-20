import db from "../lib/database/lowdb.mjs";

export default {
  commands: ["pp", "profile"],
  flags: ["isGroup"],
  handled: async (venus, { m }) => {
    const mentionedJid = m.mentionedJid?.[0] || m.quoted?.sender;
    const target = mentionedJid || m.sender;

    await db.read();
    const user = db.data.users[target] ||= {
      points: 0,
      cajas: 0,
      premium: false
    };

    const profile = await venus.profilePictureUrl(target, "image")
      .catch(() => "https://i.pinimg.com/736x/27/01/f5/2701f51da94a8f339b2149ca5d15d2a5.jpg");

    const info = `
┏━━━ 👤 *Perfil de Usuario* ━━━┓
┃ 🧑 Nombre: @${target.split("@")[0]}
┃ 💰 Puntos: *${user.points}*
┃ 📦 Cajas abiertas: *${user.cajas}*
┃ 🟢 Premium: *${user.premium ? "Sí 🔥" : "No"}*
┗━━━━━━━━━━━━━━━━━━━━━━┛
    `.trim();

    await venus.sendMessage(m.chat, {
      image: { url: profile },
      caption: info,
      mentions: [target]
    }, { quoted: m });
  }
};