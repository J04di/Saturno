import db from "../lib/database/lowdb.mjs";

export default {
  commands: ["listhunts"],
  flags: ["isGroup"],
  handled: async (venus, { m, args }) => {
    await db.read();

    const bountyList = Object.entries(db.data.users || {})
      .filter(([_, user]) => user.bounty && user.bounty > 0)
      .sort(([, a], [, b]) => b.bounty - a.bounty);

    if (bountyList.length === 0) {
      return venus.sendMessage(m.chat, {
        text: "🎯 Actualmente no hay recompensas activas.",
      }, { quoted: m });
    }

    const pageSize = 5;
    const page = Math.max(parseInt(args[0]) || 1, 1);
    const totalPages = Math.ceil(bountyList.length / pageSize);

    if (page > totalPages) {
      return venus.sendMessage(m.chat, {
        text: `❌ Página inválida. Solo hay *${totalPages} página(s)* disponibles.`,
      }, { quoted: m });
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const pageList = bountyList.slice(start, end);

    const text = pageList.map(([jid, user], index) => {
      const username = jid.split("@")[0];
      const bountyFormatted = user.bounty.toLocaleString("es");
      return `*${start + index + 1}.* @${username} — 💰 *${bountyFormatted} puntos*`;
    }).join("\n");

    return venus.sendMessage(m.chat, {
      text: `🏹 *Lista de cazarecompensas — Página ${page}/${totalPages}:*\n\n${text}`,
      mentions: pageList.map(([jid]) => jid)
    }, { quoted: m });
  }
};