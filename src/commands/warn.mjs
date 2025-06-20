import { owners } from "../config.mjs";
import db from "../lib/database/lowdb.mjs";
export default {
    commands: ["warns"],
    flags: ["isGroup", "isAdmin", "isVenusAdmin"],
    handled: async (venus, { m, groupMetadata }) => {
        const mentionedJid = m.mentionedJid[0] || m.quoted?.sender || null;
        if (!mentionedJid) {
            await venus.sendMessage(m.chat, { text: "Etiqueta o menciona al usuario que quieras advertir", mentions: [m.sender] }, { quoted: m });
            return;
        }
        const target = db.data.users[mentionedJid];
        if (!target) {
            await venus.sendMessage(m.chat, { text: `El usuario @${mentionedJid.split("@")[0]} no está registrado en la base de datos`, mentions: [m.sender, mentionedJid] }, { quoted: m });
            return;
        }
        target.warns++;
        await venus.sendMessage(m.chat, { text: `Se agregó una advertencia a @${mentionedJid.split("@")[0]}, ahora tiene ${target.warns.toLocaleString()} advertencias`, mentions: [m.sender, mentionedJid] }, { quoted: m });
        await db.write();
        if (target.warns >= 4 && groupMetadata?.owner !== mentionedJid && !owners.includes(mentionedJid)) {
            await venus.sendMessage(m.chat, { text: `@${mentionedJid.split("@")[0]} superaste las 4 advertencias, serás eliminado del grupo`, mentions: [m.sender, mentionedJid] }, { quoted: m });
            await venus.groupParticipantsUpdate(m.chat, [mentionedJid], "remove");
        }
    }
}