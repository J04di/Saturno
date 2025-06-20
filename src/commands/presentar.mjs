import db from "../lib/database/lowdb.mjs";

export default {
    commands: ["presentar"],
    flags: ["isGroup"],
    handled: async (venus, { m, isAdmin, participants, metadata }) => {
        const groupId = m.chat;

        if (!isAdmin) {
            return await venus.sendMessage(groupId, {
                text: "❌ *Solo los administradores pueden usar este comando.*"
            }, { quoted: m });
        }

        // Inicializar estructura
        if (!db.data.groups) db.data.groups = {};
        if (!db.data.groups[groupId]) db.data.groups[groupId] = { members: {} };
        if (!db.data.groups[groupId].members) db.data.groups[groupId].members = {};

        const group = db.data.groups[groupId];

        // Detectar nuevos miembros
        const nuevosMiembros = participants
            .map(p => p.id)
            .filter(id => !(id in group.members));

        if (nuevosMiembros.length === 0) {
            return await venus.sendMessage(groupId, {
                text: "📢 *No hay nuevos miembros para presentar en este momento.*"
            }, { quoted: m });
        }

        // Registrar nuevos
        nuevosMiembros.forEach(id => group.members[id] = true);
        await db.write();

        const nombreGrupo = metadata?.subject || "el grupo";
        const mensajeBase = group.welcomeMessage || 
`━━━━━━━━━━━━━━━━━━━━━━━
🌟 *¡Bienvenid@s a ${nombreGrupo}!* 🌟
━━━━━━━━━━━━━━━━━━━━━━━

📣 ¡Nos alegra tenerlos aquí! Les damos una cálida bienvenida a esta comunidad llena de buena vibra, risas y momentos inolvidables.

✨ *Por favor, preséntense usando este formato:*
──────────────
📌 *Nombre:* (Tu apodo o nombre real)  
📌 *Edad:* (Tu edad actual)  
📌 *País:* (Desde dónde nos acompañas)  
📌 *Foto:* (¡Queremos ver tu carita linda!)  
──────────────

Recuerda que *participar es la clave* para disfrutar más del grupo. ¡No te quedes atrás!

━━━━━━━━━━━━━━━━━━━━━━━`;

        const listaMenciones = nuevosMiembros
            .map((id, i) => `⭐ *${i + 1}.* @${id.split("@")[0]}`)
            .join("\n");

        // Intentar obtener la imagen del grupo
        let groupImage;
        try {
            groupImage = await venus.profilePictureUrl(groupId, "image");
        } catch (e) {
            groupImage = null;
        }

        const mensajeFinal = {
            image: { url: groupImage || "https://i.imgur.com/Oy2L5lN.jpg" },
            caption:
`┏━━━━━━━━━━━━━━━┓
   *Nuevos miembros en ${nombreGrupo}*
┗━━━━━━━━━━━━━━━┛

${listaMenciones}

👤 *Presentador:* @${m.sender.split("@")[0]}

${mensajeBase}`,
            mentions: [...nuevosMiembros, m.sender]
        };

        await venus.sendMessage(groupId, mensajeFinal, { quoted: m });
    }
};