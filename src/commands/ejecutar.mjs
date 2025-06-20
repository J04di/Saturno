import db from "../lib/database/lowdb.mjs";

export default {
  commands: ["ejecutar"],
  flags: ["isGroup"],
  handled: async (venus, { m, args }) => {
    const senderId = m.sender;
    const mentioned = m.mentionedJid?.[0];
    const now = Date.now();
    const COOLDOWN = 60 * 1000; // 1 minuto en milisegundos

    if (!mentioned) {
      return venus.sendMessage(m.chat, {
        text: "❌ Usa el comando así: /ejecutar @usuario",
        mentions: [senderId]
      }, { quoted: m });
    }

    if (mentioned === senderId) {
      return venus.sendMessage(m.chat, {
        text: "❌ No puedes ejecutarte a ti mismo.",
        mentions: [senderId]
      }, { quoted: m });
    }

    await db.read();

    const sender = db.data.users[senderId] ||= {
      points: 0,
      premium: false,
      joinedAt: now
    };

    const target = db.data.users[mentioned] ||= {
      points: 0,
      premium: false,
      joinedAt: now
    };

    const bounty = target.bounty || 0;

    // Verificar cooldown
    const lastExecution = sender.lastExecute || 0;
    const remaining = COOLDOWN - (now - lastExecution);

    if (remaining > 0) {
      const seconds = Math.ceil(remaining / 1000);
      return venus.sendMessage(m.chat, {
        text: `⏳ Debes esperar *${seconds}s* antes de volver a ejecutar.`,
        mentions: [senderId]
      }, { quoted: m });
    }

    if (bounty <= 0) {
      return venus.sendMessage(m.chat, {
        text: `❌ @${mentioned.split("@")[0]} no tiene ninguna recompensa activa.`,
        mentions: [mentioned]
      }, { quoted: m });
    }

    const success = Math.random() < 0.1; // 10% probabilidad

    sender.lastExecute = now; // guardar intento, sea éxito o fallo

    if (success) {
      sender.points += bounty;
      target.bounty = 0;

      await db.write();

      return venus.sendMessage(m.chat, {
        text: `💥 ¡@${senderId.split("@")[0]} ejecutó a @${mentioned.split("@")[0]} y ganó *${bounty.toLocaleString("es")} puntos*! 💸`,
        mentions: [senderId, mentioned]
      }, { quoted: m });
    } else {
      const penalty = Math.floor(bounty * 0.1);
      sender.points = Math.max(0, sender.points - penalty);

      await db.write();

      return venus.sendMessage(m.chat, {
        text: `😵‍💫 Fallaste al ejecutar a @${mentioned.split("@")[0]}.\nPerdiste *${penalty.toLocaleString("es")} puntos*.`,
        mentions: [senderId, mentioned]
      }, { quoted: m });
    }
  }
};