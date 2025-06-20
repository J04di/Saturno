import db from "../lib/database/lowdb.mjs";

export default {
  commands: ["minar", "mine"],
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
      minas: 0,
    };

    const lastMine = user.lastMine || 0;
    const remaining = COOLDOWN - (now - lastMine);

    if (remaining > 0) {
      const min = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const sec = Math.floor((remaining % (60 * 1000)) / 1000);
      return venus.sendMessage(m.chat, {
        text: `⛏️ *Espera antes de volver a minar.*\nPuedes volver en *${min}m ${sec}s*`,
        mentions: [userId]
      }, { quoted: m });
    }

    const animacion = [
      "⛏️ Picando la piedra...",
      "💥 Rompiendo vetas...",
      "✨ Algo brilla entre los minerales...",
      "📦 Extrayendo recursos...",
      "🏁 Minería completada. Revisando botín..."
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

    // Función para elegir un elemento basado en probabilidades
    function getByProbability(lista) {
      const roll = Math.random() * 100;
      let total = 0;
      for (const item of lista) {
        total += item.prob;
        if (roll <= total) return item;
      }
      return lista[0]; // fallback de seguridad
    }

    const minerales = [
      { nombre: "🪨 Piedra común", prob: 30, puntos: 5 },
      { nombre: "🪵 Madera fosilizada", prob: 20, puntos: 8 },
      { nombre: "⛓️ Mineral raro", prob: 15, puntos: 15 },
      { nombre: "🧪 Cristal mágico", prob: 10, puntos: 20 },
      { nombre: "💎 Épico", prob: 8, puntos: 30 },
      { nombre: "🌟 Legendario", prob: 6, puntos: 60 },
      { nombre: "🧬 Energía ancestral", prob: 4, puntos: 100 },
      { nombre: "🔱 Divino", prob: 2, puntos: 150 },
      { nombre: "🪙 Núcleo dorado", prob: 1, puntos: 300 }
    ];

    const enemigos = [
      { nombre: "💣 Creeper", prob: 10, daño: -10 },
      { nombre: "🕷️ Araña", prob: 8, daño: -5 },
      { nombre: "🧟 Zombi", prob: 7, daño: -3 },
      { nombre: "🔥 Blaze", prob: 5, daño: -7 }
    ];

    const mineral = getByProbability(minerales);
    const enemigo = getByProbability(enemigos);

    // Aplicar recompensa y penalización
    let total = mineral.puntos;
    let mensajeFinal = `⛏️ @${userId.split("@")[0]} fue a minar y encontró:\n\n🏅 Mineral: ${mineral.nombre}\n💰 *+${mineral.puntos} puntos*`;

    if (enemigo) {
      total += enemigo.daño;
      mensajeFinal += `\n\n⚠️ Pero fue atacado por un ${enemigo.nombre} y perdió *${-enemigo.daño} puntos*`;
    }

    mensajeFinal += `\n\n📦 Minas realizadas: *${++user.minas}*\n💼 Total de puntos: *${user.points += total}*`;

    user.lastMine = now;
    await db.write();

    await venus.sendMessage(m.chat, {
      text: mensajeFinal,
      mentions: [userId]
    }, { quoted: m });
  }
};