import { sticker } from "../lib/tools.mjs";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
export default {
    commands: ["s", "sticker"],
    flags: [],
    handled: async (venus, { m }) => {
        const mimetype = m.mimetype || m.quoted?.mimetype || null;
        if (!mimetype) {
            await venus.sendMessage(m.chat, { text: "Responde a una imágen o video para convertir en sticker", mentions: [m.sender] }, { quoted: m });
            return;
        }
        if (!/^(video|image)/.test(mimetype)) {
            await venus.sendMessage(m.chat, { text: `El tipo de mime *${mimetype}* no es compatible`, mentions: [m.sender] }, { quoted: m });
            return;
        }
        const buffer = await downloadMediaMessage(m.quoted ?? m, "buffer", {});
        const result = await sticker(buffer);
        await venus.sendMessage(m.chat, { sticker: result, mentions: [m.sender] }, { quoted: m });
    }
}