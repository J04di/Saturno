import db from "../lib/database/lowdb.mjs";

export default {
  commands: ["saquear"],
  flags: ["isGroup"],
  handled: async (venus, { m, args }) => {
    const thiefId = m.sender;
    const mentioned = m.mentionedJid?.[0];
    const isAll = args[1]?.toLowerCase() === "all";
    const COOLDOWN = 10 * 60 * 1000; // 10 minutos

    if (!mentioned || !isAll) {
      return venus.sendMessage(m.chat, {
        text: "❌ Usa el comando así: /saquear @usuario all",
        mentions: [thiefId]
      }, { quoted: m });
    }

    if (mentioned === thiefId) {
      return venus.sendMessage(m.chat, {
        text: "❌ No puedes saquearte a ti mismo.",
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

    const lastRaid = thief.lastRaid || 0;
    const remaining = COOLDOWN - (now - lastRaid);

    if (remaining > 0) {
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      return venus.sendMessage(m.chat, {
        text: `⏳ Espera *${minutes}m ${seconds}s* para volver a saquear.`,
        mentions: [thiefId]
      }, { quoted: m });
    }

    if (victim.points <= 0) {
      return venus.sendMessage(m.chat, {
        text: `❌ @${mentioned.split("@")[0]} no tiene puntos para saquear.`,
        mentions: [mentioned]
      }, { quoted: m });
    }

    const amount = victim.points;
    const penalty = Math.floor(amount * 2.5);

    thief.points += amount;
    thief.points = Math.max(0, thief.points - penalty);
    victim.points = 0;
    thief.lastRaid = now;

    await db.write();

    return venus.sendMessage(m.chat, {
      text: `💰 @${thiefId.split("@")[0]} saqueó *todos los ${amount} puntos* de @${mentioned.split("@")[0]}.\n🔻 Pero perdió *${penalty} puntos* como penalización.`,
      mentions: [thiefId, mentioned]
    }, { quoted: m });
  }
};