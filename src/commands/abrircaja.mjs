import db from "../lib/database/lowdb.mjs";

export default {
  commands: ["abrircaja", "caja", "box"],
  flags: ["isGroup"],
  handled: async (venus, { m }) => {
    const userId = m.sender;
    const COOLDOWN = 2 * 60 * 1000; // 2 minutos
    const now = Date.now();

    await db.read();

    const user = db.data.users[userId] ||= {
      points: 0,
      premium: false,
      joinedAt: now,
      cajas: 0,
    };

    const lastBox = user.lastBox || 0;
    const remaining = COOLDOWN - (now - lastBox);

    if (remaining > 0) {
      const min = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const sec = Math.floor((remaining % (60 * 1000)) / 1000);
      return venus.sendMessage(m.chat, {
        text: `🕒 *Espera antes de abrir otra caja.*\nPuedes abrirla en *${min}m ${sec}s*`,
        mentions: [userId]
      }, { quoted: m });
    }

    // 🧰 Animación textual
    const animacion = [
      "📦 Abriendo caja...",
      "🔓 Desbloqueando seguro...",
      "✨ Algo brilla en su interior...",
      "🎁 Casi está lista...",
      "🎉 ¡Caja abierta! Revisando contenido..."
    ];

    let mensaje = await venus.sendMessage(m.chat, {
      text: animacion[0],
      mentions: [userId]
    }, { quoted: m });

    for (let i = 1; i < animacion.length; i++) {
      await new Promise(res => setTimeout(res, 800));
      await venus.sendMessage(m.chat, {
        edit: mensaje.key,
        text: animacion[i],
        mentions: [userId]
      });
    }

    // Recompensas por rareza
    const cajas = [
      { nombre: "🟩 Común", prob: 50, puntos: 5 },
      { nombre: "🟦 Rara", prob: 30, puntos: 15 },
      { nombre: "🟪 Épica", prob: 15, puntos: 30 },
      { nombre: "🟥 Legendaria", prob: 5, puntos: 100 },
      { nombre: "🔱 Mítico", prob: 1, puntos: 150 }
    ];

    // Selección aleatoria por probabilidad
    const roll = Math.random() * 100;
    let suma = 0;
    let recompensa;
    for (const caja of cajas) {
      suma += caja.prob;
      if (roll <= suma) {
        recompensa = caja;
        break;
      }
    }

    // Actualización del usuario
    user.lastBox = now;
    user.points += recompensa.puntos;
    user.cajas += 1;

    await db.write();

    // 🎊 Resultado final
    await venus.sendMessage(m.chat, {
      text: `🎁 @${userId.split("@")[0]} abrió una *caja sorpresa* y obtuvo:\n\n🏅 Rareza: ${recompensa.nombre}\n💰 *+${recompensa.puntos} puntos*\n📦 Cajas abiertas: *${user.cajas}*\n\n💼 Total de puntos: *${user.points}*`,
      mentions: [userId]
    }, { quoted: m });
  }
};