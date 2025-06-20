import { owners } from "../config.mjs";

export default {
    commands: ["kick"],
    flags: ["isGroup"], // Solo valida si está en grupo
    handled: async (venus, { m, isAdmin, groupMetadata, participants }) => {
        const groupId = m.chat;

        if (!isAdmin) {
            return await venus.sendMessage(groupId, {
                text: "❌ *Solo los administradores pueden usar este comando.*"
            }, { quoted: m });
        }

        const mentionedJid = m.mentionedJid[0] || m.quoted?.sender || null;

        if (!mentionedJid) {
            return await venus.sendMessage(groupId, {
                text: "👤 *Etiqueta o responde al usuario que quieras expulsar.*",
                mentions: [m.sender]
            }, { quoted: m });
        }

        // Evita expulsar al creador del grupo
        if (groupMetadata?.owner === mentionedJid) {
            return await venus.sendMessage(groupId, {
                text: `⚠️ *No puedo expulsar a @${mentionedJid.split("@")[0]} porque es el creador del grupo.*`,
                mentions: [mentionedJid, m.sender]
            }, { quoted: m });
        }

        // Evita expulsar a los dueños del bot
        if (owners.includes(mentionedJid)) {
            return await venus.sendMessage(groupId, {
                text: `⚠️ *No puedo expulsar a @${mentionedJid.split("@")[0]} porque es uno de mis dueños.*`,
                mentions: [mentionedJid, m.sender]
            }, { quoted: m });
        }

        // Evita que un admin expulse a otro admin
        const target = participants.find(p => p.id === mentionedJid);
        if (target?.admin) {
            return await venus.sendMessage(groupId, {
                text: `⚠️ *No puedes expulsar a @${mentionedJid.split("@")[0]} porque también es administrador.*`,
                mentions: [mentionedJid, m.sender]
            }, { quoted: m });
        }

        try {
            const resultado = await venus.groupParticipantsUpdate(groupId, [mentionedJid], "remove");
            if (resultado?.[0]?.status === "200") {
                await venus.sendMessage(groupId, {
                    text: `✅ *@${mentionedJid.split("@")[0]} fue expulsado del grupo correctamente.*`,
                    mentions: [mentionedJid]
                }, { quoted: m });
            } else {
                throw new Error("No se pudo expulsar.");
            }
        } catch (e) {
            await venus.sendMessage(groupId, {
                text: "❌ *No se pudo expulsar al usuario. Puede que ya haya salido o no tengo permisos suficientes.*"
            }, { quoted: m });
        }
    }
};