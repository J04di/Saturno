import db from "../lib/database/lowdb.mjs";

export default {
  commands: ["rob", "robar"],
  flags: ["isGroup"],
  handled: async (venus, { m, args }) => {
    const thiefId = m.sender;
    const mentioned = m.mentionedJid?.[0];
    const amount = parseInt(args[1]);
    const COOLDOWN = 5 * 60 * 1000; // 5 minutos

    if (!mentioned || isNaN(amount) || amount <= 0) {
      return venus.sendMessage(m.chat, {
        text: "❌ Usa el comando así: /rob @usuario 10",
        mentions: [thiefId]
      }, { quoted: m });
    }

    if (mentioned === thiefId) {
      return venus.sendMessage(m.chat, {
        text: "❌ No puedes robarte a ti mismo.",
        mentions: [thiefId]
      }, { quoted: m });
    }

    await db.read();

    const now = Date.now();

    const thief = db.data.users[thiefId] ||= {
      points: 0,
      premium: false,
      joinedAt: now
    };

    const victim = db.data.users[mentioned] ||= {
      points: 0,
      premium: false,
      joinedAt: now
    };

    const lastRob = thief.lastRob || 0;
    const remaining = COOLDOWN - (now - lastRob);

    if (remaining > 0) {
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      return venus.sendMessage(m.chat, {
        text: `⏳ Espera *${minutes}m ${seconds}s* para volver a robar.`,
        mentions: [thiefId]
      }, { quoted: m });
    }

    if (victim.points < amount) {
      return venus.sendMessage(m.chat, {
        text: `❌ @${mentioned.split("@")[0]} no tiene suficientes puntos.`,
        mentions: [mentioned]
      }, { quoted: m });
    }

    const success = Math.random() < 0.3;

    if (success) {
      thief.points += amount;
      victim.points -= amount;
      thief.lastRob = now;

      await db.write();

      return venus.sendMessage(m.chat, {
        text: `✅ @${thiefId.split("@")[0]} robó *${amount} puntos* a @${mentioned.split("@")[0]} 😈`,
        mentions: [thiefId, mentioned]
      }, { quoted: m });
    } else {
      const penalty = Math.floor(amount / 4);
      thief.points = Math.max(0, thief.points - penalty);
      thief.lastRob = now;

      await db.write();

      return venus.sendMessage(m.chat, {
        text: `❌ El robo falló.\n@${thiefId.split("@")[0]} perdió *${penalty} puntos* 😵`,
        mentions: [thiefId]
      }, { quoted: m });
    }
  }
};