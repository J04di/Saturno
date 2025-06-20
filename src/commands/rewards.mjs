import db from "../lib/database/lowdb.mjs";

export default {
  commands: ["rewards"],
  flags: ["isGroup"],
  handled: async (venus, { m }) => {
    const userId = m.sender;
    const now = Date.now();
    const COOLDOWN = 2 * 60 * 60 * 1000; // 2 horas en milisegundos

    await db.read();

    const user = db.data.users[userId] ||= {
      points: 0,
      premium: false,
      joinedAt: now
    };

    const last = user.lastReward || 0;
    const remaining = COOLDOWN - (now - last);

    if (remaining > 0) {
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

      return venus.sendMessage(m.chat, {
        text: `⏳ Ya reclamaste tu recompensa.\nVuelve en *${hours}h ${minutes}m ${seconds}s*.`,
        mentions: [m.sender]
      }, { quoted: m });
    }

    const reward = Math.floor(Math.random() * 4) + 1; // entre 1 y 4
    user.points += reward;
    user.lastReward = now;

    await db.write();

    return venus.sendMessage(m.chat, {
      text: `🎁 @${userId.split("@")[0]}, has recibido *${reward} puntos*.\nTu total ahora es: *${user.points} pts*.`,
      mentions: [userId]
    }, { quoted: m });
  }
};