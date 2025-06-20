import db from "../lib/database/lowdb.mjs";

export default {
  commands: ["bet", "apostar"],
  flags: ["isGroup"],
  handled: async (venus, { m, args }) => {
    const userId = m.sender;
    const amount = parseInt(args[0]);
    const COOLDOWN = 40000; // 3 minutos

    if (isNaN(amount) || amount <= 0) {
      return venus.sendMessage(m.chat, {
        text: `❌ *Uso incorrecto del comando* ❌

Usa el comando así:  
*/bet 10* 🔢

💡 Apuesta un número válido de puntos.`,
        mentions: [userId]
      }, { quoted: m });
    }

    await db.read();

    const now = Date.now();

    const user = db.data.users[userId] ||= {
      points: 0,
      premium: false,
      joinedAt: now
    };

    const lastBet = user.lastBet || 0;
    const remaining = COOLDOWN - (now - lastBet);

    if (remaining > 0) {
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      return venus.sendMessage(m.chat, {
        text: `⏳ *¡Aún no puedes apostar!* ⏳

@${userId.split("@")[0]}, espera *${minutes}m ${seconds}s* antes de volver a intentarlo.  
🎯 ¡Ten paciencia, que la suerte te espera!`,
        mentions: [userId]
      }, { quoted: m });
    }

    if (user.points < amount) {
      return venus.sendMessage(m.chat, {
        text: `🚫 *Fondos insuficientes* 🚫

@${userId.split("@")[0]} no tiene suficientes puntos para apostar.  
💰 Reúne más puntos antes de intentar de nuevo.`,
        mentions: [userId]
      }, { quoted: m });
    }

    const win = Math.random() < 0.5; // 50% probabilidad
    user.lastBet = now;

    if (win) {
      user.points += amount;
      await db.write();
      return venus.sendMessage(m.chat, {
        text: `🎰💸 *¡APUESTA EXITOSA!* 💸🎰

@${userId.split("@")[0]} apostó *${amount} puntos* y la suerte estuvo de su lado. 🔥  
¡Ganó *+${amount} puntos*! 🥳💵  
💰 Total actual: *${user.points} puntos*

🧠 Consejo: ¡La suerte favorece a los valientes!`,
        mentions: [userId]
      }, { quoted: m });
    } else {
      user.points -= amount;
      await db.write();
      return venus.sendMessage(m.chat, {
        text: `🎰💀 *¡APUESTA FALLIDA!* 💀🎰

@${userId.split("@")[0]} apostó *${amount} puntos*... pero la casa ganó esta vez. 😢  
❌ Perdió *-${amount} puntos*  
💰 Te quedan: *${user.points} puntos*

😬 ¡Mejor suerte la próxima!`,
        mentions: [userId]
      }, { quoted: m });
    }
  }
};