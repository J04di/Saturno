import db from "../lib/database/lowdb.mjs";

export default {
  commands: ["cazar"],
  flags: ["isGroup"],
  handled: async (venus, { m, args, isAdmin }) => {
    const senderId = m.sender;
    const mentioned = m.mentionedJid?.[0];
    const amount = parseInt(args[1]);
    const now = Date.now();

    if (!isAdmin) {
      return venus.sendMessage(m.chat, {
        text: "❌ Solo los administradores pueden usar este comando.",
        mentions: [senderId]
      }, { quoted: m });
    }

    if (!mentioned || isNaN(amount) || amount <= 0) {
      return venus.sendMessage(m.chat, {
        text: "❌ Usa el comando así: /cazar @usuario 100",
        mentions: [senderId]
      }, { quoted: m });
    }

    await db.read();

    const target = db.data.users[mentioned] ||= {
      points: 0,
      premium: false,
      joinedAt: now
    };

    target.bounty = (target.bounty || 0) + amount;

    await db.write();

    return venus.sendMessage(m.chat, {
      text: `🎯 ¡Recompensa puesta! @${mentioned.split("@")[0]} tiene ahora *${target.bounty} puntos* sobre su cabeza.`,
      mentions: [mentioned]
    }, { quoted: m });
  }
};