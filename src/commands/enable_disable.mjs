import db from "../lib/database/lowdb.mjs";
export default {
    commands: ["on", "off", "enable", "disable"],
    flags: ["isGroup", "isAdmin"],
    handled: async (venus, { m, usedCommand, args }) => {
        const group = db.data.groups[m.chat];
        const shouldEnable = /^(on|enable)$/i.test(usedCommand);
        if (args.length === 0) {
            await venus.sendMessage(m.chat, { text: `Ingresa la opción que quieras ${shouldEnable ? "activar" : "desactivar"}\n- - *Ajustes Disponibles*\n> *antilink*\n> *nsfw*`, mentions: [m.sender] }, { quoted: m });
            return;
        }
        if (/^antilink$/i.test(args[0])) {
            group.antilinks = shouldEnable;
            await db.write();
            await venus.sendMessage(m.chat, { text: `La opción *${args[0]}* ha sido ${shouldEnable ? "activada" : "desactivada"}`, mentions: [m.sender] }, { quoted: m });
            return;
        } else if (/^nsfw$/i.test(usedCommand)) {
            group.nsfw = shouldEnable;
            await db.write();
            await venus.sendMessage(m.chat, { text: `La opción *${args[0]}* ha sido ${shouldEnable ? "activada" : "desactivada"}`, mentions: [m.sender] }, { quoted: m });
            return;
        } else {
            await venus.sendMessage(m.chat, { text: `La opción *${args[0]}* no es válida`, mentions: [m.sender] }, { quoted: m });
        }
    }
}