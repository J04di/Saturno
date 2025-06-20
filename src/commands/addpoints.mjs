import db from "../lib/database/lowdb.mjs";

export default {
    commands: ["addpoints"],
    flags: ["isGroup", "isOwner"],
    handled: async (venus, { m, args }) => {
        if (!m.mentionedJid?.length) {
            await venus.sendMessage(
                m.chat,
                { text: "Etiqueta al usuario a quien deseas agregar puntos.", mentions: [m.sender] },
                { quoted: m }
            );
            return;
        }

        const targetJid = m.mentionedJid[0];
        const target = db.data.users[targetJid];

        if (!target) {
            await venus.sendMessage(
                m.chat,
                { text: `El usuario @${targetJid.split("@")[0]} no está registrado en la base de datos.`, mentions: [m.sender, targetJid] },
                { quoted: m }
            );
            return;
        }

        if (!args[1] || isNaN(args[1])) {
            await venus.sendMessage(
                m.chat,
                { text: "Ingresa un número válido de puntos que quieras agregar al usuario.", mentions: [m.sender] },
                { quoted: m }
            );
            return;
        }

        const amount = Math.max(0, parseInt(args[1], 10));

        if (amount === 0) {
            await venus.sendMessage(
                m.chat,
                { text: "La cantidad no puede ser menor o igual a 0.", mentions: [m.sender] },
                { quoted: m }
            );
            return;
        }

        // Compatibilidad con diferentes identificadores
        if (!targetJid.endsWith("@s.whatsapp.net") && !targetJid.endsWith("@lid")) {
            await venus.sendMessage(
                m.chat,
                { text: "El formato de usuario no es compatible.", mentions: [m.sender] },
                { quoted: m }
            );
            return;
        }

        target.points = (target.points || 0) + amount;
        await db.write();

        await venus.sendMessage(
            m.chat,
            { text: `Se han agregado *${amount.toLocaleString()}* puntos a @${targetJid.split("@")[0]}.`, mentions: [m.sender, targetJid] },
            { quoted: m }
        );
    }
};