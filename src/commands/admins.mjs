export default {
    commands: ["admin"],
    flags: ["isGroup"],
    handled: async (venus, { m, text }) => {
        try {
            const chatId = m.chat;

            // Obtener metadata del grupo
            const groupMetadata = await venus.groupMetadata(chatId);
            if (!groupMetadata || !groupMetadata.participants) {
                await venus.sendMessage(chatId, { text: "⚠️ No se pudo obtener la lista de administradores." }, { quoted: m });
                return;
            }

            const groupName = groupMetadata.subject || "Grupo";
            const admins = groupMetadata.participants.filter(p => p.admin === "admin" || p.admin === "superadmin");

            if (admins.length === 0) {
                await venus.sendMessage(chatId, { text: "⚠️ No hay administradores en este grupo." }, { quoted: m });
                return;
            }

            const adminList = admins.map(p => {
                const icon = p.admin === "superadmin" ? "👑" : "🛡️";
                return `${icon} @${p.id.split("@")[0]}`;
            }).join("\n");

            const message = `
🔔 *Llamado a los administradores del grupo*  
📛 *${groupName}*

${text ? `💬 *Mensaje:* ${text}\n` : ""}

👥 *Administradores:*
${adminList}

🙌 ¡Gracias por su atención!
            `.trim();

            await venus.sendMessage(chatId, {
                text: message,
                mentions: admins.map(a => a.id)
            }, { quoted: m });

        } catch (error) {
            console.error("⚠️ Error en el comando /admin:", error);
            await venus.sendMessage(m.chat, {
                text: "⚠️ Ocurrió un error al intentar mencionar a los administradores.",
                mentions: [m.sender]
            }, { quoted: m });
        }
    }
};