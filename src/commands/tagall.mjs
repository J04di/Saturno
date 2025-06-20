const cooldowns = new Map();

export default {
    commands: ["tagall", "invocar"],
    flags: ["isGroup"],
    handled: async (venus, { m, text }) => {
        try {
            const chatId = m.chat;
            const senderId = m.sender;

            // Obtener metadata del grupo
            const groupMetadata = await venus.groupMetadata(chatId);
            if (!groupMetadata || !groupMetadata.participants) {
                await venus.sendMessage(chatId, { text: "⚠️ No se pudo obtener la lista de participantes." }, { quoted: m });
                return;
            }

            // Verificar si el que ejecuta es admin o superadmin
            const participant = groupMetadata.participants.find(p => p.id === senderId);
            if (!participant || (participant.admin !== "admin" && participant.admin !== "superadmin")) {
                await venus.sendMessage(chatId, { text: "❌ Este comando solo puede ser usado por administradores." }, { quoted: m });
                return;
            }

            // Cooldown para evitar spam (5 minutos)
            const cooldownTime = 1 * 60 * 1000;
            if (cooldowns.has(chatId)) {
                const lastUsed = cooldowns.get(chatId);
                if (Date.now() - lastUsed < cooldownTime) {
                    const remainingTime = Math.ceil((cooldownTime - (Date.now() - lastUsed)) / 1000);
                    await venus.sendMessage(chatId, { text: `⏳ *Espera ${remainingTime} segundos antes de volver a usar este comando.*`, mentions: [senderId] }, { quoted: m });
                    return;
                }
            }
            cooldowns.set(chatId, Date.now());

            const groupName = groupMetadata.subject || "Grupo";
            const participants = groupMetadata.participants;

            // Excluir al bot de la lista
            const filteredParticipants = participants.filter(p => p.id !== venus.user.id);

            if (filteredParticipants.length === 0) {
                await venus.sendMessage(chatId, { text: "⚠️ No hay usuarios disponibles para mencionar.", mentions: [senderId] }, { quoted: m });
                return;
            }

            const caption = `
╔══════════════════════╗
║ 🪐 *MENSAJE MASIVO EN* 🪐 
║ 🔥 *${groupName.toUpperCase()}* 🔥
╚══════════════════════╝
📢 *Invocado por:* @${senderId.split("@")[0]}
📜 *Mensaje:* ${text || "No se especificó un mensaje"}

💬 *Participantes mencionados:*  
${filteredParticipants.map(v => "★ @" + v.id.split("@")[0]).join("\n")}

🚀 ¡Vamos con todo equipo! 🚀  
━━━━━━━━━━━━━━━━━━━━━━━
            `.trim();

            await venus.sendMessage(chatId, { text: caption, mentions: filteredParticipants.map(v => v.id) }, { quoted: m });

        } catch (error) {
            console.error("⚠️ Error en el comando tagall:", error);
            await venus.sendMessage(m.chat, { text: "⚠️ Ocurrió un error al invocar a los participantes.", mentions: [m.sender] }, { quoted: m });
        }
    }
};