import db from "../lib/database/lowdb.mjs";

function getRangoInsignia(points = 0) {
  if (points >= 400) return "🏅 Diamante";
  if (points >= 200) return "🥇 Oro";
  if (points >= 100) return "🥈 Plata";
  if (points >= 50) return "🥉 Bronce";
  return "";
}

export default {
  commands: ["points"],
  flags: ["isGroup"],
  handled: async (venus, { m, groupMetadata, args, command }) => {
    await db.read();

    const groupId = m.chat;
    const participants = groupMetadata?.participants?.map(p => p.id) || [];

    const users = db.data.users || {};
    const groupUsers = Object.entries(users)
      .filter(([id]) => participants.includes(id)) // Solo usuarios del grupo
      .sort(([, a], [, b]) => (b.points || 0) - (a.points || 0));

    const totalPages = Math.ceil(groupUsers.length / 5);
    const page = Math.max(parseInt(args[0]) || 1, 1);
    const start = (page - 1) * 5;
    const pageUsers = groupUsers.slice(start, start + 5);

    if (pageUsers.length === 0) {
      return venus.sendMessage(m.chat, {
        text: "❌ No hay usuarios registrados con puntos en este grupo.",
        mentions: [m.sender]
      }, { quoted: m });
    }

    const medals = ["🥇", "🥈", "🥉"];
    const caption = `
🏆 *Ranking de puntos del grupo*
📄 *Página ${page} de ${totalPages}*

${pageUsers.map(([id, data], i) => {
      const rank = start + i;
      const username = id.split("@")[0];
      const medal = rank < 3 ? medals[rank] : `${rank + 1}.`;
      const rango = getRangoInsignia(data.points);
      const premium = data.premium ? "🔥" : "";
      return `${medal} @${username}${premium} - *${data.points || 0}* pts ${rango}`;
    }).join("\n")}
`.trim();

    const mentions = pageUsers.map(([id]) => id);
    const buttons = [];

    if (page > 1) buttons.push({
      buttonId: `${m.prefix}${command} ${page - 1}`,
      buttonText: { displayText: "⏪ Página anterior" },
      type: 1
    });

    if (page < totalPages) buttons.push({
      buttonId: `${m.prefix}${command} ${page + 1}`,
      buttonText: { displayText: "⏩ Página siguiente" },
      type: 1
    });

    await venus.sendMessage(m.chat, {
      text: caption,
      mentions,
      buttons,
      footer: "🎖 Sistema de Puntos",
      headerType: 1
    }, { quoted: m });
  }
};