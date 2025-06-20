export default {
    commands: ["delete", "del"],
    flags: ["isGroup", "isAdmin"],
    handled: async (venus, { m }) => {
        if (!m.quoted) {
            await venus.sendMessage(m.chat, { text: "Responde al mensaje que quieras eliminar", mentions: [m.sender] }, { quoted: m });
            return;
        }
        await venus.sendMessage(m.chat, { delete: m.quoted.key });
    }
}