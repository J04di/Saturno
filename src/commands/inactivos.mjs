import db from "../lib/database/lowdb.mjs";

export default {
    commands: ["inactivos"],
    flags: ["isGroup"],
    handled: async (venus, { m }) => {
        try {
            const chatId = m.chat;
            const senderId = m.sender;

            console.log("📌 Comando /inactivos recibido en:", chatId);

            // Obtener metadata del grupo
            const groupMetadata = await venus.groupMetadata(chatId);
            if (!groupMetadata || !groupMetadata.participants) {
                console.error("❌ No se pudo obtener la lista de participantes.");
                await venus.sendMessage(chatId, { text: "⚠️ No se pudo obtener la lista de participantes." }, { quoted: m });
                return;
            }

            // Verificar si el usuario que ejecuta es admin o superadmin
            const participant = groupMetadata.participants.find(p => p.id === senderId);
            if (!participant || (participant.admin !== "admin" && participant.admin !== "superadmin")) {
                await venus.sendMessage(chatId, { text: "❌ Este comando solo puede ser usado por administradores." }, { quoted: m });
                return;
            }

            const groupName = groupMetadata.subject;
            const participants = groupMetadata.participants.map(p => p.id);
            console.log("👥 Participantes del grupo:", participants);

            if (!db.data.users) db.data.users = {};

            // Obtener usuarios inactivos
            const inactivos = participants.filter(id => !db.data.users[id]);

            if (inactivos.length === 0) {
                console.log("✅ No hay usuarios inactivos.");
                await venus.sendMessage(chatId, { text: `✅ ¡No hay usuarios inactivos en *${groupName}*!` }, { quoted: m });
                return;
            }

            let mensaje = `📢 *Usuarios inactivos en ${groupName}:* \n\n` +
                inactivos.map(id => `👤 @${id.split("@")[0]}`).join("\n") + `\n\n📌 *Total de inactivos:* ${inactivos.length}`;

            if (inactivos.length >= 10) {
                mensaje += "\n🚨 Este grupo tiene demasiados inactivos. ¡Es hora de limpiar!";
            } else if (inactivos.length >= 5) {
                mensaje += "\n⚠️ Hay varios inactivos. ¡Activen la conversación!";
            } else {
                mensaje += "\n✅ La mayoría de los miembros están participando. ¡Bien hecho!";
            }

            await venus.sendMessage(chatId, { text: mensaje, mentions: inactivos }, { quoted: m });

        } catch (error) {
            console.error("❌ Error en el comando /inactivos:", error);
            await venus.sendMessage(m.chat, { text: "⚠️ Ocurrió un error al ejecutar el comando." }, { quoted: m });
        }
    }
};